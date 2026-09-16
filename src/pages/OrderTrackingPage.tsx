import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SEO } from "@/components/SEO";
import { Search, ArrowRight, Package, CheckCircle, Clock, Truck, XCircle, MapPin } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "در انتظار پرداخت", color: "text-amber-500 bg-amber-50", icon: <Clock className="h-5 w-5" /> },
  paid: { label: "پرداخت شده", color: "text-blue-500 bg-blue-50", icon: <CheckCircle className="h-5 w-5" /> },
  processing: { label: "در حال پردازش", color: "text-indigo-500 bg-indigo-50", icon: <Package className="h-5 w-5" /> },
  shipped: { label: "ارسال شده", color: "text-purple-500 bg-purple-50", icon: <Truck className="h-5 w-5" /> },
  delivered: { label: "تحویل شده", color: "text-green-500 bg-green-50", icon: <CheckCircle className="h-5 w-5" /> },
  cancelled: { label: "لغو شده", color: "text-red-500 bg-red-50", icon: <XCircle className="h-5 w-5" /> },
};

const STATUS_STEPS = ["pending", "paid", "processing", "shipped", "delivered"];

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searched, setSearched] = useState(false);
  const order = useQuery(
    api.orders.getByOrderNumber,
    searched && orderNumber.trim() ? { orderNumber: orderNumber.trim() } : "skip"
  );

  const handleSearch = () => {
    if (!orderNumber.trim()) return;
    setSearched(true);
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <>
      <SEO title="پیگیری سفارش | فروشگاه" description="پیگیری وضعیت سفارش با شماره سفارش" />
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-lg font-bold">Clubinex Commerce</Link>
            <Link to="/" className="text-sm text-gray-400 hover:text-primary flex items-center gap-1">
              <ArrowRight className="h-4 w-4" /> بازگشت به خانه
            </Link>
          </div>
        </header>

        <main className="py-12 mx-auto max-w-2xl px-4">
          <div className="text-center mb-10">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-3xl font-bold mb-2">پیگیری سفارش</h1>
            <p className="text-gray-500">شماره سفارش خود را وارد کنید تا وضعیت آن را ببینید.</p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
            <div className="flex gap-3">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="شماره سفارش (مثال: ORD2608230001)"
                className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm outline-none focus:border-primary transition-colors font-mono"
                dir="ltr"
              />
              <button
                onClick={handleSearch}
                className="h-12 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4" /> جستجو
              </button>
            </div>
          </div>

          {/* Result */}
          {searched && order === undefined && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">در حال جستجو...</p>
            </div>
          )}

          {searched && order === null && (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
              <XCircle className="h-12 w-12 mx-auto text-red-300 mb-3" />
              <p className="text-red-500 font-semibold mb-1">سفارشی یافت نشد</p>
              <p className="text-sm text-gray-400">شماره سفارش وارد شده صحیح نیست. لطفاً دوباره بررسی کنید.</p>
            </div>
          )}

          {order && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">سفارش {order.orderNumber}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[order.status]?.color}`}>
                    {STATUS_MAP[order.status]?.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">تاریخ ثبت:</span> <span className="font-medium">{new Date(order.createdAt).toLocaleDateString("fa-IR")}</span></div>
                  <div><span className="text-gray-400">مبلغ کل:</span> <span className="font-bold text-primary">{order.total.toLocaleString("fa-IR")} تومان</span></div>
                  <div><span className="text-gray-400">روش ارسال:</span> <span className="font-medium">{order.shippingMethod}</span></div>
                  <div><span className="text-gray-400">روش پرداخت:</span> <span className="font-medium">{order.paymentMethod}</span></div>
                </div>
                {order.trackingCode && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-400">کد رهگیری: </span>
                    <span className="font-mono font-bold text-sm">{order.trackingCode}</span>
                  </div>
                )}
              </div>

              {/* Progress Steps */}
              {order.status !== "cancelled" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-bold mb-6">مسیر سفارش</h3>
                  <div className="relative">
                    {STATUS_STEPS.map((step, i) => {
                      const isActive = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step} className="flex items-start gap-4 mb-6 last:mb-0">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                              {isActive ? "✓" : i + 1}
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`w-0.5 h-8 mt-1 ${isActive && i < currentStep ? "bg-primary" : "bg-gray-200"}`} />
                            )}
                          </div>
                          <div className="pt-1">
                            <p className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-gray-400"}`}>
                              {STATUS_MAP[step]?.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.updatedAt).toLocaleDateString("fa-IR")} {new Date(order.updatedAt).toLocaleTimeString("fa-IR")}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {order.status === "cancelled" && (
                <div className="bg-red-50 rounded-2xl border border-red-100 p-6 text-center">
                  <XCircle className="h-10 w-10 mx-auto text-red-400 mb-2" />
                  <p className="text-red-600 font-semibold">این سفارش لغو شده است.</p>
                </div>
              )}

              {/* Items */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold mb-4">اقلام سفارش</h3>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">تعداد: {item.quantity} × {item.price.toLocaleString("fa-IR")} تومان</p>
                      </div>
                      <p className="text-sm font-bold">{item.total.toLocaleString("fa-IR")} ت</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">جمع کل</span><span>{order.subtotal.toLocaleString("fa-IR")} تومان</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">مالیات</span><span>{order.tax.toLocaleString("fa-IR")} تومان</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">ارسال</span><span>{order.shippingCost.toLocaleString("fa-IR")} تومان</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-green-600"><span>تخفیف</span><span>-{order.discount.toLocaleString("fa-IR")} تومان</span></div>}
                  <div className="flex justify-between font-bold text-lg border-t pt-2"><span>مبلغ نهایی</span><span className="text-primary">{order.total.toLocaleString("fa-IR")} تومان</span></div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> آدرس تحویل</h3>
                <p className="text-sm text-gray-500">{order.address}</p>
                <p className="text-xs text-gray-400 mt-1">کد پستی: {order.postalCode}</p>
                {order.notes && <p className="text-xs text-gray-400 mt-2">یادداشت: {order.notes}</p>}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
