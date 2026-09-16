import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export const checkLoginRateLimit = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("loginAttempts")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    if (!record) return { allowed: true, attempts: 0, remaining: LOGIN_ATTEMPT_LIMIT };

    const now = Date.now();

    // If lockout has expired, reset
    if (record.lockedUntil && record.lockedUntil < now) {
      return { allowed: true, attempts: 0, remaining: LOGIN_ATTEMPT_LIMIT };
    }

    // If currently locked
    if (record.lockedUntil && record.lockedUntil >= now) {
      const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, attempts: record.attempts, remaining: 0, retryAfter };
    }

    return {
      allowed: true,
      attempts: record.attempts,
      remaining: LOGIN_ATTEMPT_LIMIT - record.attempts,
    };
  },
});

export const recordLoginAttempt = mutation({
  args: { identifier: v.string(), success: v.boolean() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const record = await ctx.db
      .query("loginAttempts")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    if (args.success) {
      // On success, delete the record
      if (record) await ctx.db.delete(record._id);
      return;
    }

    if (!record) {
      await ctx.db.insert("loginAttempts", {
        identifier: args.identifier,
        attempts: 1,
        lastAttempt: now,
        createdAt: now,
      });
    } else {
      const newAttempts = record.attempts + 1;
      const patchData: Record<string, any> = {
        attempts: newAttempts,
        lastAttempt: now,
      };
      if (newAttempts >= LOGIN_ATTEMPT_LIMIT) {
        patchData.lockedUntil = now + LOGIN_LOCKOUT_MS;
      }
      await ctx.db.patch(record._id, patchData);
    }
  },
});

export const resetLoginAttempts = mutation({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("loginAttempts")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();
    if (record) {
      await ctx.db.patch(record._id, { attempts: 0, lockedUntil: undefined });
    }
  },
});
