// Lightweight i18n system for Farsi and English
// سیستم چندزبانه ساده برای فارسی و انگلیسی

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";

const translations: Record<string, Record<string, string>> = {
  fa: {
    "app.name": "فروشگاه",
    "app.loading": "در حال بارگذاری...",
    "app.save": "ذخیره",
    "app.cancel": "لغو",
    "app.delete": "حذف",
    "app.edit": "ویرایش",
    "app.add": "افزودن",
    "app.search": "جستجو",
    "app.back": "بازگشت",
    "app.confirm": "تایید",
    "app.close": "بستن",
    "app.noData": "داده‌ای یافت نشد",
    "nav.home": "خانه",
    "nav.store": "فروشگاه",
    "nav.cart": "سبد خرید",
    "nav.checkout": "تسویه حساب",
    "nav.profile": "پروفایل",
    "nav.orders": "سفارشات",
    "nav.favorites": "علاقه‌مندی‌ها",
    "nav.about": "درباره ما",
    "nav.contact": "تماس با ما",
    "nav.login": "ورود",
    "nav.register": "ثبت‌نام",
    "nav.logout": "خروج",
    "nav.dashboard": "پنل مدیریت",
    "nav.trackOrder": "پیگیری سفارش",
    "product.price": "قیمت",
    "product.addToCart": "افزودن به سبد",
    "product.inStock": "موجود",
    "product.outOfStock": "ناموجود",
    "cart.title": "سبد خرید",
    "cart.empty": "سبد خرید شما خالی است",
    "cart.total": "مبلغ نهایی",
    "cart.checkout": "تکمیل خرید",
    "order.status": "وضعیت سفارش",
    "order.pending": "در انتظار",
    "order.delivered": "تحویل شده",
    "payment.success": "پرداخت موفق",
    "payment.failed": "پرداخت ناموفق",
    "settings.title": "تنظیمات",
    "settings.general": "عمومی",
    "settings.seo": "سئو",
    "settings.payment": "پرداخت",
    "settings.email": "ایمیل",
    "settings.sms": "پیامک",
    "settings.tax": "مالیات",
    "settings.font": "فونت",
    "settings.theme": "تم",
    "settings.license": "لایسنس",
  },
  en: {
    "app.name": "Store",
    "app.loading": "Loading...",
    "app.save": "Save",
    "app.cancel": "Cancel",
    "app.delete": "Delete",
    "app.edit": "Edit",
    "app.add": "Add",
    "app.search": "Search",
    "app.back": "Back",
    "app.confirm": "Confirm",
    "app.close": "Close",
    "app.noData": "No data found",
    "nav.home": "Home",
    "nav.store": "Store",
    "nav.cart": "Cart",
    "nav.checkout": "Checkout",
    "nav.profile": "Profile",
    "nav.orders": "Orders",
    "nav.favorites": "Favorites",
    "nav.about": "About Us",
    "nav.contact": "Contact Us",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",
    "nav.dashboard": "Admin Panel",
    "nav.trackOrder": "Track Order",
    "product.price": "Price",
    "product.addToCart": "Add to Cart",
    "product.inStock": "In Stock",
    "product.outOfStock": "Out of Stock",
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "order.status": "Order Status",
    "order.pending": "Pending",
    "order.delivered": "Delivered",
    "payment.success": "Payment Successful",
    "payment.failed": "Payment Failed",
    "settings.title": "Settings",
    "settings.general": "General",
    "settings.seo": "SEO",
    "settings.payment": "Payment",
    "settings.email": "Email",
    "settings.sms": "SMS",
    "settings.tax": "Tax",
    "settings.font": "Font",
    "settings.theme": "Theme",
    "settings.license": "License",
  },
};

export type Locale = "fa" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children, defaultLocale = "fa" }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("store_locale");
    return (saved as Locale) || defaultLocale;
  });

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("store_locale", newLocale);
    document.documentElement.dir = newLocale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale] || translations.fa;
      let value = dict[key] || translations.fa[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t, dir: locale === "fa" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "fa" as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      dir: "rtl" as const,
    };
  }
  return context;
}
