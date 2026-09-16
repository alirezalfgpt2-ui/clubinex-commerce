import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Menu, Bell, Search, LogOut, ShoppingCart, Store, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentTheme, applyTheme } from "@/config/themes";
import { formatJalaliDate, formatPersianTime, toPersianDigits } from "@/lib/jalali";

/** خواندن رنگ سفارشی تاپبار از CSS variable */
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
    // Re-apply theme with correct dark/light variant
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
    return v && v !== 'var(--background)' ? v : '';
  });

  // گوش دادن به تغییرات رنگ از CSS variable
  useEffect(() => {
    const interval = setInterval(() => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--topbar-bg").trim();
      setTopbarBg((prev) => (v && v !== 'var(--background)' ? v : '') !== prev ? (v && v !== 'var(--background)' ? v : '') : prev);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 transition-colors" style={{ background: topbarBg || undefined }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="clay-icon flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی محصولات..."
              className="clay-input h-8 w-56 pl-8 pr-3 text-sm outline-none"
            />
          </div>
        </form>
      </div>

      {/* Jalali Date & Time */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground/80">{formatPersianTime(now)}</span>
        <span className="text-border">|</span>
        <span>{formatJalaliDate(now)}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={toggleTheme} className="clay-icon flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors" title={isDark ? "حالت روشن" : "حالت تاریک"}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          to="/"
          className="clay-icon flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
          title="مشاهده فروشگاه"
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
          title="خروج از حساب"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
