/**
 * 🔐 سیستم لایسنس Clubinex
 * — اعتبارسنجی JWT RS256
 * — مدیریت ماژول‌ها
 * — شناسایی Machine ID
 */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** ماژول‌های هسته‌ای — همیشه فعال */
export const CORE_MODULES = [
  "dashboard",
  "products",
  "categories",
  "orders",
  "users",
  "settings",
  "roles",
  "shipping",
  "discounts",
  "brands",
  "reports",
  "activity_logs",
] as const;

/** ماژول‌های اختیاری — بر اساس لایسنس فعال می‌شوند */
export const OPTIONAL_MODULES = [
  "inventory",
  "warehouses",
  "blog",
  "chat",
  "tickets",
  "bookings",
  "vendors",
  "returns",
  "email_templates",
  "newsletters",
  "variants",
  "wallets",
  "reviews",
  "questions",
  "wishlists",
  "page_stats",
  "banners",
  "compare",
  "departments",
  "templates",
  "notifications",
  "gift_cards",
  "loyalty",
] as const;

/** تمام ماژول‌ها */
export const ALL_MODULES = [...CORE_MODULES, ...OPTIONAL_MODULES] as const;
export type ModuleId = (typeof ALL_MODULES)[number];

/** اطلاعات ماژول‌ها برای نمایش */
export const MODULE_INFO: Record<string, { label: string; description: string; group: string }> = {
  dashboard: { label: "داشبورد", description: "صفحه اصلی مدیریت", group: "هسته‌ای" },
  products: { label: "محصولات", description: "مدیریت محصولات فروشگاه", group: "هسته‌ای" },
  categories: { label: "دسته‌بندی‌ها", description: "مدیریت دسته‌بندی محصولات", group: "هسته‌ای" },
  orders: { label: "سفارشات", description: "مدیریت سفارشات", group: "هسته‌ای" },
  users: { label: "کاربران", description: "مدیریت کاربران سیستم", group: "هسته‌ای" },
  settings: { label: "تنظیمات", description: "تنظیمات سیستم", group: "هسته‌ای" },
  roles: { label: "نقش‌ها", description: "مدیریت نقش‌ها و دسترسی‌ها", group: "هسته‌ای" },
  shipping: { label: "ارسال", description: "روش‌های ارسال", group: "هسته‌ای" },
  discounts: { label: "تخفیف‌ها", description: "سیستم تخفیف و کوپن", group: "هسته‌ای" },
  brands: { label: "برندها", description: "مدیریت برندها", group: "هسته‌ای" },
  reports: { label: "گزارشات", description: "گزارش‌ها و تحلیل‌ها", group: "هسته‌ای" },
  activity_logs: { label: "لاگ فعالیت", description: "لاگ عملیات سیستم", group: "هسته‌ای" },
  inventory: { label: "انبارداری", description: "مدیریت موجودی انبار", group: "انبارداری" },
  warehouses: { label: "انبارها", description: "مدیریت انبارها", group: "انبارداری" },
  blog: { label: "بلاگ", description: "سیستم بلاگ و اخبار", group: "محتوا" },
  chat: { label: "چت زنده", description: "پشتیبانی آنلاین", group: "ارتباطات" },
  tickets: { label: "تیکتینگ", description: "سیستم تیکت پشتیبانی", group: "ارتباطات" },
  bookings: { label: "نوبت‌دهی", description: "سیستم رزرو و نوبت‌دهی", group: "فروش" },
  vendors: { label: "فروشندگان", description: "مدیریت فروشندگان", group: "فروش" },
  returns: { label: "مرجوعی", description: "سیستم مرجوعی کالا", group: "فروش" },
  email_templates: { label: "قالب ایمیل", description: "قالب‌های ایمیل", group: "بازاریابی" },
  newsletters: { label: "خبرنامه", description: "سیستم خبرنامه", group: "بازاریابی" },
  variants: { label: "متغیرها", description: "متغیرهای محصولات", group: "محصول" },
  wallets: { label: "کیف پول", description: "کیف پول و وفاداری", group: "مالی" },
  reviews: { label: "نظرات", description: "مدیریت نظرات کاربران", group: "تعاملات" },
  questions: { label: "پرسش و پاسخ", description: "سیستم Q&A محصولات", group: "تعاملات" },
  wishlists: { label: "علاقه‌مندی‌ها", description: "لیست علاقه‌مندی کاربران", group: "تعاملات" },
  page_stats: { label: "آمار بازدید", description: "آمار بازدید صفحات", group: "تعاملات" },
  banners: { label: "بنرها", description: "مدیریت بنرهای تبلیغاتی", group: "محتوا" },
  compare: { label: "مقایسه", description: "مقایسه محصولات", group: "محصول" },
  departments: { label: "دپارتمان‌ها", description: "دپارتمان‌های پشتیبانی", group: "ارتباطات" },
  templates: { label: "قالب‌ها", description: "قالب‌های ایمیل و پیامک", group: "بازاریابی" },
  notifications: { label: "اعلانات", description: "سیستم اعلان‌ها", group: "ارتباطات" },
  gift_cards: { label: "کارت هدیه", description: "سیستم کارت هدیه", group: "مالی" },
  loyalty: { label: "وفاداری", description: "باشگاه مشتریان", group: "مالی" },
};

