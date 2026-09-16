import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "react-router";
import { formatJalaliDate } from "@/lib/jalali";
import { useEffect } from "react";
import { useAppName } from "@/hooks/use-app-name";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

export default function InvoicePrintPage() {
  const { orderId } = useParams();
  const order = useQuery(api.orders.getById, orderId ? { orderId: orderId as any } : "skip");

  const appName = useAppName();

  useEffect(() => {
    // Auto-trigger print dialog when page loads
    if (order) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">در حال بارگذاری فاکتور...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white" dir="rtl">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .invoice-container { margin: 0 auto; box-shadow: none; }
        }
      `}</style>

      {/* Print Button - hidden when printing */}
      <div className="no-print fixed top-4 left-4 z-50">
        <button onClick={() => window.print()} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:bg-primary/90 transition-colors">
          🖨️ چاپ فاکتور
        </button>
      </div>

      <div className="invoice-container max-w-2xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">فاکتور فروش</h1>
            <p className="text-sm text-gray-500 mt-1">{appName}</p>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-700">{order.orderNumber}</p>
            <p className="text-xs text-gray-500 mt-1">تاریخ صدور: {formatJalaliDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase">اطلاعات خریدار</h3>
            <p className="text-sm font-medium text-gray-700">{order.address}</p>
            {order.postalCode && <p className="text-xs text-gray-500 mt-1">کد پستی: {order.postalCode}</p>}
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase">اطلاعات سفارش</h3>
            <p className="text-sm text-gray-700">شماره سفارش: <span className="font-mono font-bold">{order.orderNumber}</span></p>
            <p className="text-sm text-gray-700">تاریخ: {formatJalaliDate(order.createdAt)}</p>
            <p className="text-sm text-gray-700">روش پرداخت: {order.paymentMethod}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500">
              <th className="py-2 text-right">#</th>
              <th className="py-2 text-right">شرح کالا</th>
              <th className="py-2 text-center">تعداد</th>
              <th className="py-2 text-center">قیمت واحد</th>
              <th className="py-2 text-left">جمع</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item: any, i: number) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-600">{i + 1}</td>
                <td className="py-3 text-sm font-medium text-gray-800">{item.name}</td>
                <td className="py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 text-sm text-center text-gray-600">{item.price?.toLocaleString("fa-IR")}</td>
                <td className="py-3 text-sm text-left font-bold text-gray-800">{(item.total || item.price * item.quantity)?.toLocaleString("fa-IR")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">جمع کل:</span>
              <span className="text-gray-700">{order.subtotal?.toLocaleString("fa-IR")} ریال</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">مالیات (۹٪):</span>
              <span className="text-gray-700">{order.tax?.toLocaleString("fa-IR")} ریال</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">هزینه ارسال:</span>
              <span className="text-gray-700">{order.shippingCost ? `${order.shippingCost.toLocaleString("fa-IR")} ریال` : "رایگان"}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>تخفیف:</span>
                <span>-{order.discount.toLocaleString("fa-IR")} ریال</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold border-t-2 border-gray-200 pt-2 mt-2">
              <span>مبلغ قابل پرداخت:</span>
              <span className="text-primary">{order.total.toLocaleString("fa-IR")} ریال</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-400 mb-1">یادداشت:</p>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>این فاکتور توسط {appName} صادر شده است.</p>
          <p className="mt-1">تاریخ صدور: {formatJalaliDate(order.createdAt)} | شماره فاکتور: {order.orderNumber}</p>
        </div>

        {/* دکمه‌های عملیات (فقط در حالت عادی نمایش داده می‌شوند) */}
        <div className="mt-6 flex justify-center gap-3 print:hidden no-print">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            <Printer className="h-4 w-4" /> چاپ فاکتور
          </button>
          <button onClick={() => { window.print(); toast.success("برای دانلود PDF از چاپگر گزینه ذخیره به عنوان PDF را انتخاب کنید."); }} className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            <Download className="h-4 w-4" /> دانلود PDF
          </button>
        </div>
      </div>
    </div>
  );
}
