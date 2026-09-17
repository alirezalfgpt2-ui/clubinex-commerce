/**
 * 🔐 هوک مدیریت لایسنس
 * — بررسی فعال بودن ماژول‌ها
 * — نمایش وضعیت لایسنس
 * — تولید Machine ID
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

/** ماژول‌های هسته‌ای — همیشه فعال */
export const CORE_MODULES = [
  "dashboard", "products", "categories", "orders", "users",
  "settings", "roles", "shipping", "discounts", "brands",
  "reports", "activity_logs",
];

/** تمام ماژول‌ها */
export const ALL_MODULES = [
  ...CORE_MODULES,
  "inventory", "warehouses", "blog", "chat", "tickets",
  "bookings", "vendors", "returns", "email_templates",
  "newsletters", "variants", "wallets", "reviews",
  "questions", "wishlists", "page_stats", "banners",
  "compare", "departments", "templates", "notifications",
  "gift_cards", "loyalty",
];

/**
 * هوک لایسنس — بررسی وضعیت و ماژول‌ها
 */
export function useLicense() {
  const license = useQuery(api.license.getActiveLicense);
  const machineIdSetting = useQuery(api.license.getMachineId);
  const activateLicense = useMutation(api.license.activateLicense);
  const setMachineId = useMutation(api.license.setMachineId);

  /** ماژول‌های فعال */
  const enabledModules = useMemo(() => {
    if (!license) return CORE_MODULES;

    // بدون modules = همه فعال (لایسنس قدیمی)
    if (!license.modules && !license.features) return ALL_MODULES;

    const modules: string[] = [...CORE_MODULES];

    const moduleMap = license.modules ?? license.features ?? {};
    for (const [key, value] of Object.entries(moduleMap)) {
      if (value === true && !modules.includes(key)) {
        modules.push(key);
      }
    }

    return modules;
  }, [license]);

  /** بررسی فعال بودن یک ماژول */
  const isModuleEnabled = (moduleId: string): boolean => {
    return enabledModules.includes(moduleId);
  };

  /** بررسی منقضی شدن لایسنس */
  const isExpired = useMemo(() => {
    if (!license) return false;
    if (!license.expiryDate) return false;
    return license.expiryDate < Date.now();
  }, [license]);

  /** روزهای باقی‌مانده */
  const daysRemaining = useMemo(() => {
    if (!license?.expiryDate) return null;
    const diff = license.expiryDate - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [license]);

  /** آماده بودن لایسنس */
  const isLoading = license === undefined;
  const hasLicense = !!license;

  return {
    license,
    isLoading,
    hasLicense,
    isExpired,
    daysRemaining,
    enabledModules,
    isModuleEnabled,
    activateLicense,
    setMachineId,
    machineId: machineIdSetting,
  };
}
