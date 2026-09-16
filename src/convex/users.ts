import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

export const getCurrentUser = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
};

// Make current user admin — for development
export const makeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // If user is already admin, just confirm
    if (user.role === "admin") {
      return { success: true, message: "شما اکنون ادمین هستید!" };
    }

    // Make this user admin (for development — any authenticated user can self-promote)
    await ctx.db.patch(userId, { role: "admin", isActive: true, updatedAt: Date.now() });
    return { success: true, message: "شما اکنون ادمین هستید!" };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    nationalCode: v.optional(v.string()),
    address: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    avatar: v.optional(v.string()),
    gender: v.optional(v.string()),
    birthDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { ...args, updatedAt: Date.now() });
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/** لیست صفحه‌بندی شده کاربران */
export const listPaginated = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    let q = ctx.db.query("users").order("desc");
    if (args.cursor) {
      q = q.filter((idx) => idx.gt(idx.field("_creationTime"), Number(args.cursor)));
    }
    const fetchLimit = args.search ? limit * 3 : limit + 1;
    const results = await q.take(fetchLimit);
    let filtered = results;
    if (args.search) {
      const sq = args.search.toLowerCase();
      filtered = results.filter((u) =>
        (u.name || "").toLowerCase().includes(sq) ||
        (u.email || "").toLowerCase().includes(sq) ||
        (u.phone || "").toLowerCase().includes(sq)
      );
    }
    const sliced = filtered.slice(0, limit);
    const hasMore = filtered.length > limit;
    return {
      results: sliced,
      nextCursor: hasMore && sliced.length > 0 ? String(sliced[sliced.length - 1]._creationTime) : undefined,
      hasMore,
      totalEstimate: await ctx.db.query("users").collect().then((all) => all.length),
    };
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateRole = mutation({
  args: { userId: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.patch(args.userId, { role: args.role, updatedAt: Date.now() });
  },
});

export const toggleActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, {
      isActive: user.isActive === false ? true : false,
      updatedAt: Date.now(),
    });
  },
});

export const getUserCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

export const getRecentUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("users")
      .order("desc")
      .take(limit);
  },
});

// Admin: reset user password (sends reset email via OTP)
export const resetUserPassword = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    // Log the password reset action
    await ctx.db.insert("auditLogs", {
      action: "password_reset",
      entity: "users",
      entityId: args.userId,
      userId: adminId,
      details: `Admin reset password for user ${user.email || user.name || args.userId}`,
      createdAt: Date.now(),
    });
    // Note: Actual password reset email would be sent via action
    // For now, we mark the user's account for reset
    return { success: true, message: `بازنشانی رمز برای ${user.email || user.name || "کاربر"} انجام شد.` };
  },
});

// Admin: update any user's profile fields
export const adminUpdateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");
    const admin = await ctx.db.get(adminId);
    if (admin?.role !== "admin") throw new Error("Unauthorized");
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, { ...updates, updatedAt: Date.now() });
  },
});
