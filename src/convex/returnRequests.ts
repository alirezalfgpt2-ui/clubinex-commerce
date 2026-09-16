import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** User creates a return request */
export const create = mutation({
  args: {
    orderId: v.id("orders"),
    productId: v.id("products"),
    reason: v.string(),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("Unauthorized");

    // Check if order was delivered within last 7 days
    if (order.status !== "delivered") {
      throw new Error("فقط سفارشات تحویل شده قابل مرجوعی هستند");
    }
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - order.updatedAt > sevenDaysMs) {
      throw new Error("مهلت مرجوعی ۷ روز پس از تحویل به پایان رسیده است");
    }

    // Check product exists in order
    const hasProduct = order.items.some((i) => i.productId === args.productId);
    if (!hasProduct) throw new Error("این محصول در سفارش مورد نظر وجود ندارد");

    // Check duplicate
    const existing = await ctx.db
      .query("returnRequests")
      .filter((q) =>
        q.and(
          q.eq(q.field("orderId"), args.orderId),
          q.eq(q.field("productId"), args.productId),
          q.eq(q.field("userId"), userId),
          q.neq(q.field("status"), "rejected"),
        ),
      )
      .first();
    if (existing) throw new Error("درخواست مرجوعی برای این محصول قبلا ثبت شده است");

    return await ctx.db.insert("returnRequests", {
      orderId: args.orderId,
      userId,
      productId: args.productId,
      reason: args.reason,
      images: args.images ?? [],
      status: "pending",
      adminNote: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/** List user's return requests */
export const listMyReturns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("returnRequests")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

/** Admin: list all return requests */
export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("refunded"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "manager")) return [];

    let q = ctx.db.query("returnRequests").order("desc");
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await q.collect();
  },
});

/** Get return request by ID */
export const getById = query({
  args: { requestId: v.id("returnRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "manager")) return null;
    return await ctx.db.get(args.requestId);
  },
});

/** Admin: update return request status */
export const updateStatus = mutation({
  args: {
    requestId: v.id("returnRequests"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("refunded"),
    ),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Return request not found");

    await ctx.db.patch(args.requestId, {
      status: args.status,
      adminNote: args.adminNote ?? request.adminNote,
      updatedAt: Date.now(),
    });

    // If approved, also update the order status and refund
    if (args.status === "refunded") {
      await ctx.db.patch(request.orderId, {
        paymentStatus: "refunded",
        status: "cancelled",
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
