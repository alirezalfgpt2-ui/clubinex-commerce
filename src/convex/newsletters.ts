import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("newsletters")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing) {
      if (existing.isActive) return { success: true, message: "شما قبلاً عضو خبرنامه شده‌اید." };
      await ctx.db.patch(existing._id, { isActive: true, updatedAt: Date.now() });
      return { success: true, message: "عضویت شما فعال شد." };
    }
    await ctx.db.insert("newsletters", {
      email: args.email.toLowerCase(),
      isActive: true,
      createdAt: Date.now(),
    });
    return { success: true, message: "با موفقیت در خبرنامه عضو شدید." };
  },
});

export const unsubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("newsletters")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false, updatedAt: Date.now() });
    }
    return { success: true };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("newsletters").order("desc").collect();
  },
});
