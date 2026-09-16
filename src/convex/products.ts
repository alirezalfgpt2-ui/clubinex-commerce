import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

/**
 * لیست صفحه‌بندی شده محصولات (سرور-ساید)
 * برای ۱۰,۰۰۰+ محصول بهینه است — فقط هر صفحه را لود می‌کند
 */
export const listPaginated = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    const q = ctx.db.query("products");

    // مرتب‌سازی و filter به ترتیب صحیح
    const orderDir = (args.sortBy === "oldest" || args.sortBy === "price_asc") ? "asc" as const : "desc" as const;
    let ordered = q.order(orderDir);

    // اعمال cursor
    if (args.cursor) {
      if (orderDir === "desc") {
        ordered = ordered.filter((idx) => idx.lt(idx.field("_creationTime"), Number(args.cursor)));
      } else {
        ordered = ordered.filter((idx) => idx.gt(idx.field("_creationTime"), Number(args.cursor)));
      }
    }

    // filter فقط برای activeOnly (جستجو سمت کلاینت انجام می‌شود)
    if (args.activeOnly !== false) {
      ordered = ordered.filter((idx) => idx.eq(idx.field("isActive"), true));
    }

    // دریافت بیشتر برای جستجو (فیلتر سمت کلاینت)
    const fetchLimit = args.search ? limit * 3 : limit + 1;
    const results = await ordered.take(fetchLimit);

    // جستجوی سمت سرور
    let filtered = results;
    if (args.search) {
      const sq = args.search.toLowerCase();
      filtered = results.filter(
        (p) =>
          p.name.toLowerCase().includes(sq) ||
          (p.description || "").toLowerCase().includes(sq) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(sq)) ||
          (p.brand || "").toLowerCase().includes(sq)
      );
    }

    // مرتب‌سازی قیمت (سمت سرور)
    if (args.sortBy === "price_asc") {
      filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (args.sortBy === "price_desc") {
      filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    }

    const sliced = filtered.slice(0, limit);
    const hasMore = filtered.length > limit;
    const nextCursor = hasMore && sliced.length > 0
      ? String(sliced[sliced.length - 1]._creationTime)
      : undefined;

    // totalEstimate: count ALL matching products (not just current page)
    const totalCount = await q.collect().then((all) => {
      const list = args.activeOnly !== false ? all.filter((p) => p.isActive) : all;
      // If search is active, filter the total too
      if (args.search) {
        const sq = args.search.toLowerCase();
        return list.filter(
          (p) =>
            p.name.toLowerCase().includes(sq) ||
            (p.description || "").toLowerCase().includes(sq) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(sq)) ||
            (p.brand || "").toLowerCase().includes(sq)
        ).length;
      }
      return list.length;
    });

    return {
      results: sliced,
      nextCursor,
      hasMore,
      totalEstimate: totalCount,
    };
  },
});

export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    return await ctx.db
      .query("products")
      .withIndex("by_isFeatured", (q) => q.eq("isFeatured", true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(limit);
  },
});

export const getNewest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    return await ctx.db
      .query("products")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);
  },
});

export const getMostViewed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    return await ctx.db
      .query("products")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return results;
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const getByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase();
    const allProducts = await ctx.db
      .query("products")
      .withIndex("by_isActive", (p) => p.eq("isActive", true))
      .collect();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    englishName: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.number(),
    stockAlert: v.optional(v.number()),
    images: v.array(v.string()),
    categoryId: v.id("categories"),
    tags: v.array(v.string()),
    brand: v.optional(v.string()),
    weight: v.optional(v.number()),
    features: v.optional(v.any()),
    trustBadges: v.optional(v.array(v.object({
      icon: v.string(),
      label: v.string(),
      desc: v.string(),
    }))),
    isFeatured: v.boolean(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");

    const slug = args.slug || generateSlug(args.name);
    const now = Date.now();

    return await ctx.db.insert("products", {
      ...args,
      slug,
      views: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    englishName: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    price: v.optional(v.number()),
    salePrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    stockAlert: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    categoryId: v.optional(v.id("categories")),
    tags: v.optional(v.array(v.string())),
    brand: v.optional(v.string()),
    weight: v.optional(v.number()),
    features: v.optional(v.any()),
    trustBadges: v.optional(v.array(v.object({
      icon: v.string(),
      label: v.string(),
      desc: v.string(),
    }))),
    isFeatured: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");

    const { productId, ...updates } = args;
    const now = Date.now();
    const data: Record<string, any> = { ...updates, updatedAt: now };
    if (updates.price !== undefined) data.lastPriceUpdate = now;
    await ctx.db.patch(productId, data);
  },
});

export const duplicate = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");
    const original = await ctx.db.get(args.productId);
    if (!original) throw new Error("محصول یافت نشد.");
    const now = Date.now();
    const slug = generateSlug(original.name) + "-" + now;
    return await ctx.db.insert("products", {
      name: original.name + " (کپی)",
      slug,
      description: original.description,
      shortDescription: original.shortDescription,
      price: original.price,
      salePrice: original.salePrice,
      stock: original.stock,
      stockAlert: original.stockAlert,
      images: original.images,
      categoryId: original.categoryId,
      tags: original.tags,
      brand: original.brand,
      weight: original.weight,
      features: original.features,
      isFeatured: false,
      isActive: false,
      views: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.productId);
  },
});

export const trackView = mutation({
  args: {
    productId: v.id("products"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("productViews", {
      productId: args.productId,
      sessionId: args.sessionId,
      viewDate: Date.now(),
    });
    const product = await ctx.db.get(args.productId);
    if (product) {
      await ctx.db.patch(args.productId, {
        views: product.views + 1,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const active = products.filter((p) => p.isActive);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter(
      (p) => p.stock <= (p.stockAlert ?? 5)
    );
    return {
      total: products.length,
      active: active.length,
      totalStock,
      lowStock: lowStock.length,
      featured: products.filter((p) => p.isFeatured).length,
    };
  },
});
