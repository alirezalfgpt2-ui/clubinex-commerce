import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** بررسی فعال بودن نوع اعلان از تنظیمات */
async function isNotificationEnabled(ctx: any, type: string): Promise<boolean> {
  const setting = await ctx.db
    .query("settings")
    .withIndex("by_key", (q: any) => q.eq("key", `notif_${type}`))
    .first();
  // اگر تنظیمات وجود نداشته باشد، پیش‌فرض فعال است
  return setting?.value !== false;
}

/** بررسی آستانه موجودی کم از تنظیمات */
async function getLowStockThreshold(ctx: any): Promise<number> {
  const setting = await ctx.db
    .query("settings")
    .withIndex("by_key", (q: any) => q.eq("key", "lowStockThreshold"))
    .first();
  return Number(setting?.value) || 5;
}

// Check for products with low stock and create notifications
export const checkLowStock = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // بررسی فعال بودن اعلان موجودی کم
    if (!(await isNotificationEnabled(ctx, "low_stock"))) return { notificationsCreated: 0 };

    const threshold = await getLowStockThreshold(ctx);

    const products = await ctx.db.query("products").collect();
    let notificationsCreated = 0;

    for (const product of products) {
      if (product.stock > 0 && product.stock <= (product.stockAlert || threshold)) {
        // Check if we already have a recent notification for this product
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();

        const recentNotification = existing.find(
          (n) =>
            n.type === "inventory" &&
            n.message.includes(product.name) &&
            Date.now() - n.createdAt < 24 * 60 * 60 * 1000 // within last 24 hours
        );

        if (!recentNotification) {
          await ctx.db.insert("notifications", {
            userId,
            title: "هشدار موجودی کم",
            message: `محصول «${product.name}» فقط ${product.stock} عدد موجودی دارد.`,
            type: "inventory",
            isRead: false,
            link: `/dashboard/products/${product.slug}`,
            createdAt: Date.now(),
          });
          notificationsCreated++;
        }
      }
    }

    return { notificationsCreated };
  },
});

// Check for products with stale prices (no update in 30 days)
export const checkStalePrices = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const products = await ctx.db.query("products").collect();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let notificationsCreated = 0;

    for (const product of products) {
      const lastUpdate = product.lastPriceUpdate || product.updatedAt;
      if (lastUpdate < thirtyDaysAgo) {
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();

        const recentNotification = existing.find(
          (n) =>
            n.type === "product" &&
            n.message.includes(product.name) &&
            n.message.includes("قیمت") &&
            Date.now() - n.createdAt < 7 * 24 * 60 * 60 * 1000
        );

        if (!recentNotification) {
          await ctx.db.insert("notifications", {
            userId,
            title: "بروزرسانی قیمت",
            message: `قیمت محصول «${product.name}» بیش از ۳۰ روز بروزرسانی نشده است.`,
            type: "product",
            isRead: false,
            link: `/dashboard/products/${product.slug}`,
            createdAt: Date.now(),
          });
          notificationsCreated++;
        }
      }
    }

    return { notificationsCreated };
  },
});

// Check for new orders and notify admin
export const checkNewOrders = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const orders = await ctx.db.query("orders").collect();
    const pendingOrders = orders.filter((o) => o.status === "pending" && Date.now() - o.createdAt < 24 * 60 * 60 * 1000);
    let notificationsCreated = 0;

    if (pendingOrders.length > 0) {
      const existing = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const recentNotification = existing.find(
        (n) =>
          n.type === "order" &&
          n.message.includes("سفارش جدید") &&
          Date.now() - n.createdAt < 6 * 60 * 60 * 1000
      );

      if (!recentNotification) {
        await ctx.db.insert("notifications", {
          userId,
          title: "سفارش جدید",
          message: `${pendingOrders.length} سفارش جدید در ۲۴ ساعت گذشته ثبت شده است.`,
          type: "order",
          isRead: false,
          link: "/dashboard/orders",
          createdAt: Date.now(),
        });
        notificationsCreated++;
      }
    }

    return { notificationsCreated };
  },
});

