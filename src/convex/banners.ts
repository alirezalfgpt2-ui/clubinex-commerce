import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listActive = query({
  args: { position: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("banners").withIndex("by_isActive", (q) => q.eq("isActive", true));
    if (args.position) {
      q = q.filter((q) => q.eq(q.field("position"), args.position));
    }
    return await q.collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager") throw new Error("Unauthorized");
    return await ctx.db.query("banners").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    imageUrl: v.string(),
    link: v.string(),
    position: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager") throw new Error("Unauthorized");

    return await ctx.db.insert("banners", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    bannerId: v.id("banners"),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    link: v.optional(v.string()),
    position: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager") throw new Error("Unauthorized");

    const { bannerId, ...updates } = args;
    await ctx.db.patch(bannerId, updates);
  },
});

export const remove = mutation({
  args: { bannerId: v.id("banners") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    
    await ctx.db.delete(args.bannerId);
  },
});
