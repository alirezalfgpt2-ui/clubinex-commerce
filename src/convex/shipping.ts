import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shippingMethods").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("shippingMethods")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    nameFa: v.string(),
    type: v.union(
      v.literal("pickup"),
      v.literal("post"),
      v.literal("courier"),
      v.literal("express")
    ),
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
    cost: v.number(),
    freeShippingMinAmount: v.optional(v.number()),
    regions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Development mode: allow any authenticated user
    return await ctx.db.insert("shippingMethods", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    shippingId: v.id("shippingMethods"),
    name: v.optional(v.string()),
    nameFa: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("pickup"),
      v.literal("post"),
      v.literal("courier"),
      v.literal("express")
    )),
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
    cost: v.optional(v.number()),
    freeShippingMinAmount: v.optional(v.number()),
    regions: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { shippingId, ...updates } = args;
    await ctx.db.patch(shippingId, updates);
  },
});

export const remove = mutation({
  args: { shippingId: v.id("shippingMethods") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Development mode: allow any authenticated user
    await ctx.db.delete(args.shippingId);
  },
});
