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
    return await ctx.db.query("categories").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getRoot = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", undefined))
      .order("asc")
      .collect();
  },
});

export const getChildren = query({
  args: { parentId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .order("asc")
      .collect();
  },
});

export const getById = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.categoryId);
  },
});

/** تولید URL برای آپلود فایل تصویر دسته‌بندی */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    order: v.optional(v.number()),
    features: v.optional(v.array(v.object({ key: v.string(), label: v.string() }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");

    let level = 0;
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (parent) level = parent.level + 1;
    }

    // Check uniqueness at the same level and same parent
    const siblings = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId || undefined))
      .collect();
    if (siblings.some((s) => s.name === args.name)) {
      throw new Error(`دسته‌بندی "${args.name}" در این سطح تکراری است.`);
    }

    return await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug || generateSlug(args.name),
      description: args.description,
      image: args.image,
      parentId: args.parentId,
      level,
      order: args.order ?? 0,
      isActive: true,
      features: args.features || [],
    });
  },
});

export const update = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    features: v.optional(v.array(v.object({ key: v.string(), label: v.string() }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");

    const { categoryId, ...updates } = args;
    await ctx.db.patch(categoryId, updates);
  },
});

export const remove = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.categoryId);
  },
});

/** فعال/غیرفعال کردن دسته‌بندی */
export const toggleActive = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");
    await ctx.db.patch(args.categoryId, { isActive: !cat.isActive });
    return { isActive: !cat.isActive };
  },
});

export const addFeature = mutation({
  args: {
    categoryId: v.id("categories"),
    key: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");

    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");

    const existingFeatures = (cat as any).features || [];
    // Don't add duplicate keys
    if (existingFeatures.some((f: any) => f.key === args.key)) {
      throw new Error("Feature with this key already exists");
    }

    await ctx.db.patch(args.categoryId, {
      features: [...existingFeatures, { key: args.key, label: args.label }],
    });
  },
});

export const removeFeature = mutation({
  args: {
    categoryId: v.id("categories"),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager")
      throw new Error("Unauthorized");

    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");

    const existingFeatures = (cat as any).features || [];
    await ctx.db.patch(args.categoryId, {
      features: existingFeatures.filter((f: any) => f.key !== args.key),
    });
  },
});