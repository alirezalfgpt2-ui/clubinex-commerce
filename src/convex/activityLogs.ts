/**
 * 📋 سیستم لاگ فعالیت‌ها
 * — ثبت تمام اقدامات کاربران و سیستم
 * — قابلیت فیلتر بر اساس کاربر/عملیات/تاریخ/بخش
 */
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** ثبت لاگ فعالیت */
export const log = mutation({
  args: {
    action: v.string(),
    entity: v.string(),
    entityId: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("auditLogs", {
      action: args.action,
      entity: args.entity,
      entityId: args.entityId || "",
      userId: userId || ("system" as any),
      details: args.details || "",
      ip: "",
      createdAt: Date.now(),
    });
  },
});

/** لیست لاگ‌ها با فیلتر */
export const list = query({
  args: {
    userId: v.optional(v.string()),
    action: v.optional(v.string()),
    entity: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("auditLogs").order("desc");
    if (args.dateFrom) q = q.filter((idx) => idx.gte(idx.field("createdAt"), args.dateFrom!));
    if (args.dateTo) q = q.filter((idx) => idx.lte(idx.field("createdAt"), args.dateTo!));
    const results = await q.take(args.limit ?? 200);

    let filtered = results;
    if (args.userId) filtered = filtered.filter((l) => l.userId === args.userId);
    if (args.action) filtered = filtered.filter((l) => l.action === args.action);
    if (args.entity) filtered = filtered.filter((l) => l.entity === args.entity);

    const enriched = await Promise.all(filtered.map(async (log) => {
      let userName = "سیستم";
      try {
        if (log.userId && String(log.userId) !== "system") {
          const u = await ctx.db.get(log.userId as any);
          if (u) userName = (u as any).name || (u as any).email || String(log.userId);
        }
      } catch {}
      return { ...log, userName };
    }));

    return enriched;
  },
});

/** آمار لاگ‌ها */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("auditLogs").order("desc").take(1000);
    const now = Date.now();
    const day = 86400000;
    return {
      total: all.length,
      today: all.filter((l) => l.createdAt > now - day).length,
      thisWeek: all.filter((l) => l.createdAt > now - 7 * day).length,
      byAction: {
        login: all.filter((l) => l.action === "login").length,
        create: all.filter((l) => l.action === "create").length,
        update: all.filter((l) => l.action === "update").length,
        delete: all.filter((l) => l.action === "delete").length,
        view: all.filter((l) => l.action === "view").length,
      },
    };
  },
});
