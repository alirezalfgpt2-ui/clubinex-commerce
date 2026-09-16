import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return result?.value ?? null;
  },
});

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const results = await ctx.db
      .query("settings")
      .collect();
    const publicSettings = results.filter((s) => s.isPublic);
    const mapped: Record<string, any> = {};
    for (const s of publicSettings) {
      mapped[s.key] = s.value;
    }
    return mapped;
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    category: v.string(),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Unauthorized: only admins can modify settings");

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        isPublic: args.isPublic ?? existing.isPublic,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("settings", {
        key: args.key,
        value: args.value,
        category: args.category,
        isPublic: args.isPublic ?? false,
        updatedAt: Date.now(),
      });
    }
  },
});

export const listLicenses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("licenses").collect();
  },
});

export const createLicense = mutation({
  args: {
    key: v.string(),
    type: v.union(v.literal("monthly"), v.literal("yearly"), v.literal("permanent")),
    expiryDate: v.optional(v.number()),
    isActive: v.boolean(),
    features: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    return await ctx.db.insert("licenses", { ...args, createdAt: Date.now(), updatedAt: Date.now() });
  },
});
