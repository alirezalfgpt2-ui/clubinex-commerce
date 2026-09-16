import {
  LayoutDashboard, Package, FolderTree, SlidersHorizontal, Scale, Tag,
  ShoppingCart, ShoppingBag, CreditCard, Gift, Truck, CalendarDays,
  Users, MessageSquare, Bell, BarChart3, Newspaper, Shield, FileText,
  User, Settings, Building2, Headphones, Globe, DollarSign, Zap, Heart,
  Star, Briefcase,
} from "lucide-react";
import type { ComponentType } from "react";

/** نقشه آیکون‌ها — با نام رشته‌ای قابل فعال‌سازی */
export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard, Package, FolderTree, SlidersHorizontal, Scale, Tag,
  ShoppingCart, ShoppingBag, CreditCard, Gift, Truck, CalendarDays,
  Users, MessageSquare, Bell, BarChart3, Newspaper, Shield, FileText,
  User, Settings, Building2, Headphones, Globe, DollarSign, Zap, Heart,
  Star, Briefcase,
};

export interface SidebarItem {
  to: string;
  icon: string;
  label: string;
}

export interface SidebarGroup {
  id: string;
  label: string;
  items: SidebarItem[];
}

/** گروه‌های ناوبری سایدبار */
export const NAV_GROUPS: SidebarGroup[] = [
  {
    id: "home",
    label: "خانه",
    items: [{ to: "/dashboard", icon: "LayoutDashboard", label: "داشبورد" }],
  },
  {
    id: "shop",
    label: "فروشگاه",
    items: [
      { to: "/dashboard/products", icon: "Package", label: "محصولات" },
      { to: "/dashboard/categories", icon: "FolderTree", label: "دسته‌بندی‌ها" },
      { to: "/dashboard/features", icon: "SlidersHorizontal", label: "ویژگی محصولات" },
      { to: "/dashboard/compare", icon: "Scale", label: "مقایسه محصولات" },
      { to: "/dashboard/brands", icon: "Tag", label: "برندها" },
      { to: "/dashboard/banners", icon: "Briefcase", label: "بنرها و کمپین‌ها" },
    ],
  },
  {
    id: "sales",
    label: "فروش و سفارشات",
    items: [
      { to: "/dashboard/orders", icon: "ShoppingBag", label: "سفارشات" },
      { to: "/dashboard/cart", icon: "ShoppingCart", label: "سبد خرید" },
      { to: "/dashboard/checkout", icon: "CreditCard", label: "تسویه حساب" },
      { to: "/dashboard/discounts", icon: "Gift", label: "تخفیف‌ها" },
      { to: "/dashboard/shipping", icon: "Truck", label: "روش ارسال" },
      { to: "/dashboard/bookings", icon: "CalendarDays", label: "نوبت‌دهی و رزرو" },
    ],
  },
  {
    id: "communication",
    label: "ارتباطات",
    items: [
      { to: "/dashboard/users", icon: "Users", label: "کاربران" },
      { to: "/dashboard/tickets", icon: "FileText", label: "تیکت و پشتیبانی" },
      { to: "/dashboard/chat", icon: "MessageSquare", label: "چت زنده" },
      { to: "/dashboard/notifications", icon: "Bell", label: "اعلان‌ها" },
      { to: "/dashboard/departments", icon: "Building2", label: "دپارتمان‌ها" },
    ],
  },
  {
    id: "reports",
    label: "گزارش‌ها",
    items: [
      { to: "/dashboard/reports", icon: "BarChart3", label: "گزارش‌ها و تحلیل" },
      { to: "/dashboard/logs", icon: "FileText", label: "لاگ فعالیت‌ها" },
      { to: "/dashboard/blog", icon: "Newspaper", label: "بلاگ و اخبار" },
    ],
  },
  {
    id: "system",
    label: "مدیریت سیستم",
    items: [
      { to: "/dashboard/roles", icon: "Shield", label: "نقش‌ها و دسترسی" },
      { to: "/dashboard/templates", icon: "FileText", label: "قالب‌ها" },
      { to: "/dashboard/profile", icon: "User", label: "پروفایل من" },
      { to: "/dashboard/settings", icon: "Settings", label: "تنظیمات" },
    ],
  },
];

export const STORAGE_KEY = "sidebar_groups";
