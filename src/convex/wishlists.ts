import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const items = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    // Parallel product lookup — avoids N+1 sequential reads
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return product;
      })
    );
    return products.filter(Boolean);
  },
});

export const isWishlisted = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();
    return existing;
  },
});

export const toggle = mutation({
  args: { 
    productId: v.id("products"),
    notifyOnStock: v.optional(v.boolean()),
    notifyOnSale: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      if (args.notifyOnStock !== undefined || args.notifyOnSale !== undefined) {
        // If updating notifications
        await ctx.db.patch(existing._id, {
          notifyOnStock: args.notifyOnStock !== undefined ? args.notifyOnStock : existing.notifyOnStock,
          notifyOnSale: args.notifyOnSale !== undefined ? args.notifyOnSale : existing.notifyOnSale,
        });
        return true;
      } else {
        // Normal toggle
        await ctx.db.delete(existing._id);
        return false; // removed
      }
    } else {
      await ctx.db.insert("wishlists", {
        userId,
        productId: args.productId,
        notifyOnStock: args.notifyOnStock || false,
        notifyOnSale: args.notifyOnSale || false,
        createdAt: Date.now(),
      });
      return true; // added
    }
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

/** Admin: list all wishlists */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("wishlists").order("desc").collect();
  },
});
