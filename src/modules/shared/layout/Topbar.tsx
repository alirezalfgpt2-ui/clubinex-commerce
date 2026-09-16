import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Menu, Bell, Search, LogOut, ShoppingCart, Store, Sun, Moon, Package, Warehouse, RotateCcw, Users, Activity, LayoutGrid, FolderTree, Tag, Scale, CreditCard, Truck, CalendarDays, FileText, MessageSquare, Shield, Settings, Building2, Newspaper, Eye, BarChart3, Palette, Wallet, Bookmark, Heart, HelpCircle, Mail, Send, Boxes, ClipboardList, SlidersHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getCurrentTheme, applyTheme } from "@/config/themes";
import { formatJalaliDate, formatPersianTime, toPersianDigits } from "@/lib/jalali"

function getCustomTopbarColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--topbar-bg").trim() || "";
}

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const cartTotal = useQuery(api.cart.getCartTotal);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(Date.now());
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(newIsDark);
    const currentTheme = getCurrentTheme();
    if (currentTheme) applyTheme(currentTheme);
    localStorage.setItem("clubinex-dark-mode", String(newIsDark));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const [topbarBg, setTopbarBg] = useState(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--topbar-bg").trim();
    return v && v !== "var(--background)" ? v : "";
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--topbar-bg").trim();
      setTopbarBg((prev) => (v && v !== "var(--background)" ? v : "") !== prev ? (v && v !== "var(--background)" ? v : "") : prev);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 transition-colors shrink-0" style={{ background: topbarBg || undefined }}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="clay-icon flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>

        <form onSubmit={handleSearch} className="hidden md:flex items-center min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو..."
              className="clay-input h-8 w-44 pl-8 pr-3 text-sm outline-none"
            />
          </div>
        </form>
      </div>

      {/* Jalali Date & Time */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <span className="font-medium text-foreground/80">{formatPersianTime(now)}</span>
        <span className="text-border">|</span>
        <span>{formatJalaliDate(now)}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <QuickMenu />

        <button onClick={toggleTheme} className="clay-icon flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors" title={isDark ? "حالت روشن" : "حالت تاریک"}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          to="/"
          className="clay-icon flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
          title="فروشگاه"
        >
          <Store className="h-4 w-4" />
        </Link>

        <Link
          to="/dashboard/cart"
          className="clay-icon relative flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
          title="سبد خرید"
        >
          <ShoppingCart className="h-4 w-4" />
          {cartTotal && cartTotal.count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
              {toPersianDigits(cartTotal.count)}
            </span>
          )}
        </Link>

        <Link
          to="/dashboard/notifications"
          className="clay-icon relative flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
          title="اعلانات"
        >
          <Bell className="h-4 w-4" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {toPersianDigits(unreadCount)}
            </span>
          )}
        </Link>

        <button
          onClick={handleSignOut}
          className="clay-icon flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
          title="خروج"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

/**
 * آیتم‌های نوار سریع — فقط آیکون، بدون متن، اسکرول افقی
 */
