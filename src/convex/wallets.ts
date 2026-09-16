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
