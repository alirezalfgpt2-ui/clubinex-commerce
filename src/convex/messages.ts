import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ───Queries───────────────────────────────────────────────────────────

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const userIdStr = userId as unknown as string;
    const allMessages = await ctx.db.query("messages").collect();
    const relevant = allMessages.filter(
      (m) => m.senderId === userIdStr || m.receiverId === userIdStr || m.sessionId?.startsWith("guest-")
    );
    const chatMap = new Map<string, any[]>();
    for (const msg of relevant) {
      const existing = chatMap.get(msg.chatId) || [];
      existing.push(msg);
      chatMap.set(msg.chatId, existing);
    }
    const result: any[] = [];
    for (const [chatId, msgs] of chatMap) {
      msgs.sort((a, b) => a.createdAt - b.createdAt);
      const lastMsg = msgs[msgs.length - 1];
      const guestMessages = msgs.filter((m) => m.sessionId?.startsWith("guest-") || m.senderId.startsWith("guest-"));
      const guestInfo = guestMessages[0] || {};
      const unread = msgs.filter((m) => m.receiverId === userIdStr && !m.isRead).length;
      const isOnline = msgs.some((m) => m.senderId.startsWith("guest-") && Date.now() - m.createdAt < 5 * 60 * 1000);
      const endMsg = msgs.find((m) => m.chatEnded);
      const rating = await ctx.db.query("chatRatings").withIndex("by_chatId", (q) => q.eq("chatId", chatId)).first();
      result.push({
        chatId, partnerId: guestInfo.senderId || chatId,
        guestName: guestInfo.senderName || "ناشناس", guestEmail: guestInfo.senderEmail || "",
        guestPhone: guestInfo.senderPhone || "", ipAddress: guestInfo.ipAddress || "",
        lastMessage: lastMsg, unread, isOnline, isEnded: !!endMsg,
        endedBy: endMsg?.endedBy || "", rating: rating?.rating || null, messageCount: msgs.length,
      });
    }
    result.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
    return result;
  },
});

export const listByChatId = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("messages").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId)).order("asc").collect();
  },
});

export const listBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const sid = args.sessionId;
    const byChatId = await ctx.db.query("messages").withIndex("by_chatId", (q) => q.eq("chatId", sid)).order("asc").collect();
    const bySender = await ctx.db.query("messages").withIndex("by_sender", (q) => q.eq("senderId", sid)).order("asc").collect();
    const byReceiver = await ctx.db.query("messages").withIndex("by_receiver", (q) => q.eq("receiverId", sid)).order("asc").collect();
    const seen = new Set<string>();
    const all = [...byChatId, ...bySender, ...byReceiver].filter((m) => {
      if (seen.has(m._id)) return false; seen.add(m._id); return true;
    });
    return all.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getByChat = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("messages").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId)).order("asc").collect();
  },
});

export const getGuestInfo = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const msgs = await ctx.db.query("messages").withIndex("by_sender", (q) => q.eq("senderId", args.sessionId)).order("asc").first();
    if (!msgs) return null;
    return { name: msgs.senderName || "ناشناس", email: msgs.senderEmail || "", phone: msgs.senderPhone || "", ip: msgs.ipAddress || "", sessionId: args.sessionId };
  },
});

export const getChatRating = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("chatRatings").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId)).first();
  },
});

// ───Mutations─────────────────────────────────────────────────────────

export const send = mutation({
  args: { receiverId: v.string(), body: v.string(), chatId: v.optional(v.string()), attachments: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    let chatId = args.chatId;
    if (!chatId) {
      if (args.receiverId.startsWith("guest-")) chatId = args.receiverId;
      else chatId = [userId, args.receiverId].sort().join("-");
    }
    const adminUser = await ctx.db.get(userId);
    return await ctx.db.insert("messages", {
      chatId, senderId: userId as unknown as string, receiverId: args.receiverId,
      body: args.body, attachments: args.attachments, isRead: false, createdAt: Date.now(),
      senderName: adminUser?.name || "اپراتور",
    });
  },
});

export const sendGuest = mutation({
  args: { sessionId: v.string(), body: v.string(), senderName: v.string(), senderEmail: v.optional(v.string()), senderPhone: v.optional(v.string()), ipAddress: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      chatId: args.sessionId, senderId: args.sessionId, receiverId: "admin",
      body: args.body, isRead: false, createdAt: Date.now(), sessionId: args.sessionId,
      senderName: args.senderName, senderEmail: args.senderEmail, senderPhone: args.senderPhone, ipAddress: args.ipAddress,
    });
  },
});

export const endChat = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.insert("messages", {
      chatId: args.chatId, senderId: userId as unknown as string, receiverId: "system",
      body: "💬 گفتگو توسط اپراتور خاتمه یافت", isRead: true, createdAt: Date.now(),
      chatEnded: true, endedBy: "operator", endedAt: Date.now(),
    });
  },
});

export const deleteChat = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const messages = await ctx.db.query("messages").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId)).collect();
    for (const msg of messages) await ctx.db.delete(msg._id);
    const rating = await ctx.db.query("chatRatings").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId)).first();
    if (rating) await ctx.db.delete(rating._id);
  },
});

export const submitRating = mutation({
  args: { chatId: v.string(), sessionId: v.string(), rating: v.number(), feedback: v.optional(v.string()), guestName: v.optional(v.string()), guestEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("chatRatings").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId)).first();
    if (existing) throw new Error("شما قبلاً نظر داده‌اید.");
    return await ctx.db.insert("chatRatings", {
      chatId: args.chatId, sessionId: args.sessionId, rating: Math.min(5, Math.max(1, args.rating)),
      feedback: args.feedback, guestName: args.guestName, guestEmail: args.guestEmail, ratedAt: Date.now(),
    });
  },
});

/**
 * علامت خوانده شدن — همه پیام‌های یک چت (ادمین)
 * پیام‌های فرستنده و گیرنده هر دو علامت زده می‌شوند
 */
export const markRead = mutation({
  args: { chatId: v.optional(v.string()), messageId: v.optional(v.id("messages")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const userIdStr = userId as unknown as string;
    if (args.messageId) {
      const msg = await ctx.db.get(args.messageId);
      if (msg && !msg.isRead) {
        await ctx.db.patch(msg._id, { isRead: true, readAt: Date.now() });
      }
      return;
    }
    if (args.chatId) {
      const messages = await ctx.db.query("messages").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId!)).collect();
      for (const msg of messages) {
        if (!msg.isRead) {
          await ctx.db.patch(msg._id, { isRead: true, readAt: Date.now() });
        }
      }
    }
  },
});

/**
 * علامت خوانده شدن — عمومی (بدون احراز هویت)
 * مهمان این را فراخوانی می‌کند وقتی پیام‌های ادمین را می‌بیند
 */
export const markAsRead = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("messages").withIndex("by_chatId", (q) => q.eq("chatId", args.chatId)).collect();
    for (const msg of messages) {
      if (!msg.isRead) {
        await ctx.db.patch(msg._id, { isRead: true, readAt: Date.now() });
      }
    }
  },
});
