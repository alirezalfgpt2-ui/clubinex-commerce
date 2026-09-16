import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { ChevronLeft, Package } from "lucide-react";
import { formatJalaliDate } from "@/lib/jalali";

/** وضعیت سفارش‌ها */
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "در انتظار", color: "bg-amber-100 text-amber-700" },
  paid: { label: "پرداخت شده", color: "bg-sky-100 text-sky-700" },
  processing: { label: "در حال پردازش", color: "bg-violet-100 text-violet-700" },
  shipped: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "تحویل شده", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "لغو شده", color: "bg-rose-100 text-rose-700" },
};

/** بخش سابقه خرید */
export function OrderHistorySection() {
  const orders = useQuery(api.orders.listByUser);
  if (!orders || orders.length === 0) return null;

  return (
    <div className="clay-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm">📦 سابقه خرید ({orders.length} سفارش)</h2>
        <Link to="/dashboard/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
          مشاهده همه <ChevronLeft className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {orders.slice(0, 5).map((order: any) => (
          <div key={order._id} className="clay-surface p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium font-mono">{order.orderNumber}</p>
                <p className="text-[10px] text-muted-foreground">{formatJalaliDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">{order.total.toLocaleString("fa-IR")} تومان</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_MAP[order.status]?.color || "bg-gray-100 text-gray-500"}`}>
                {STATUS_MAP[order.status]?.label || order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
