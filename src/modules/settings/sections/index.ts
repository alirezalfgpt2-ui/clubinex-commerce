import { Settings, Globe, Share2, Palette, Type, CreditCard, Truck, Hash, Mail, Phone, Bell, Shield, Lock, Key, Database, FileText, Languages, HelpCircle, MessageSquare, Images, Layout, Newspaper, Menu } from "lucide-react";
import { lazy, ComponentType } from "react";

/**
 * رجیستری بخش‌های تنظیمات
 * هر بخش با آیکون، برچسب و کامپوننت lazy-loaded
 */

export interface SectionConfig {
  id: string;
  label: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
}

// lazy imports
const GeneralSection = lazy(() => import("./GeneralSection"));
const SeoSection = lazy(() => import("./SeoSection"));
const SocialSection = lazy(() => import("./SocialSection"));
const ThemesSection = lazy(() => import("./ThemesSection"));
const FontSection = lazy(() => import("./FontSection"));
const PaymentSection = lazy(() => import("./PaymentSection"));
const EmailSection = lazy(() => import("./EmailSection"));
const SmsSection = lazy(() => import("./SmsSection"));
const NotificationsSection = lazy(() => import("./NotificationsSection"));
const CaptchaSection = lazy(() => import("./CaptchaSection"));
const LockscreenSection = lazy(() => import("./LockscreenSection"));
const TaxSection = lazy(() => import("./TaxSection"));
const ShippingSection = lazy(() => import("./ShippingSection"));
const LicenseSection = lazy(() => import("./LicenseSection"));
const SeedSection = lazy(() => import("./SeedSection"));
const ContentSection = lazy(() => import("./ContentSection"));
const TranslationsSection = lazy(() => import("./TranslationsSection"));
const ChatFaqSection = lazy(() => import("./ChatFaqSection"));
const ChatThemeSection = lazy(() => import("./ChatThemeSection"));
const HeroSection = lazy(() => import("./HeroSection"));
const LandingFeaturesSection = lazy(() => import("./LandingFeaturesSection"));
const FooterContentSection = lazy(() => import("./FooterContentSection"));
const AboutContactSection = lazy(() => import("./AboutContactSection"));
const ProductSectionsSection = lazy(() => import("./ProductSectionsSection").then((m) => ({ default: m.ProductSectionsSection })));
const LandingNavSection = lazy(() => import("./LandingNavSection"));

export const SECTION_GROUPS = [
  { label: "عمومی", items: ["general", "seo", "social"] },
  { label: "ظاهر", items: ["themes", "font"] },
  { label: "محتوا", items: ["content", "hero", "landing", "landingnav", "productsections", "footer", "about", "translations"] },
  { label: "فروش", items: ["payment", "shipping", "tax"] },
  { label: "ارتباطات", items: ["email", "sms", "notifications"] },
  { label: "امنیت", items: ["captcha", "lockscreen", "license"] },
  { label: "چت", items: ["chattheme", "chatfaq"] },
  { label: "ابزار", items: ["seed"] },
];

export const SECTIONS: SectionConfig[] = [
  { id: "general", label: "عمومی", desc: "نام سایت، اطلاعات تماس", icon: Settings, component: GeneralSection },
  { id: "seo", label: "سئو", desc: "متاتگ‌ها و بهینه‌سازی", icon: Globe, component: SeoSection },
  { id: "social", label: "شبکه‌های اجتماعی", desc: "لینک‌های اجتماعی", icon: Share2, component: SocialSection },
  { id: "themes", label: "تم و رنگ‌بندی", desc: "قالب و رنگ سایت", icon: Palette, component: ThemesSection },
  { id: "font", label: "فونت", desc: "فونت و اندازه متن", icon: Type, component: FontSection },
  { id: "payment", label: "درگاه پرداخت", desc: "تنظیمات پرداخت آنلاین", icon: CreditCard, component: PaymentSection },
  { id: "shipping", label: "ارسال و حمل", desc: "روش‌های ارسال", icon: Truck, component: ShippingSection },
  { id: "tax", label: "مالیات", desc: "نرخ مالیات و عوارض", icon: Hash, component: TaxSection },
  { id: "email", label: "ایمیل (SMTP)", desc: "سرور ایمیل", icon: Mail, component: EmailSection },
  { id: "sms", label: "پیامک", desc: "پنل اس‌ام‌اس", icon: Phone, component: SmsSection },
  { id: "notifications", label: "اعلانات", desc: "نوتیفیکیشن‌ها", icon: Bell, component: NotificationsSection },
  { id: "captcha", label: "کپچا", desc: "محافظت از فرم‌ها", icon: Shield, component: CaptchaSection },
  { id: "lockscreen", label: "قفل صفحه", desc: "قفل خودکار", icon: Lock, component: LockscreenSection },
  { id: "license", label: "لایسنس", desc: "مدیریت مجوز", icon: Key, component: LicenseSection },
  { id: "seed", label: "داده‌های تستی", desc: "ایجاد نمونه", icon: Database, component: SeedSection },
  { id: "content", label: "مدیریت محتوا", desc: "صفحات قانونی و لوگوها", icon: FileText, component: ContentSection },
  { id: "hero", label: "اسلایدر هیرو", desc: "اسلایدهای صفحه اصلی", icon: Images, component: HeroSection },
  { id: "landing", label: "ویژگی‌ها و بنرها", desc: "نوار ویژگی و بنرهای صفحه هوم", icon: Layout, component: LandingFeaturesSection },
  { id: "landingnav", label: "ناوبری صفحه اصلی", desc: "سفارشی‌سازی ۳ ردیف نوار ناوبری", icon: Menu, component: LandingNavSection },
  { id: "productsections", label: "بخش‌های محصولات", desc: "تنظیم بخش‌های داینامیک صفحه اصلی", icon: Layout, component: ProductSectionsSection },
  { id: "footer", label: "فوتر و تماس", desc: "اطلاعات تماس و لینک‌های فوتر", icon: Newspaper, component: FooterContentSection },
  { id: "about", label: "درباره و تماس", desc: "محتوای صفحات درباره و تماس", icon: Shield, component: AboutContactSection },
  { id: "translations", label: "ترجمه‌ها (چندزبانه)", desc: "ویرایش ترجمه‌های فارسی/انگلیسی", icon: Languages, component: TranslationsSection },
  { id: "chattheme", label: "ظاهر چت زنده", desc: "رنگ و ظاهر ویجت چت", icon: MessageSquare, component: ChatThemeSection },
  { id: "chatfaq", label: "سؤالات متداول چت", desc: "FAQ برای چت زنده", icon: HelpCircle, component: ChatFaqSection },
];

/** پیدا کردن بخش با شناسه */
export function getSectionById(id: string): SectionConfig | undefined {
  return SECTIONS.find((s) => s.id === id);
}
