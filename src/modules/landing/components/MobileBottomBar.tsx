import { Link, useLocation } from "react-router";
import { Home, Grid3X3, ShoppingCart, User, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/**
 * نوار پایین موبایل — حالت اپلیکیشنی
 * فقط در موبایل نمایش داده می‌شود
 */
export function MobileBottomBar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const items = [
    { to: "/", icon: Home, label: "خانه" },
    { to: "/products", icon: Grid3X3, label: "دسته‌بندی" },
    { to: "/dashboard/cart", icon: ShoppingCart, label: "سبد خرید" },
    { to: isAuthenticated ? "/dashboard" : "/auth", icon: User, label: isAuthenticated ? "پنل" : "ورود" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px] ${
                active
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                active ? "bg-primary/10" : ""
              }`}>
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iPhone */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