interface NavItem {
  label: string;
  path: string;
  icon: any;
  gradient: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "محصولات", path: "/dashboard/products", icon: Package, gradient: "linear-gradient(135deg, #6366f1, #818cf8)" },
  { label: "دسته‌بندی", path: "/dashboard/categories", icon: FolderTree, gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)" },
  { label: "برندها", path: "/dashboard/brands", icon: Tag, gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
  { label: "ویژگی‌ها", path: "/dashboard/features", icon: SlidersHorizontal, gradient: "linear-gradient(135deg, #14b8a6, #5eead4)" },
  { label: "مقایسه", path: "/dashboard/compare", icon: Scale, gradient: "linear-gradient(135deg, #f97316, #fb923c)" },
  { label: "بنرها", path: "/dashboard/banners", icon: Newspaper, gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
  { label: "سفارشات", path: "/dashboard/orders", icon: ShoppingCart, gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
  { label: "تخفیف‌ها", path: "/dashboard/discounts", icon: CreditCard, gradient: "linear-gradient(135deg, #10b981, #34d399)" },
  { label: "ارسال", path: "/dashboard/shipping", icon: Truck, gradient: "linear-gradient(135deg, #64748b, #94a3b8)" },
  { label: "نوبت‌دهی", path: "/dashboard/bookings", icon: CalendarDays, gradient: "linear-gradient(135deg, #d946ef, #f0abfc)" },
  { label: "کاربران", path: "/dashboard/users", icon: Users, gradient: "linear-gradient(135deg, #22c55e, #4ade80)" },
  { label: "تیکت", path: "/dashboard/tickets", icon: FileText, gradient: "linear-gradient(135deg, #f43f5e, #fb7185)" },
  { label: "چت", path: "/dashboard/chat", icon: MessageSquare, gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
  { label: "اعلانات", path: "/dashboard/notifications", icon: Bell, gradient: "linear-gradient(135deg, #eab308, #facc15)" },
  { label: "دپارتمان", path: "/dashboard/departments", icon: Building2, gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
  { label: "نظرات", path: "/dashboard/reviews", icon: Heart, gradient: "linear-gradient(135deg, #e11d48, #fb7185)" },
  { label: "پرسش", path: "/dashboard/questions", icon: HelpCircle, gradient: "linear-gradient(135deg, #2563eb, #60a5fa)" },
  { label: "علاقه‌مندی", path: "/dashboard/wishlists-admin", icon: Bookmark, gradient: "linear-gradient(135deg, #dc2626, #f87171)" },
  { label: "آمار", path: "/dashboard/page-stats", icon: Eye, gradient: "linear-gradient(135deg, #0891b2, #22d3ee)" },
  { label: "متغیرها", path: "/dashboard/variants", icon: Palette, gradient: "linear-gradient(135deg, #d946ef, #f0abfc)" },
  { label: "کیف پول", path: "/dashboard/wallets", icon: Wallet, gradient: "linear-gradient(135deg, #059669, #34d399)" },
  { label: "گزارش", path: "/dashboard/reports", icon: BarChart3, gradient: "linear-gradient(135deg, #84cc16, #a3e635)" },
  { label: "بلاگ", path: "/dashboard/blog", icon: Newspaper, gradient: "linear-gradient(135deg, #7c3aed, #c084fc)" },
  { label: "انبارداری", path: "/dashboard/inventory", icon: Boxes, gradient: "linear-gradient(135deg, #0d9488, #5eead4)" },
  { label: "انبارها", path: "/dashboard/warehouses", icon: Warehouse, gradient: "linear-gradient(135deg, #1e40af, #60a5fa)" },
  { label: "گردش", path: "/dashboard/inventory-movements", icon: ClipboardList, gradient: "linear-gradient(135deg, #b45309, #fbbf24)" },
  { label: "مرجوعی", path: "/dashboard/returns", icon: RotateCcw, gradient: "linear-gradient(135deg, #be123c, #fb7185)" },
  { label: "فروشندگان", path: "/dashboard/vendors", icon: Store, gradient: "linear-gradient(135deg, #9333ea, #c084fc)" },
  { label: "قالب‌ها", path: "/dashboard/templates", icon: Mail, gradient: "linear-gradient(135deg, #4338ca, #818cf8)" },
  { label: "ایمیل", path: "/dashboard/email-templates", icon: Send, gradient: "linear-gradient(135deg, #0369a1, #38bdf8)" },
  { label: "خبرنامه", path: "/dashboard/newsletters", icon: Mail, gradient: "linear-gradient(135deg, #15803d, #4ade80)" },
  { label: "لاگ", path: "/dashboard/logs", icon: Activity, gradient: "linear-gradient(135deg, #475569, #94a3b8)" },
  { label: "نقش‌ها", path: "/dashboard/roles", icon: Shield, gradient: "linear-gradient(135deg, #1e293b, #64748b)" },
  { label: "تنظیمات", path: "/dashboard/settings", icon: Settings, gradient: "linear-gradient(135deg, #334155, #94a3b8)" },
];

function QuickMenu() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-1 overflow-x-auto py-1"
      style={{ scrollbarWidth: "none", maxWidth: "220px" }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-center justify-center p-1 rounded-lg hover:bg-muted/50 transition-all duration-200 shrink-0 group/item"
            title={item.label}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md text-white shadow-sm group-hover/item:shadow-md group-hover/item:scale-110 transition-all"
              style={{ background: item.gradient }}
            >
              <Icon className="h-3 w-3" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
