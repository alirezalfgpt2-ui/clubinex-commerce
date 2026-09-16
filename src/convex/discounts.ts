import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("discounts").order("desc").collect();
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (!result) return null;
    const now = Date.now();
    if (!result.isActive || result.endDate < now) return null;
    if (result.usageLimit && result.usedCount >= result.usageLimit) return null;
    return result;
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.number(),
    usageLimit: v.optional(v.number()),
    productId: v.optional(v.id("products")),
    categoryId: v.optional(v.id("categories")),
    targetUserIds: v.optional(v.array(v.id("users"))),
    volumeDiscounts: v.optional(v.array(v.object({
      minQuantity: v.number(),
      discountPercent: v.number(),
    }))),
    discountType: v.optional(v.union(
      v.literal("general"),
      v.literal("welcome"),
      v.literal("birthday"),
      v.literal("loyalty"),
      v.literal("volume"),
    )),
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
    if (existing) throw new Error("Discount code already exists");

    return await ctx.db.insert("discounts", {
      ...args,
      code: args.code.toUpperCase(),
      usedCount: 0,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    discountId: v.id("discounts"),
    code: v.optional(v.string()),
    type: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    value: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { discountId, ...updates } = args;
    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) data[key] = value;
    }
    await ctx.db.patch(discountId, data);
  },
});

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

export const applyDiscount = mutation({
  args: { discountId: v.id("discounts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.discountId, {
      usedCount: (await ctx.db.get(args.discountId))?.usedCount! + 1,
    });
  },
});

/**
 * Validate a discount code with support for:
 * - Target users
 * - Volume discounts
 * - Discount type (welcome, birthday, loyalty)
 */
export const validateCode = mutation({
  args: {
    code: v.string(),
    orderAmount: v.number(),
    totalQuantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const discount = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!discount) throw new Error("کد تخفیف نامعتبر است.");
    if (!discount.isActive) throw new Error("کد تخفیف غیرفعال است.");

    const now = Date.now();
    if (now < discount.startDate) throw new Error("کد تخفیف هنوز فعال نشده است.");
    if (now > discount.endDate) throw new Error("کد تخفیف منقضی شده است.");
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) throw new Error("حداکثر استفاده از کد تخفیف رسیده.");
    if (discount.minOrderAmount && args.orderAmount < discount.minOrderAmount) {
      throw new Error(`حداقل مبلغ سفارش ${discount.minOrderAmount.toLocaleString("fa-IR")} تومان است.`);
    }

    // Check target users
    if (discount.targetUserIds && discount.targetUserIds.length > 0 && userId) {
      if (!discount.targetUserIds.includes(userId)) {
        throw new Error("این کد تخفیف فقط برای کاربران خاصی قابل استفاده است.");
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = Math.round((args.orderAmount * discount.value) / 100);
      if (discount.maxDiscount) discountAmount = Math.min(discountAmount, discount.maxDiscount);
    } else if (discount.type === "fixed") {
      discountAmount = discount.value;
    }

    // Volume discount bonus
    if (discount.volumeDiscounts && discount.volumeDiscounts.length > 0 && args.totalQuantity) {
      const sortedTiers = [...discount.volumeDiscounts].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const tier of sortedTiers) {
        if (args.totalQuantity >= tier.minQuantity) {
          const volumeDiscount = Math.round((args.orderAmount * tier.discountPercent) / 100);
          discountAmount = Math.max(discountAmount, volumeDiscount);
          break;
        }
      }
    }

    discountAmount = Math.min(discountAmount, args.orderAmount);

    return {
      discountId: discount._id,
      code: discount.code,
      discountAmount,
      type: discount.type,
      value: discount.value,
    };
  },
});
