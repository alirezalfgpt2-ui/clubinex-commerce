import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List all warehouses */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("warehouses").order("desc").collect();
  },
});

/** List active warehouses */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("warehouses")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

/** Get warehouse by ID */
export const getById = query({
  args: { warehouseId: v.id("warehouses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.warehouseId);
  },
});

/** Create warehouse (admin) */
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    managerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    // Check unique code
    const existing = await ctx.db
      .query("warehouses")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (existing) throw new Error("کد انبار تکراری است");

    return await ctx.db.insert("warehouses", {
      name: args.name,
      code: args.code,
      address: args.address,
      phone: args.phone,
      managerId: args.managerId,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/** Update warehouse (admin) */
export const update = mutation({
  args: {
    warehouseId: v.id("warehouses"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    managerId: v.optional(v.id("users")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const { warehouseId, ...updates } = args;
    await ctx.db.patch(warehouseId, { ...updates, updatedAt: Date.now() });
    return { success: true };
  },
});

/** Delete warehouse (admin) */
export const remove = mutation({
  args: { warehouseId: v.id("warehouses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    // Check if warehouse has inventory
    const inv = await ctx.db
      .query("inventory")
      .withIndex("by_warehouse", (q) => q.eq("warehouseId", args.warehouseId))
      .first();
    if (inv) throw new Error("انبار دارای موجودی است و قابل حذف نیست");

    await ctx.db.delete(args.warehouseId);
    return { success: true };
  },
});
