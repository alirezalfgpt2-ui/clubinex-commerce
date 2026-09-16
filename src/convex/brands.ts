import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brands").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brands").withIndex("by_isActive", (q) => q.eq("isActive", true)).collect();
  },
});

export const create = mutation({
  args: { name: v.string(), description: v.optional(v.string()), logo: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("brands", {
      name: args.name,
      slug: args.name.toLowerCase().replace(/\s+/g, "-"),
      description: args.description,
      logo: args.logo,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { brandId, ...updates } = args;
    await ctx.db.patch(brandId, { ...updates, updatedAt: Date.now() } as any);
  },
});

export const remove = mutation({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.brandId);
  },
});
