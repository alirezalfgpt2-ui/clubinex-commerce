import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    entity: v.optional(v.string()),
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    if (args.entity) {
      return await ctx.db
        .query("auditLogs")
        .withIndex("by_entity", (idx: any) => idx.eq("entity", args.entity!))
        .order("desc")
        .take(args.limit ?? 100);
    }
    return await ctx.db.query("auditLogs").order("desc").take(args.limit ?? 100);
  },
});

export const log = mutation({
  args: {
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return; // Don't throw for logging

    await ctx.db.insert("auditLogs", {
      action: args.action,
      entity: args.entity,
      entityId: args.entityId,
      userId,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});
