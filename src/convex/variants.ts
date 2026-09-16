import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
  }
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    type: v.string(),
    name: v.string(),
    value: v.optional(v.string()),
    additionalPrice: v.optional(v.number()),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager") throw new Error("Unauthorized");
    
    return await ctx.db.insert("productVariants", {
      productId: args.productId,
      type: args.type,
      value: args.name, // The schema has value (string) as name
      colorCode: args.value, // The schema has colorCode instead of value
      priceAdjustment: args.additionalPrice || 0, // The schema has priceAdjustment
      stock: args.stock,
      sku: args.type + "-" + args.name
    });
  }
});

export const update = mutation({
  args: {
    variantId: v.id("productVariants"),
    type: v.optional(v.string()),
    name: v.optional(v.string()),
    value: v.optional(v.string()),
    additionalPrice: v.optional(v.number()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager") throw new Error("Unauthorized");

    const updates: any = {};
    if (args.type !== undefined) updates.type = args.type;
    if (args.name !== undefined) updates.value = args.name;
    if (args.value !== undefined) updates.colorCode = args.value;
    if (args.additionalPrice !== undefined) updates.priceAdjustment = args.additionalPrice;
    if (args.stock !== undefined) updates.stock = args.stock;

    await ctx.db.patch(args.variantId, updates);
  }
});

export const remove = mutation({
  args: { variantId: v.id("productVariants") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager") throw new Error("Unauthorized");

    await ctx.db.delete(args.variantId);
  }
});

/** Admin: list all variants */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("productVariants").collect();
  },
});
