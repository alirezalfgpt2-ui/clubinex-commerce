/**
 * هوک خواندن تنظیمات نوار ناوبری صفحه اصلی
 * خواندن از دیتابیس با پیش‌فرضهای جامع
 */
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface NavItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  visible: boolean;
  openInNewTab?: boolean;
}

export interface NavRow1Config {
  bgColor: string;
  textColor: string;
  rightItems: NavItem[];
  centerItems: NavItem[];
  leftItems: NavItem[];
}

export interface NavRow2Config {
  bgColor: string;
  borderColor: string;
  showSearch: boolean;
  searchPlaceholder: string;
  showWishlist: boolean;
  showCart: boolean;
  showAuth: boolean;
  authLabel: string;
  logoLabel: string;
  logoSubLabel: string;
}

export interface NavRow3Config {
  bgColor: string;
  textColor: string;
  activeColor: string;
  leftItems: NavItem[];
  centerLabel: string;
  centerUrl: string;
  rightItems: NavItem[];
  /** شناسه دسته‌بندی‌های مخفی (فقط در تنظیمات نشان داده می‌شوند) */
  hiddenCategoryIds: string[];
}

export interface LandingNavConfig {
  row1: NavRow1Config;
  row2: NavRow2Config;
  row3: NavRow3Config;
}

const CATEGORY = "landingNav";

/** پیش‌فرضها */
const DEFAULT_ROW1: NavRow1Config = {
  bgColor: "#111827", textColor: "#d1d5db",
  rightItems: [
    { id: "phone", label: "۰۲۱-۱۲۳۴۵۶۷۸", url: "tel:02112345678", icon: "Phone", visible: true },
    { id: "email", label: "support@clubinex.com", url: "mailto:support@clubinex.com", icon: "Mail", visible: true },
  ],
  centerItems: [
    { id: "track-order", label: "پیگیری سفارش", url: "/track-order", icon: "Package", visible: true },
  ],
  leftItems: [
    { id: "instagram", label: "اینستاگرام", url: "https://instagram.com/clubinex", icon: "Instagram", visible: true },
    { id: "telegram", label: "تلگرام", url: "https://t.me/clubinex", icon: "MessageCircle", visible: true },
  ],
};

const DEFAULT_ROW2: NavRow2Config = {
  bgColor: "#ffffff", borderColor: "#f3f4f6",
  showSearch: true, searchPlaceholder: "چی میخوای پیدا کنی؟",
  showWishlist: true, showCart: true, showAuth: true,
  authLabel: "ورود / ثبت‌نام", logoLabel: "فروشگاه آنلاین", logoSubLabel: "",
};

const DEFAULT_ROW3: NavRow3Config = {
  bgColor: "#ffffff", textColor: "#4b5563", activeColor: "#6366f1",
  leftItems: [
    { id: "about", label: "درباره ما", url: "/about", icon: "Info", visible: true },
    { id: "contact", label: "تماس با ما", url: "/contact", icon: "Phone", visible: true },
    { id: "blog", label: "بلاگ", url: "/blog", icon: "Newspaper", visible: true },
  ],
  centerLabel: "فروشگاه", centerUrl: "/products",
  rightItems: [],
  hiddenCategoryIds: [],
};

/** ادغام آیتم‌ها با پیش‌فرض */
function mergeItems(raw: any, fallback: NavItem[]): NavItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  return raw.map((item: any) => ({
    id: item.id || Math.random().toString(36).slice(2, 8),
    label: item.label || "",
    url: item.url || "#",
    icon: item.icon || "",
    visible: item.visible !== false,
    openInNewTab: item.openInNewTab || false,
  }));
}

/**
 * خواندن تنظیمات نوار ناوبری از دیتابیس
 * با پیش‌فرضهای کامل در صورت نبود داده
 */
export function useLandingNav(): LandingNavConfig {
  const settings = useQuery(api.settings.getByCategory, { category: CATEGORY });

  if (!settings) {
    return { row1: DEFAULT_ROW1, row2: DEFAULT_ROW2, row3: DEFAULT_ROW3 };
  }

  const findVal = (key: string) => settings.find((s) => s.key === key)?.value;

  const row1Raw = (() => { try { return JSON.parse(findVal("navRow1") || "null"); } catch { return null; } })();
  const row2Raw = (() => { try { return JSON.parse(findVal("navRow2") || "null"); } catch { return null; } })();
  const row3Raw = (() => { try { return JSON.parse(findVal("navRow3") || "null"); } catch { return null; } })();

  const row1: NavRow1Config = row1Raw ? {
    bgColor: row1Raw.bgColor || DEFAULT_ROW1.bgColor,
    textColor: row1Raw.textColor || DEFAULT_ROW1.textColor,
    rightItems: mergeItems(row1Raw.rightItems, DEFAULT_ROW1.rightItems),
    centerItems: mergeItems(row1Raw.centerItems, DEFAULT_ROW1.centerItems),
    leftItems: mergeItems(row1Raw.leftItems, DEFAULT_ROW1.leftItems),
  } : DEFAULT_ROW1;

  const row2: NavRow2Config = row2Raw ? {
    bgColor: row2Raw.bgColor || DEFAULT_ROW2.bgColor,
    borderColor: row2Raw.borderColor || DEFAULT_ROW2.borderColor,
    showSearch: row2Raw.showSearch !== false,
    searchPlaceholder: row2Raw.searchPlaceholder || DEFAULT_ROW2.searchPlaceholder,
    showWishlist: row2Raw.showWishlist !== false,
    showCart: row2Raw.showCart !== false,
    showAuth: row2Raw.showAuth !== false,
    authLabel: row2Raw.authLabel || DEFAULT_ROW2.authLabel,
    logoLabel: row2Raw.logoLabel || DEFAULT_ROW2.logoLabel,
    logoSubLabel: row2Raw.logoSubLabel ?? DEFAULT_ROW2.logoSubLabel,
  } : DEFAULT_ROW2;

  const row3: NavRow3Config = row3Raw ? {
    bgColor: row3Raw.bgColor || DEFAULT_ROW3.bgColor,
    textColor: row3Raw.textColor || DEFAULT_ROW3.textColor,
    activeColor: row3Raw.activeColor || DEFAULT_ROW3.activeColor,
    leftItems: mergeItems(row3Raw.leftItems, DEFAULT_ROW3.leftItems),
    centerLabel: row3Raw.centerLabel || DEFAULT_ROW3.centerLabel,
    centerUrl: row3Raw.centerUrl || DEFAULT_ROW3.centerUrl,
    rightItems: mergeItems(row3Raw.rightItems, DEFAULT_ROW3.rightItems),
    hiddenCategoryIds: Array.isArray(row3Raw.hiddenCategoryIds) ? row3Raw.hiddenCategoryIds : [],
  } : DEFAULT_ROW3;

  return { row1, row2, row3 };
}
