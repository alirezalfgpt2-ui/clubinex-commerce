import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Admin: register a vendor (or user applies to become a seller) */
export const register = mutation({
  args: {
    storeName: v.string(),
    contactName: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    commissionRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("vendors", {
      userId,
      storeName: args.storeName,
      contactName: args.contactName,
      phone: args.phone,
      address: args.address,
      commissionRate: args.commissionRate ?? 10,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/** Admin: update vendor details */
export const update = mutation({
  args: {
    vendorId: v.id("vendors"),
    storeName: v.optional(v.string()),
    contactName: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    commissionRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (args.storeName !== undefined) patch.storeName = args.storeName;
    if (args.contactName !== undefined) patch.contactName = args.contactName;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.address !== undefined) patch.address = args.address;
    if (args.commissionRate !== undefined) patch.commissionRate = args.commissionRate;

    await ctx.db.patch(args.vendorId, patch);
    return { success: true };
  },
});

/** Admin: remove a vendor */
export const remove = mutation({
  args: {
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.delete(args.vendorId);
    return { success: true };
  },
});

/** Get current user's vendor profile */
export const getMyVendor = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("vendors")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});

/** Get vendor by ID */
export const getById = query({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.vendorId);
  },
});

/** Admin: list all vendors */
export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("pending"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") return [];

    let q = ctx.db.query("vendors").order("desc");
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await q.collect();
  },
});

/** Admin: update vendor status (approve / suspend) */
export const updateStatus = mutation({
  args: {
    vendorId: v.id("vendors"),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("pending"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.patch(args.vendorId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

/** Admin: update vendor commission rate */
export const updateCommission = mutation({
  args: {
    vendorId: v.id("vendors"),
    commissionRate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.patch(args.vendorId, {
      commissionRate: args.commissionRate,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

/** List products by a vendor */
export const listProducts = query({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("vendorId"), args.vendorId))
      .order("desc")
      .collect();
  },
});
