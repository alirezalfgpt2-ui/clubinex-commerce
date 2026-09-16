import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Get user's total loyalty points balance */
export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const records = await ctx.db
      .query("loyaltyPoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return records.reduce((sum, r) => sum + r.points, 0);
  },
});

/** Get user's loyalty points history */
export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("loyaltyPoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/** Award points to a user (admin or system) */
export const award = mutation({
  args: {
    userId: v.id("users"),
    points: v.number(),
    reason: v.string(),
    orderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("loyaltyPoints", {
      userId: args.userId,
      points: args.points,
      reason: args.reason,
      orderId: args.orderId,
      createdAt: Date.now(),
    });
  },
});

/** Spend points (reduce balance) */
export const spend = mutation({
  args: {
    points: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check balance
    const records = await ctx.db
      .query("loyaltyPoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const balance = records.reduce((sum, r) => sum + r.points, 0);
    if (balance < args.points) throw new Error(`موجودی امتیاز کافی نیست. موجودی: ${balance}`);

    await ctx.db.insert("loyaltyPoints", {
      userId,
      points: -args.points,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

/** Convert points to discount (100 points = 1000 Tomans) */
export const convertToDiscount = mutation({
  args: { points: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const records = await ctx.db
      .query("loyaltyPoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const balance = records.reduce((sum, r) => sum + r.points, 0);
    if (balance < args.points) throw new Error(`موجودی امتیاز کافی نیست. موجودی: ${balance}`);

    const discountAmount = args.points * 10; // 1 point = 10 Tomans

    // Spend points
    await ctx.db.insert("loyaltyPoints", {
      userId,
      points: -args.points,
      reason: `تبدیل ${args.points} امتیاز به تخفیف ${discountAmount.toLocaleString("fa-IR")} تومان`,
      createdAt: Date.now(),
    });

    return { discountAmount, pointsSpent: args.points };
  },
});

/** Award points for an order (called after order creation) */
export const awardForOrder = mutation({
  args: {
    orderId: v.id("orders"),
    orderTotal: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    // 1 point per 10,000 Tomans spent
    const points = Math.floor(args.orderTotal / 10000);
    if (points <= 0) return;

    await ctx.db.insert("loyaltyPoints", {
      userId,
      points,
      reason: `امتیاز خرید سفارش به مبلغ ${args.orderTotal.toLocaleString("fa-IR")} تومان`,
      orderId: args.orderId,
      createdAt: Date.now(),
    });
  },
});
