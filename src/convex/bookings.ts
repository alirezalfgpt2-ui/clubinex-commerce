import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (user?.role === "admin" || user?.role === "manager") {
      return await ctx.db.query("bookings").order("desc").collect();
    }
    return await ctx.db.query("bookings").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
  },
});

export const create = mutation({
  args: { service: v.string(), date: v.number(), time: v.string(), notes: v.optional(v.string()), description: v.optional(v.string()), customerName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const bookingId = await ctx.db.insert("bookings", { userId, ...args, status: "pending", createdAt: Date.now() });

    // Create notification for the booking
    const dateStr = new Date(args.date).toLocaleDateString("fa-IR");
    await ctx.db.insert("notifications", {
      userId,
      title: "رزرو جدید ثبت شد",
      message: `نوبت ${args.service} در تاریخ ${dateStr} ساعت ${args.time} ثبت شد.`,
      type: "system",
      isRead: false,
      link: "/dashboard/bookings",
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

export const updateStatus = mutation({
  args: { bookingId: v.id("bookings"), status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const booking = await ctx.db.get(args.bookingId);
    await ctx.db.patch(args.bookingId, { status: args.status });

    // Notify the booking owner
    if (booking) {
      const statusLabels: Record<string, string> = {
        confirmed: "تأیید شد ✅",
        cancelled: "لغو شد ❌",
        completed: "انجام شد ✔️",
        pending: "در انتظار ⏳",
      };
      await ctx.db.insert("notifications", {
        userId: booking.userId,
        title: `وضعیت رزرو ${statusLabels[args.status] || args.status}`,
        message: `نوبت ${booking.service} در تاریخ ${new Date(booking.date).toLocaleDateString("fa-IR")} ساعت ${booking.time} ${statusLabels[args.status] || "تغییر کرد"}.`,
        type: "system",
        isRead: false,
        link: "/dashboard/bookings",
        createdAt: Date.now(),
      });
    }
  },
});

export const remove = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.bookingId);
  },
});
