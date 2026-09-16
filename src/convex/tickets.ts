import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (user?.role === "admin" || user?.role === "manager" || user?.role === "operator") {
      return await ctx.db.query("tickets").order("desc").collect();
    }
    return await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketId);
  },
});

export const getReplies = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketReplies")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    subject: v.string(),
    message: v.string(),
    category: v.union(
      v.literal("technical"),
      v.literal("financial"),
      v.literal("product"),
      v.literal("general")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("tickets", {
      userId,
      ...args,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Add reply with optional file attachments.
 * Sends notification to the other party (user or operator).
 */
export const addReply = mutation({
  args: {
    ticketId: v.id("tickets"),
    message: v.string(),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    await ctx.db.insert("ticketReplies", {
      ticketId: args.ticketId,
      userId,
      message: args.message,
      attachments: args.attachments,
      createdAt: now,
    });

    await ctx.db.patch(args.ticketId, {
      status: "answered",
      updatedAt: now,
    });

    // Notify the ticket owner about the reply
    const ticket = await ctx.db.get(args.ticketId);
    if (ticket) {
      const replier = await ctx.db.get(userId);
      const isOperator = replier?.role === "admin" || replier?.role === "manager" || replier?.role === "operator";

      // Notify the other party
      const notifyUserId = isOperator ? ticket.userId : userId;
      // For operators, notify other operators/admins
      if (!isOperator) {
        const admins = await ctx.db.query("users").collect();
        for (const admin of admins) {
          if (admin.role === "admin" || admin.role === "operator") {
            await ctx.db.insert("notifications", {
              userId: admin._id,
              title: "پاسخ جدید به تیکت",
              message: `پاسخ جدیدی به تیکت "${ticket.subject}" ارسال شد.`,
              type: "support",
              isRead: false,
              createdAt: now,
            });
          }
        }
      } else {
        await ctx.db.insert("notifications", {
          userId: ticket.userId,
          title: "پاسخ به تیکت شما",
          message: `به تیکت "${ticket.subject}" پاسخ داده شد.`,
          type: "support",
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});

export const updateStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("answered"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Rate a support ticket (1-5 stars) after it's closed.
 */
export const rateTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
    rating: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.rating < 1 || args.rating > 5) throw new Error("امتیاز باید بین ۱ تا ۵ باشد.");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("تیکت یافت نشد.");
    if (ticket.userId !== userId) throw new Error("شما فقط می‌توانید تیکت خود را امتیاز دهید.");
    if (ticket.status !== "closed") throw new Error("فقط تیکت‌های بسته‌شده قابل امتیازدهی هستند.");

    await ctx.db.patch(args.ticketId, {
      rating: args.rating,
      ratingFeedback: args.feedback,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * ارجاع تیکت به دپارتمان دیگر
 */
export const forwardToDepartment = mutation({
  args: {
    ticketId: v.id("tickets"),
    newDepartment: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager" && user?.role !== "operator") {
      throw new Error("فقط اپراتورها می‌توانند تیکت را ارجاع دهند.");
    }
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("تیکت یافت نشد.");
    // اگر یادداشت وجود دارد، به عنوان پاسخ اضافه کن
    if (args.note) {
      await ctx.db.insert("ticketReplies", {
        ticketId: args.ticketId,
        userId,
        message: `📌 ارجاع به دپارتمان «${args.newDepartment}»\n\n${args.note}`,
        createdAt: Date.now(),
      });
    }
    await ctx.db.patch(args.ticketId, {
      department: args.newDepartment,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
