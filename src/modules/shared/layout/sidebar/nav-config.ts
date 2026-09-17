import {
  LayoutDashboard, Package, FolderTree, SlidersHorizontal, Scale, Tag,
  ShoppingCart, ShoppingBag, CreditCard, Gift, Truck, CalendarDays,
  Users, MessageSquare, Bell, BarChart3, Newspaper, Shield, FileText,
  User, Settings, Building2, Headphones, Globe, DollarSign, Zap, Heart,
  Star, Briefcase, RotateCcw, Store, Warehouse, Boxes, ClipboardList,
  MessageCircle, HelpCircle, Palette, Wallet, Eye, Bookmark, Mail, Send,
} from "lucide-react";
import type { ComponentType } from "react";

/** نقشه آیکون‌ها — با نام رشته‌ای قابل فعال‌سازی */
export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard, Package, FolderTree, SlidersHorizontal, Scale, Tag,
  ShoppingCart, ShoppingBag, CreditCard, Gift, Truck, CalendarDays,
  Users, MessageSquare, Bell, BarChart3, Newspaper, Shield, FileText,
  User, Settings, Building2, Headphones, Globe, DollarSign, Zap, Heart,
  Star, Briefcase, RotateCcw, Store, Warehouse, Boxes, ClipboardList,
  MessageCircle, HelpCircle, Palette, Wallet, Eye, Bookmark, Mail, Send,
};

export interface SidebarItem {
  to: string;
  icon: string;
  label: string;
  /** شناسه ماژول لایسنس — بدون آن = همیشه نمایش داده می‌شود */
  module?: string;
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
    items: [{ to: "/dashboard", icon: "LayoutDashboard", label: "داشبورد", module: "dashboard" }],
  },
  {
    id: "shop",
    label: "فروشگاه",
    items: [
      { to: "/dashboard/products", icon: "Package", label: "محصولات", module: "products" },
      { to: "/dashboard/categories", icon: "FolderTree", label: "دسته‌بندی‌ها", module: "categories" },
      { to: "/dashboard/features", icon: "SlidersHorizontal", label: "ویژگی محصولات", module: "products" },
      { to: "/dashboard/compare", icon: "Scale", label: "مقایسه محصولات", module: "compare" },
      { to: "/dashboard/brands", icon: "Tag", label: "برندها", module: "brands" },
      { to: "/dashboard/banners", icon: "Briefcase", label: "بنرها و کمپین‌ها", module: "banners" },
    ],
  },
  {
    id: "sales",
    label: "فروش و سفارشات",
    items: [
      { to: "/dashboard/orders", icon: "ShoppingBag", label: "سفارشات", module: "orders" },
      { to: "/dashboard/cart", icon: "ShoppingCart", label: "سبد خرید", module: "orders" },
      { to: "/dashboard/checkout", icon: "CreditCard", label: "تسویه حساب", module: "orders" },
      { to: "/dashboard/discounts", icon: "Gift", label: "تخفیف‌ها", module: "discounts" },
      { to: "/dashboard/shipping", icon: "Truck", label: "روش ارسال", module: "shipping" },
      { to: "/dashboard/bookings", icon: "CalendarDays", label: "نوبت‌دهی و رزرو", module: "bookings" },
    ],
  },
  {
    id: "communication",
    label: "ارتباطات",
    items: [
      { to: "/dashboard/users", icon: "Users", label: "کاربران", module: "users" },
      { to: "/dashboard/tickets", icon: "FileText", label: "تیکت و پشتیبانی", module: "tickets" },
      { to: "/dashboard/chat", icon: "MessageSquare", label: "چت زنده", module: "chat" },
      { to: "/dashboard/notifications", icon: "Bell", label: "اعلان‌ها", module: "notifications" },
      { to: "/dashboard/departments", icon: "Building2", label: "دپارتمان‌ها", module: "departments" },
    ],
  },
  {
    id: "engagement",
    label: "تعاملات کاربری",
    items: [
      { to: "/dashboard/reviews", icon: "MessageCircle", label: "نظرات و امتیازات", module: "reviews" },
      { to: "/dashboard/questions", icon: "HelpCircle", label: "پرسش و پاسخ", module: "questions" },
      { to: "/dashboard/wishlists-admin", icon: "Heart", label: "علاقه‌مندی‌ها", module: "wishlists" },
      { to: "/dashboard/page-stats", icon: "Eye", label: "آمار بازدید", module: "page_stats" },
    ],
  },
  {
    id: "variants",
    label: "متغیرهای محصول",
    items: [
      { to: "/dashboard/variants", icon: "Palette", label: "مدیریت متغیرها", module: "variants" },
      { to: "/dashboard/wallets", icon: "Wallet", label: "کیف پول و وفاداری", module: "wallets" },
    ],
  },
  {
    id: "reports",
    label: "گزارش‌ها",
    items: [
      { to: "/dashboard/reports", icon: "BarChart3", label: "گزارش‌ها و تحلیل", module: "reports" },
      { to: "/dashboard/logs", icon: "FileText", label: "لاگ فعالیت‌ها", module: "activity_logs" },
      { to: "/dashboard/blog", icon: "Newspaper", label: "بلاگ و اخبار", module: "blog" },
    ],
  },
  {
    id: "inventory",
    label: "انبارداری",
    items: [
      { to: "/dashboard/inventory", icon: "Boxes", label: "موجودی انبار", module: "inventory" },
      { to: "/dashboard/warehouses", icon: "Warehouse", label: "انبارها", module: "warehouses" },
      { to: "/dashboard/inventory-movements", icon: "ClipboardList", label: "گردش موجودی", module: "inventory" },
    ],
  },
  {
    id: "after_sales",
    label: "خدمات پس از فروش",
    items: [
      { to: "/dashboard/returns", icon: "RotateCcw", label: "مرجوعی کالا", module: "returns" },
      { to: "/dashboard/vendors", icon: "Store", label: "فروشندگان", module: "vendors" },
    ],
  },
  {
    id: "marketing",
    label: "بازاریابی",
    items: [
      { to: "/dashboard/email-templates", icon: "Mail", label: "قالب‌های ایمیل", module: "email_templates" },
      { to: "/dashboard/newsletters", icon: "Send", label: "خبرنامه", module: "newsletters" },
    ],
  },
  {
    id: "system",
    label: "مدیریت سیستم",
    items: [
      { to: "/dashboard/roles", icon: "Shield", label: "نقش‌ها و دسترسی", module: "roles" },
      { to: "/dashboard/templates", icon: "FileText", label: "قالب‌ها", module: "templates" },
      { to: "/dashboard/profile", icon: "User", label: "پروفایل من" },
      { to: "/dashboard/settings", icon: "Settings", label: "تنظیمات" },
    ],
  },
];

export const STORAGE_KEY = "sidebar_groups";
