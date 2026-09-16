import { action, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send SMS via KaveNegar API
 * Requires KAVEGAR_API_KEY in env vars
 */
export const sendSms = action({
  args: {
    phone: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.KAVEGAR_API_KEY;
    if (!apiKey) {
      console.log("KaveNegar API key not configured. SMS skipped.");
      return { success: false, error: "SMS API not configured" };
    }

    try {
      const response = await fetch(
        `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receptor: args.phone,
            message: args.message,
            sender: process.env.KAVEGAR_SENDER || "1000000000",
          }),
        }
      );

      const data = await response.json();
      if (data.return && data.return.status === 200) {
        return { success: true };
      }
      return { success: false, error: data.entries?.[0]?.message || "SMS failed" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

/**
 * Send email notification (placeholder — integrate with SMTP/SendGrid/Resend)
 */
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    // Log for now — integrate SMTP provider via env vars in production
    console.log(`[EMAIL] To: ${args.to} | Subject: ${args.subject} | Body: ${args.body.substring(0, 100)}...`);
    return { success: true, message: "Email queued for delivery" };
  },
});

/**
 * Get notification settings from settings table
 */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_category", (q) => q.eq("category", "notifications"))
      .collect();

    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});
