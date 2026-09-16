import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});

export const ask = mutation({
  args: {
    productId: v.id("products"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("questions", {
      productId: args.productId,
      userId,
      content: args.content,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const answer = mutation({
  args: {
    questionId: v.id("questions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    const isStoreAdmin = user?.role === "admin" || user?.role === "manager";

    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const newAnswer = {
      userId,
      content: args.content,
      createdAt: Date.now(),
      isStoreAdmin,
    };

    const answers = question.answers ? [...question.answers, newAnswer] : [newAnswer];
    await ctx.db.patch(args.questionId, { answers, status: "answered" });
  },
});