// Check for price drops on wishlisted products
export const checkPriceDrops = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let notificationsCreated = 0;

    for (const product of products) {
      if (!product.salePrice || product.salePrice >= product.price) continue;

      // Find users who have this product in their wishlist
      const wishlistEntries = await ctx.db
        .query("wishlists")
        .filter((q) => q.eq(q.field("productId"), product._id))
        .collect();

      for (const entry of wishlistEntries) {
        if (!entry.notifyOnSale) continue;

        const recent = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", entry.userId))
          .collect();

        const hasRecent = recent.find(
          (n) => n.type === "price_drop" && n.message.includes(product.name) && Date.now() - n.createdAt < 7 * 24 * 60 * 60 * 1000
        );

        if (!hasRecent) {
          const discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
          await ctx.db.insert("notifications", {
            userId: entry.userId,
            title: "کاهش قیمت",
            message: `قیمت محصول «${product.name}» ${discount}% کاهش یافت!`,
            type: "price_drop",
            isRead: false,
            link: `/products/${product.slug}`,
            createdAt: Date.now(),
          });
          notificationsCreated++;
        }
      }
    }

    return { notificationsCreated };
  },
});

// Check for restock of out-of-stock products
export const checkRestock = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let notificationsCreated = 0;

    for (const product of products) {
      if (product.stock <= 0) continue; // Only check products that are now in stock

      // Find users who wishlisted this product and want stock notifications
      const wishlistEntries = await ctx.db
        .query("wishlists")
        .filter((q) => q.eq(q.field("productId"), product._id))
        .collect();

      for (const entry of wishlistEntries) {
        if (!entry.notifyOnStock) continue;

        const recent = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", entry.userId))
          .collect();

        const hasRecent = recent.find(
          (n) => n.type === "restock" && n.message.includes(product.name) && Date.now() - n.createdAt < 7 * 24 * 60 * 60 * 1000
        );

        if (!hasRecent) {
          await ctx.db.insert("notifications", {
            userId: entry.userId,
            title: "موجود شدن محصول",
            message: `محصول «${product.name}» دوباره موجود شد!`,
            type: "restock",
            isRead: false,
            link: `/products/${product.slug}`,
            createdAt: Date.now(),
          });
          notificationsCreated++;
        }
      }
    }

    return { notificationsCreated };
  },
});

// Run all auto-notifications checks
export const runAllChecks = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const products = await ctx.db.query("products").collect();
    let totalNotifications = 0;

    // Check low stock
    for (const product of products) {
      if (product.stock > 0 && product.stock <= (product.stockAlert || 5)) {
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();

        const hasRecent = existing.find(
          (n) => n.type === "inventory" && n.message.includes(product.name) && Date.now() - n.createdAt < 24 * 60 * 60 * 1000
        );

        if (!hasRecent) {
          await ctx.db.insert("notifications", {
            userId,
            title: "هشدار موجودی کم",
            message: `محصول «${product.name}» فقط ${product.stock} عدد موجودی دارد.`,
            type: "inventory",
            isRead: false,
            createdAt: Date.now(),
          });
          totalNotifications++;
        }
      }
    }

    // Check new pending orders
    const orders = await ctx.db.query("orders").collect();
    const pendingCount = orders.filter((o) => o.status === "pending" && Date.now() - o.createdAt < 24 * 60 * 60 * 1000).length;

    if (pendingCount > 0) {
      const existing = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const hasRecent = existing.find(
        (n) => n.type === "order" && n.message.includes("سفارش جدید") && Date.now() - n.createdAt < 6 * 60 * 60 * 1000
      );

      if (!hasRecent) {
        await ctx.db.insert("notifications", {
          userId,
          title: "سفارش جدید",
          message: `${pendingCount} سفارش جدید در ۲۴ ساعت گذشته ثبت شده.`,
          type: "order",
          isRead: false,
          createdAt: Date.now(),
        });
        totalNotifications++;
      }
    }

    return { totalNotifications };
  },
});
