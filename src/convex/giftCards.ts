import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Create a new coupon / gift card */
export const create = mutation({
  args: {
    code: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed"), v.literal("gift_card")),
    value: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (existing) throw new Error("کد تخفیف/کارت هدیه تکراری است.");

    return await ctx.db.insert("discounts", {
      code: args.code.toUpperCase(),
      type: args.type,
      value: args.value,
      minOrderAmount: args.minOrderAmount,
      maxDiscount: args.maxDiscount,
      usageLimit: args.usageLimit,
      usedCount: 0,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/** Validate and apply a coupon / gift card */
export const validate = mutation({
  args: { code: v.string(), orderAmount: v.number() },
  handler: async (ctx, args) => {
    const discount = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!discount) throw new Error("کد وارد شده معتبر نیست.");
    if (!discount.isActive) throw new Error("این کد غیرفعال است.");
    if (discount.endDate && Date.now() > discount.endDate)
      throw new Error("این کد منقضی شده است.");
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit)
      throw new Error("این کد به حداکثر استفاده رسیده است.");
    if (discount.minOrderAmount && args.orderAmount < discount.minOrderAmount)
      throw new Error(`حداقل مبلغ سفارش برای این کد ${discount.minOrderAmount.toLocaleString("fa-IR")} تومان است.`);

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = Math.round((args.orderAmount * discount.value) / 100);
      if (discount.maxDiscount) discountAmount = Math.min(discountAmount, discount.maxDiscount);
    } else {
      discountAmount = Math.min(discount.value, args.orderAmount);
    }

    await ctx.db.patch(discount._id, {
      usedCount: discount.usedCount + 1,
    });

    return { discountAmount, code: discount.code, type: discount.type };
  },
});

/** List all coupons/gift cards */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("discounts").order("desc").collect();
  },
});

/** Delete a coupon/gift card */
export const remove = mutation({
  args: { discountId: v.id("discounts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.discountId);
  },
});

/** Toggle active status */
export const toggleActive = mutation({
  args: { discountId: v.id("discounts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    const item = await ctx.db.get(args.discountId);
    if (!item) throw new Error("Not found");
    await ctx.db.patch(args.discountId, { isActive: !item.isActive });
  },
});