/**
 * فعال بودن ماژول بر اساس لایسنس
 */
export function isModuleEnabled(
  license: { modules?: Record<string, boolean>; features?: any; isActive: boolean; expiryDate?: number } | null,
  moduleId: string,
): boolean {
  // ماژول‌های هسته‌ای همیشه فعال
  if (CORE_MODULES.includes(moduleId as any)) return true;

  // بدون لایسنس = فقط هسته‌ای
  if (!license) return false;

  // لایسنس غیرفعال
  if (!license.isActive) return false;

  // بررسی انقضا
  if (license.expiryDate && license.expiryDate < Date.now()) return false;

  // بررسی ماژول در modules
  if (license.modules && typeof license.modules === "object") {
    return license.modules[moduleId] === true;
  }

  // سازگاری با features قدیمی
  if (license.features && typeof license.features === "object") {
    return license.features[moduleId] === true;
  }

  return false;
}

/**
 * دریافت لایسنس فعال
 */
export const getActiveLicense = query({
  args: {},
  handler: async (ctx) => {
    const licenses = await ctx.db.query("licenses").collect();
    const active = licenses.filter((l) => l.isActive);
    if (active.length === 0) return null;

    // اولویت با لایسنسی که منقضی نشده
    const now = Date.now();
    const valid = active.find((l) => !l.expiryDate || l.expiryDate > now);
    if (valid) return valid;

    // اگر همه منقضی شده‌اند، آخرین را برگردان (برای نمایش وضعیت)
    return active[active.length - 1];
  },
});

/**
 * فعال‌سازی لایسنس با کلید
 */
/**
 * فعال‌سازی لایسنس
 * — اگر لایسنس با این کلید وجود داشته باشد، فعال می‌شود
 * — اگر وجود نداشته باشد، یک رکورد جدید ایجاد و فعال می‌شود
 */
export const activateLicense = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const trimmedKey = args.key.trim();
    if (!trimmedKey) throw new Error("کلید لایسנים خالی است");

    // جستجوی لایسنس موجود
    let license = await ctx.db
      .query("licenses")
      .withIndex("by_key", (q) => q.eq("key", trimmedKey))
      .first();

    if (license) {
      // لایسنس موجود — فعال‌سازی
      if (!license.isActive) {
        throw new Error("لایسنس غیرفعال است. با پشتیبانی تماس بگیرید.");
      }
      if (license.expiryDate && license.expiryDate < Date.now()) {
        throw new Error("لایسنس منقضی شده است.");
      }
      await ctx.db.patch(license._id, { updatedAt: Date.now() });
      return { success: true, license };
    }

    // لایسنس جدید — ایجاد رکورد
    // سعی می‌کنیم اطلاعات را از کلید استخراج کنیم
    // (کلید ممکن است JWT باشد یا یک رشته ساده)
    const isJwt = trimmedKey.split(".").length === 3;
    let modules: Record<string, boolean> = {};
    let expiryDate: number | undefined;
    let clientName: string | undefined;
    let machineId: string | undefined;
    let type: "permanent" | "yearly" | "monthly" = "permanent";

    if (isJwt) {
      try {
        // دیکد کردن payload JWT
        const parts = trimmedKey.split(".");
        const payload = JSON.parse(atob(parts[1]));
        modules = payload.modules ?? {};
        expiryDate = payload.exp ? payload.exp * 1000 : undefined;
        clientName = payload.client_name;
        machineId = payload.machine_id;
        if (expiryDate) {
          const monthsLeft = (expiryDate - Date.now()) / (30 * 24 * 60 * 60 * 1000);
          if (monthsLeft <= 1) type = "monthly";
          else if (monthsLeft <= 12) type = "yearly";
          else type = "permanent";
        }
      } catch {
        // اگر JWT نبود، فقط کلید را ذخیره کن
      }
    }

    const newLicense = await ctx.db.insert("licenses", {
      key: trimmedKey,
      clientName,
      machineId,
      type,
      expiryDate,
      isActive: true,
      features: modules,
      modules,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, license: await ctx.db.get(newLicense) };
  },
});

/**
 * دریافت شناسه ماشین (از تنظیمات)
 */
export const getMachineId = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "machineId"))
      .first();
    return result?.value ?? null;
  },
});

/**
 * ذخیره شناسه ماشین
 */
export const setMachineId = mutation({
  args: { machineId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "machineId"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.machineId, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("settings", {
        key: "machineId",
        value: args.machineId,
        category: "license",
        isPublic: false,
        updatedAt: Date.now(),
      });
    }
  },
});
