import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateOrderNumber(): string {
  const now = new Date();
  const prefix = "ORD";
  const date = now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}${date}${random}`;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

/** لیست صفحه‌بندی شده سفارشات */
export const listPaginated = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    let q = ctx.db.query("orders").order("desc");
    if (args.cursor) {
      q = q.filter((idx) => idx.gt(idx.field("_creationTime"), Number(args.cursor)));
    }
    const fetchLimit = args.search ? limit * 3 : limit + 1;
    const results = await q.take(fetchLimit);
    let filtered = results;
    if (args.search) {
      const sq = args.search.toLowerCase();
      filtered = results.filter((o) =>
        (o.orderNumber || "").toLowerCase().includes(sq) ||
        (o.address || "").toLowerCase().includes(sq)
      );
    }
    const sliced = filtered.slice(0, limit);
    const hasMore = filtered.length > limit;
    return {
      results: sliced,
      nextCursor: hasMore && sliced.length > 0 ? String(sliced[sliced.length - 1]._creationTime) : undefined,
      hasMore,
      totalEstimate: await ctx.db.query("orders").collect().then((all) => all.length),
    };
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

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .first();
    return result;
  },
});

export const create = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        total: v.number(),
      })
    ),
    subtotal: v.number(),
    tax: v.number(),
    shippingCost: v.number(),
    discount: v.number(),
    total: v.number(),
    paymentMethod: v.string(),
    shippingMethod: v.string(),
    address: v.string(),
    postalCode: v.string(),
    notes: v.optional(v.string()),
    receiveSms: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const orderNumber = generateOrderNumber();
    const now = Date.now();

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity)
        throw new Error(`Insufficient stock for ${product.name}`);
      await ctx.db.patch(item.productId, {
        stock: product.stock - item.quantity,
        updatedAt: now,
      });
    }

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId,
      items: args.items,
      subtotal: args.subtotal,
      tax: args.tax,
      shippingCost: args.shippingCost,
      discount: args.discount,
      total: args.total,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: args.paymentMethod,
      shippingMethod: args.shippingMethod,
      address: args.address,
      postalCode: args.postalCode,
      notes: args.notes,
      receiveSms: args.receiveSms,
      createdAt: now,
      updatedAt: now,
    });

    // Clear cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const ci of cartItems) {
      await ctx.db.delete(ci._id);
    }

    // Notify user about their order
    await ctx.db.insert("notifications", {
      userId,
      title: "سفارش ثبت شد",
      message: `سفارش ${orderNumber} با موفقیت ثبت شد. مبلغ: ${args.total.toLocaleString("fa-IR")} تومان`,
      type: "order",
      isRead: false,
      createdAt: now,
    });

    // Notify all admins/managers
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.gte("role", "admin"))
      .collect();
    for (const admin of admins) {
      if (admin._id !== userId) {
        await ctx.db.insert("notifications", {
          userId: admin._id,
          title: "سفارش جدید",
          message: `سفارش جدید ${orderNumber} ثبت شد. مبلغ: ${args.total.toLocaleString("fa-IR")} تومان`,
          type: "order",
          isRead: false,
          createdAt: now,
        });
      }
    }

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    trackingCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");

    const data: Record<string, any> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.trackingCode) data.trackingCode = args.trackingCode;
    if (args.status === "paid") data.paymentStatus = "paid";
    await ctx.db.patch(args.orderId, data);
  },
});

/** Process a refund for an order */
export const processRefund = mutation({
  args: {
    orderId: v.id("orders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.paymentStatus !== "paid") throw new Error("فقط سفارشات پرداخت شده قابل بازپرداخت هستند.");

    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      paymentStatus: "refunded",
      status: "cancelled",
      notes: args.reason ? `بازپرداخت: ${args.reason}` : "بازپرداخت توسط ادمین",
      updatedAt: now,
    });

    // Restore stock
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
          updatedAt: now,
        });
      }
    }

    // Notify user
    await ctx.db.insert("notifications", {
      userId: order.userId,
      title: "بازپرداخت سفارش",
      message: `سفارش ${order.orderNumber} بازپرداخت شد. مبلغ: ${order.total.toLocaleString("fa-IR")} تومان`,
      type: "payment",
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});

export const confirmDelivery = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("Unauthorized");
    if (order.status !== "shipped") throw new Error("سفارش هنوز ارسال نشده است.");

    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      status: "delivered",
      updatedAt: now,
    });

    // Notify admins
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.gte("role", "admin"))
      .collect();
    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        title: "تحویل سفارش",
        message: `سفارش ${order.orderNumber} توسط مشتری تایید تحویل شد.`,
        type: "order",
        isRead: false,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/** Verify payment callback and update order */
export const verifyPayment = mutation({
  args: {
    orderNumber: v.string(),
    transactionId: v.string(),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .first();
    if (!order) throw new Error("Order not found");

    const now = Date.now();
    if (args.success) {
      await ctx.db.patch(order._id, {
        paymentStatus: "paid",
        status: "paid",
        transactionId: args.transactionId,
        updatedAt: now,
      });

      // Notify user about successful payment
      await ctx.db.insert("notifications", {
        userId: order.userId,
        title: "پرداخت موفق",
        message: `پرداخت سفارش ${order.orderNumber} با موفقیت انجام شد.`,
        type: "payment",
        isRead: false,
        createdAt: now,
      });
    } else {
      await ctx.db.patch(order._id, {
        paymentStatus: "failed",
        updatedAt: now,
      });

      // Restore stock for failed payment
      for (const item of order.items) {
        const product = await ctx.db.get(item.productId);
        if (product) {
          await ctx.db.patch(item.productId, {
            stock: product.stock + item.quantity,
            updatedAt: now,
          });
        }
      }

      // Notify user about failed payment
      await ctx.db.insert("notifications", {
        userId: order.userId,
        title: "پرداخت ناموفق",
        message: `پرداخت سفارش ${order.orderNumber} ناموفق بود. لطفاً دوباره تلاش کنید.`,
        type: "payment",
        isRead: false,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const deliveredOrders = orders.filter(
      (o) => o.status === "delivered"
    ).length;
    const totalOrders = orders.length;
    return { totalRevenue, pendingOrders, deliveredOrders, totalOrders };
  },
});

/** آمار مالی کامل — درآمد، مالیات، ارسال، تخفیف، بازپرداخت */
export const getFinancialStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const refundedOrders = orders.filter((o) => o.paymentStatus === "refunded");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");

    const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
    const totalTax = paidOrders.reduce((s, o) => s + (o.tax || 0), 0);
    const totalShipping = paidOrders.reduce((s, o) => s + (o.shippingCost || 0), 0);
    const totalDiscount = paidOrders.reduce((s, o) => s + (o.discount || 0), 0);
    const totalRefunds = refundedOrders.reduce((s, o) => s + o.total, 0);
    const totalSubtotal = paidOrders.reduce((s, o) => s + (o.subtotal || 0), 0);

    // درآمد روزانه — ۷ روز اخیر
    const now = Date.now();
    const dailyRevenue: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i + 1) * 86400000;
      const dayEnd = now - i * 86400000;
      const dayLabel = new Date(dayEnd).toLocaleDateString("fa-IR", { weekday: "short" });
      const dayAmount = paidOrders
        .filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
        .reduce((s, o) => s + o.total, 0);
      dailyRevenue.push({ date: dayLabel, amount: dayAmount });
    }

    // وضعیت سفارشات
    const statusBreakdown = [
      { label: "در انتظار", count: orders.filter((o) => o.status === "pending").length, color: "bg-amber-500" },
      { label: "پرداخت شده", count: orders.filter((o) => o.status === "paid").length, color: "bg-sky-500" },
      { label: "در حال پردازش", count: orders.filter((o) => o.status === "processing").length, color: "bg-indigo-500" },
      { label: "ارسال شده", count: orders.filter((o) => o.status === "shipped").length, color: "bg-purple-500" },
      { label: "تحویل شده", count: orders.filter((o) => o.status === "delivered").length, color: "bg-emerald-500" },
      { label: "لغو شده", count: cancelledOrders.length, color: "bg-rose-500" },
    ];

    // میانگین ارزش سفارش
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // نرخ بازپرداخت
    const refundRate = orders.length > 0 ? Math.round((refundedOrders.length / orders.length) * 100) : 0;

    return {
      totalRevenue, totalSubtotal, totalTax, totalShipping, totalDiscount, totalRefunds,
      dailyRevenue, statusBreakdown, avgOrderValue, refundRate,
      paidCount: paidOrders.length, refundedCount: refundedOrders.length, cancelledCount: cancelledOrders.length,
    };
  },
});
