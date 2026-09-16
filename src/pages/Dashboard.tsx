import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  Package, ShoppingCart, Users, DollarSign, Eye, BarChart3,
  Plus, ClipboardList, Tags, Truck, Calendar, MessageSquare, LifeBuoy,
  FileText, Shield, Star,
} from "lucide-react";
import { Link } from "react-router";
import { ORDER_STATUSES } from "@/config/constants";
import { useEffect } from "react";
import { formatJalaliDate } from "@/lib/jalali";

function GradientStatCard({ icon: Icon, title, value, gradient, delay }: {
  icon: any; title: string; value: string | number; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow"
      style={{ background: gradient }}
    >
      <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

function RecentOrders() {
  const orders = useQuery(api.orders.list);
  const recent = orders?.slice(0, 5) ?? [];

  return (
    <div className="clay-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">آخرین سفارشات</h3>
        <Link to="/dashboard/orders" className="text-xs text-primary hover:underline">
          مشاهده همه ←
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">هنوز سفارشی ثبت نشده است.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((order) => (
            <div key={order._id} className="clay-surface p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-medium">{order.orderNumber}</p>
                <p className="text-[11px] text-muted-foreground">{formatJalaliDate(order.createdAt)}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">{order.total.toLocaleString("fa-IR")} ت</p>
                <span className={`text-[11px] font-medium ${
                  order.status === "delivered" ? "text-emerald-600" :
                  order.status === "cancelled" ? "text-rose-600" :
                  "text-amber-600"
                }`}>
                  {ORDER_STATUSES.find((s) => s.value === order.status)?.label || order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TopProducts() {
  const products = useQuery(api.products.listActive);
  const topProducts = products
    ?.sort((a, b) => b.views - a.views)
    .slice(0, 5) ?? [];

  return (
    <div className="clay-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">پربازدیدترین محصولات</h3>
        <Link to="/dashboard/products" className="text-xs text-primary hover:underline">
          مشاهده همه ←
        </Link>
      </div>
      {topProducts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">هنوز محصولی اضافه نشده است.</p>
      ) : (
        <div className="space-y-2">
          {topProducts.map((product) => (
            <div key={product._id} className="clay-surface p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <div className="clay-icon h-10 w-10 flex items-center justify-center bg-primary/10 text-primary text-sm rounded-xl">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-[11px] text-muted-foreground">{product.price.toLocaleString("fa-IR")} تومان</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                <Eye className="h-3 w-3" /> {product.views}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ShortcutItem {
  label: string;
  path: string;
  icon: any;
  gradient: string;
}

const shortcuts: ShortcutItem[] = [
  { label: "افزودن محصول", path: "/dashboard/products/new", icon: Plus, gradient: "linear-gradient(135deg, #6366f1, #818cf8)" },
  { label: "مشاهده سفارشات", path: "/dashboard/orders", icon: ClipboardList, gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
  { label: "مدیریت کاربران", path: "/dashboard/users", icon: Users, gradient: "linear-gradient(135deg, #10b981, #34d399)" },
  { label: "کدهای تخفیف", path: "/dashboard/discounts", icon: Tags, gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
  { label: "ارسال کالا", path: "/dashboard/shipping", icon: Truck, gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
  { label: "نوبت‌دهی", path: "/dashboard/bookings", icon: Calendar, gradient: "linear-gradient(135deg, #14b8a6, #5eead4)" },
  { label: "پشتیبانی", path: "/dashboard/tickets", icon: LifeBuoy, gradient: "linear-gradient(135deg, #f43f5e, #fb7185)" },
  { label: "چت و پیام", path: "/dashboard/chat", icon: MessageSquare, gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)" },
  { label: "گزارش‌ها", path: "/dashboard/reports", icon: BarChart3, gradient: "linear-gradient(135deg, #84cc16, #a3e635)" },
  { label: "نقش‌ها و دسترسی", path: "/dashboard/roles", icon: Shield, gradient: "linear-gradient(135deg, #64748b, #94a3b8)" },
  { label: "ویژگی محصولات", path: "/dashboard/features", icon: Star, gradient: "linear-gradient(135deg, #d97706, #fbbf24)" },
  { label: "قالب ایمیل", path: "/dashboard/templates", icon: FileText, gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
];

function QuickActions() {
  return (
    <div className="clay-card p-5">
      <h3 className="font-semibold text-sm mb-4">دسترسی سریع</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {shortcuts.map((action, i) => (
          <motion.div
            key={action.path}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.03, type: "spring", stiffness: 200 }}
          >
            <Link
              to={action.path}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:scale-105 transition-all duration-200 group"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md group-hover:shadow-lg transition-shadow"
                style={{ background: action.gradient }}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {action.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const productStats = useQuery(api.products.getStats);
  const orderStats = useQuery(api.orders.getStats);
  const userCount = useQuery(api.users.getUserCount);
  const runAutoChecks = useMutation(api.autoNotifications.runAllChecks);

  // Run auto-notification checks on dashboard load
  useEffect(() => {
    runAutoChecks().catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">داشبورد مدیریت</h1>
        <p className="text-sm text-muted-foreground mt-0.5">نمای کلی عملکرد فروشگاه Clubinex</p>
      </div>

      {/* Gradient Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard
          icon={Package}
          title="محصولات"
          value={productStats?.total ?? 0}
          gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
          delay={0}
        />
        <GradientStatCard
          icon={ShoppingCart}
          title="سفارشات"
          value={orderStats?.totalOrders ?? 0}
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          delay={0.1}
        />
        <GradientStatCard
          icon={Users}
          title="کاربران"
          value={userCount ?? 0}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          delay={0.2}
        />
        <GradientStatCard
          icon={DollarSign}
          title="درآمد کل"
          value={`${(orderStats?.totalRevenue ?? 0).toLocaleString("fa-IR")} ت`}
          gradient="linear-gradient(135deg, #ec4899, #db2777)"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
}
