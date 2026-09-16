import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMyWallet = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return wallet;
  },
});

export const getMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!wallet) return [];
    
    return await ctx.db
      .query("walletTransactions")
      .withIndex("by_wallet", (q) => q.eq("walletId", wallet._id))
      .order("desc")
      .collect();
  },
});

export const addBalance = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!wallet) {
      const id = await ctx.db.insert("wallets", { userId, balance: 0, points: 0 });
      wallet = (await ctx.db.get(id)) as any;
    }
    
    await ctx.db.patch(wallet!._id, { balance: wallet!.balance + args.amount });
    await ctx.db.insert("walletTransactions", {
      walletId: wallet!._id,
      amount: args.amount,
      type: "deposit",
      description: "افزایش موجودی کیف پول",
      createdAt: Date.now(),
    });
  }
});

/** Admin: adjust balance for any user */
export const adminAdjustBalance = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");
    const admin = await ctx.db.get(adminId);
    if (!admin || admin.role !== "admin") throw new Error("Unauthorized");

    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!wallet) {
      const id = await ctx.db.insert("wallets", { userId: args.userId, balance: 0, points: 0 });
      wallet = (await ctx.db.get(id)) as any;
    }

    await ctx.db.patch(wallet!._id, { balance: wallet!.balance + args.amount });
    await ctx.db.insert("walletTransactions", {
      walletId: wallet!._id,
      amount: args.amount,
      type: args.amount >= 0 ? "deposit" : "withdrawal",
      description: args.description || (args.amount >= 0 ? "افزایش موجودی توسط ادمین" : "کاهش موجودی توسط ادمین"),
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

/** Admin: list all wallets */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("wallets").collect();
  },
});
