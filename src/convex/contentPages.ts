import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** دریافت صفحه محتوا بر اساس slug */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/** دریافت تمام صفحات محتوا */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contentPages").order("desc").collect();
  },
});

/** ذخیره یا به‌روزرسانی صفحه محتوا */
export const upsert = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    titleEn: v.optional(v.string()),
    content: v.string(),
    contentEn: v.optional(v.string()),
    lastUpdated: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("contentPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        titleEn: args.titleEn,
        content: args.content,
        contentEn: args.contentEn,
        lastUpdated: args.lastUpdated,
        isActive: args.isActive,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("contentPages", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/** دریافت تمام ترجمه‌ها */
export const listTranslations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("translations").collect();
  },
});

/** دریافت ترجمه‌ها بر اساس دسته‌بندی */
export const listTranslationsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("translations")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

/** ذخیره یا به‌روزرسانی ترجمه */
export const upsertTranslation = mutation({
  args: {
    key: v.string(),
    fa: v.string(),
    en: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("translations")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fa: args.fa,
        en: args.en,
        category: args.category,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("translations", {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

/** حذف ترجمه */
export const deleteTranslation = mutation({
  args: { id: v.id("translations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
