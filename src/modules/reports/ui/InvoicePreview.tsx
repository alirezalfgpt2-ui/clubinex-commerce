import { formatJalaliDate } from "@/lib/jalali";

/** پیش‌نمایش پیش‌فاکتور — قابل چاپ */
interface InvoicePreviewProps {
  order: any;
}

export function InvoicePreview({ order }: InvoicePreviewProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-sm" dir="rtl">
      {/* هدر */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold">پیش‌فاکتور فروش</h2>
          <p className="text-muted-foreground text-xs">شماره: {order.orderNumber}</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">تاریخ صدور</p>
          <p className="text-sm font-medium">{formatJalaliDate(order.createdAt)}</p>
        </div>
      </div>

      {/* جدول اقلام */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="py-2 text-right">#</th>
            <th className="py-2 text-right">محصول</th>
            <th className="py-2 text-center">تعداد</th>
            <th className="py-2 text-center">قیمت واحد</th>
            <th className="py-2 text-left">جمع</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item: any, i: number) => (
            <tr key={i} className="border-b">
              <td className="py-2">{i + 1}</td>
              <td className="py-2 font-medium">{item.name}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-center">{item.price?.toLocaleString("fa-IR")}</td>
              <td className="py-2 text-left font-bold">
                {(item.total || item.price * item.quantity)?.toLocaleString("fa-IR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* جمع‌بندی */}
      <div className="flex justify-between">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>آدرس ارسال: {order.address}</p>
          {order.postalCode && <p>کد پستی: {order.postalCode}</p>}
          {order.notes && <p>یادداشت: {order.notes}</p>}
        </div>
        <div className="text-left space-y-1">
          <div className="flex justify-between gap-8 text-xs">
            <span>جمع کل:</span>
            <span>{order.subtotal?.toLocaleString("fa-IR")} ریال</span>
          </div>
          <div className="flex justify-between gap-8 text-xs">
            <span>هزینه ارسال:</span>
            <span>{order.shippingCost?.toLocaleString("fa-IR") || "رایگان"}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between gap-8 text-xs text-rose-600">
              <span>تخفیف:</span>
              <span>-{order.discount.toLocaleString("fa-IR")} ریال</span>
            </div>
          )}
          <div className="flex justify-between gap-8 text-sm font-bold border-t pt-1 mt-1">
            <span>مبلغ قابل پرداخت:</span>
            <span>{order.total.toLocaleString("fa-IR")} ریال</span>
          </div>
        </div>
      </div>
    </div>
  );
}
