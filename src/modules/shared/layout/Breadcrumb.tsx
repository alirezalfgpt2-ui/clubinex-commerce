import { Link, useLocation } from "react-router";
import {
  Home, Package, ShoppingCart, Users, BarChart3, Settings, Truck,
  Gift, MessageSquare, Bell, FileText, Tag, Scale, BookOpen,
  Shield, Calendar, ClipboardList, Star, Heart, ChevronLeft,
  LayoutDashboard, User, CreditCard, Newspaper
} from "lucide-react";

/**
 * نقشه مسیرها به فارسی و آیکون‌ها
 * تمام مسیرهای /dashboard/* را پشتیبانی می‌کند
 */
const ROUTE_MAP: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; noLink?: boolean }> = {
  dashboard: { label: "داشبورد", icon: LayoutDashboard },
  products: { label: "محصولات", icon: Package },
  categories: { label: "دسته‌بندی‌ها", icon: Tag },
  features: { label: "ویژگی محصولات", icon: Settings },
  brands: { label: "برندها", icon: Tag },
  orders: { label: "سفارشات", icon: ClipboardList },
  invoice: { label: "فاکتور", icon: FileText },
  cart: { label: "سبد خرید", icon: ShoppingCart },
  checkout: { label: "تسویه حساب", icon: CreditCard },
  bookings: { label: "نوبت‌دهی و رزرو", icon: Calendar },
  users: { label: "کاربران", icon: Users },
  profile: { label: "پروفایل من", icon: User },
  discounts: { label: "تخفیف‌ها", icon: Gift },
  shipping: { label: "روش ارسال", icon: Truck },
  tickets: { label: "تیکت و پشتیبانی", icon: Star },
  chat: { label: "چت زنده", icon: MessageSquare },
  notifications: { label: "اعلانات", icon: Bell },
  reports: { label: "گزارش‌ها و تحلیل", icon: BarChart3 },
  roles: { label: "نقش‌ها و دسترسی", icon: Shield },
  templates: { label: "قالب‌ها", icon: FileText },
  settings: { label: "تنظیمات", icon: Settings },
  compare: { label: "مقایسه محصولات", icon: Scale },
  blog: { label: "بلاگ و اخبار", icon: Newspaper },
};

/**
 * برادکرامپ حرفه‌ای و زیبا
 * - مسیر فعلی را خودکار تشخیص می‌دهد
 * - تمام لینک‌ها داخل /dashboard باقی می‌مانند
 * - آیکون + عنوان فارسی برای هر سطح
 * - انیمیشن و افکت‌های زیبا
 */
export function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // فیلتر کردن بخش "dashboard" از ابتدای مسیر
  const dashboardSegments = pathnames[0] === "dashboard" ? pathnames.slice(1) : pathnames;

  // اگر در صفحه اصلی داشبورد باشیم، برادکرامپ نشان نده
  if (dashboardSegments.length === 0) return null;

  // ساخت آیتم‌های برادکرامپ
  const breadcrumbs = dashboardSegments.map((segment, index) => {
    const isLast = index === dashboardSegments.length - 1;
    // مسیر تا این سطح
    const path = "/dashboard/" + dashboardSegments.slice(0, index + 1).join("/");
    // اطلاعات مسیر از نقشه
    const routeInfo = ROUTE_MAP[segment];
    
    // اگر segment در نقشه نبود (مثل slug یا id) یا noLink=true باشد، فقط متن نشان بده
    let isDynamicSegment = (!routeInfo && !isLast) || (routeInfo?.noLink === true);
    
    let label = routeInfo?.label;
    let Icon = routeInfo?.icon;
    
    // ترجمه کلمات کلیدی مشترک بر اساس والد
    if (segment === "new") {
       label = "افزودن جدید";
       isDynamicSegment = true;
    } else if (segment === "edit") {
       label = "ویرایش";
       isDynamicSegment = true;
    }
    
    if (!label) {
      label = decodeURIComponent(segment);
    }

    return { label, path, isLast, Icon, isDynamicSegment };
  });

  return (
    <nav className="flex items-center gap-1 text-sm py-2 px-1 overflow-x-auto" style={{ background: `var(--breadcrumb-bg, transparent)` }}>
      {/* خانه */}
      <Link
        to="/dashboard"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg px-2 py-1 hover:bg-primary/5 shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">داشبورد</span>
      </Link>

      {/* آیتم‌های برادکرامپ */}
      {breadcrumbs.map((crumb) => (
        <div key={crumb.path} className="flex items-center gap-1 shrink-0">
          {/* جداکننده */}
          <ChevronLeft className="h-3 w-3 text-muted-foreground/50" />

          {crumb.isLast || crumb.isDynamicSegment ? (
            /* آیتم فعلی یا سگмент غیرقابل کلیک (مثل edit) */
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-xs">
              {crumb.Icon && <crumb.Icon className="h-3.5 w-3.5" />}
              <span>{crumb.label}</span>
            </span>
          ) : (
            /* لینک به صفحه والد */
            <Link
              to={crumb.path}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-xs font-medium"
            >
              {crumb.Icon && <crumb.Icon className="h-3.5 w-3.5" />}
              <span>{crumb.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
