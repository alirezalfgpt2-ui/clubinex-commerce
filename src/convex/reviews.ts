import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_product_approved", (q) =>
        q.eq("productId", args.productId).eq("isApproved", true)
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    title: v.optional(v.string()),
    comment: v.optional(v.string()),
    pros: v.optional(v.array(v.string())),
    cons: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be between 1 and 5");

    // Check if user is buyer
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    let isBuyer = false;
    for (const order of orders) {
      if (order.status === "delivered" && order.items.some(i => i.productId === args.productId)) {
        isBuyer = true;
        break;
      }
    }

    const now = Date.now();
    const reviewId = await ctx.db.insert("reviews", {
      userId,
      ...args,
      isBuyer,
      status: "approved", // for simplicity
      isApproved: true, // Auto-approve for now
      createdAt: now,
    });

    // Update product rating
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_approved", (q) =>
        q.eq("productId", args.productId).eq("isApproved", true)
      )
      .collect();
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    await ctx.db.patch(args.productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
      updatedAt: now,
    });

    return reviewId;
  },
});

/** Like / unlike a review */
export const toggleLike = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    await ctx.db.patch(args.reviewId, {
      likesCount: (review.likesCount ?? 0) + 1,
    });
  },
});

/** Admin: list all reviews */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "manager")) return [];
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

export const remove = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    if (review.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.reviewId);
  },
});

/** Admin: update review status */
export const updateStatus = mutation({
  args: {
    reviewId: v.id("reviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.patch(args.reviewId, { status: args.status, isApproved: args.status === "approved" } as any);
    return { success: true };
  },
});
