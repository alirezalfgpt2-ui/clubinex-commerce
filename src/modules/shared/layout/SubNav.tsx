/**
 * نوار ناوبری سریع — زیر تاپبار
 * طراحی زیبا با کارت‌های گرادیانت مشابه داشبورد
 * اسکرول افقی + فلش‌های راهنما
 */
import { Link, useLocation } from "react-router";
import { useRef, useState, useEffect } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings,
  Truck, Gift, MessageSquare, Bell, FileText, Tag, Scale, BookOpen,
  Shield, Palette, Calendar, ClipboardList, Star, Heart, Warehouse,
  RotateCcw, Store, Boxes, Mail, Send, Eye, Bookmark, HelpCircle,
  Wallet, Activity, Building2, Newspaper, SlidersHorizontal
} from "lucide-react";

interface SubNavItem {
  to: string;
  icon: any;
  label: string;
  gradient: string;
}

const SUB_NAV_ITEMS: SubNavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "داشبورد", gradient: "linear-gradient(135deg, #6366f1, #818cf8)" },
  { to: "/dashboard/products", icon: Package, label: "محصولات", gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
  { to: "/dashboard/orders", icon: ClipboardList, label: "سفارشات", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
  { to: "/dashboard/users", icon: Users, label: "کاربران", gradient: "linear-gradient(135deg, #22c55e, #4ade80)" },
  { to: "/dashboard/discounts", icon: Gift, label: "تخفیف‌ها", gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
  { to: "/dashboard/shipping", icon: Truck, label: "ارسال", gradient: "linear-gradient(135deg, #64748b, #94a3b8)" },
  { to: "/dashboard/inventory", icon: Boxes, label: "انبارداری", gradient: "linear-gradient(135deg, #0d9488, #5eead4)" },
  { to: "/dashboard/warehouses", icon: Warehouse, label: "انبارها", gradient: "linear-gradient(135deg, #1e40af, #60a5fa)" },
  { to: "/dashboard/returns", icon: RotateCcw, label: "مرجوعی", gradient: "linear-gradient(135deg, #be123c, #fb7185)" },
  { to: "/dashboard/vendors", icon: Store, label: "فروشندگان", gradient: "linear-gradient(135deg, #9333ea, #c084fc)" },
  { to: "/dashboard/reports", icon: BarChart3, label: "گزارشات", gradient: "linear-gradient(135deg, #84cc16, #a3e635)" },
  { to: "/dashboard/chat", icon: MessageSquare, label: "چت", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
  { to: "/dashboard/tickets", icon: Star, label: "تیکت", gradient: "linear-gradient(135deg, #f43f5e, #fb7185)" },
  { to: "/dashboard/blog", icon: BookOpen, label: "بلاگ", gradient: "linear-gradient(135deg, #7c3aed, #c084fc)" },
  { to: "/dashboard/notifications", icon: Bell, label: "اعلانات", gradient: "linear-gradient(135deg, #eab308, #facc15)" },
  { to: "/dashboard/roles", icon: Shield, label: "نقش‌ها", gradient: "linear-gradient(135deg, #1e293b, #64748b)" },
  { to: "/dashboard/settings", icon: Settings, label: "تنظیمات", gradient: "linear-gradient(135deg, #334155, #94a3b8)" },
];

export function SubNav() {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const absScroll = Math.abs(el.scrollLeft);
    setShowRightArrow(absScroll > 5);
    setShowLeftArrow(absScroll < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      const isRTL = window.getComputedStyle(el).direction === "rtl";
      const scrollAmount = e.deltaY;
      el.scrollBy({ left: isRTL ? -scrollAmount : scrollAmount });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const isRTL = window.getComputedStyle(el).direction === "rtl";
    const amount = direction === "left" ? -200 : 200;
    el.scrollBy({ left: isRTL ? amount : (direction === "left" ? -200 : 200), behavior: "smooth" });
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="relative border-b bg-card/50 backdrop-blur-sm" style={{ background: "var(--subnav-bg, var(--background))" }}>
      {/* فلش راست */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent flex items-center justify-center hover:text-primary transition-colors"
        >
          <span className="text-muted-foreground font-bold text-lg">›</span>
        </button>
      )}

      {/* فلش چپ */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent flex items-center justify-center hover:text-primary transition-colors"
        >
          <span className="text-muted-foreground font-bold text-lg">‹</span>
        </button>
      )}

      {/* لیست آیتم‌ها */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SUB_NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all duration-200 shrink-0 group ${
                active
                  ? "text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={active ? { background: item.gradient } : undefined}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                  active ? "bg-white/20 text-white" : "text-white"
                }`}
                style={!active ? { background: item.gradient } : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
