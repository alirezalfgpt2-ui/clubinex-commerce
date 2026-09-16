import { Link, useSearchParams } from "react-router";
import { CheckCircle, XCircle, ArrowRight, ShoppingCart, Printer } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status"); // "success" or "failure"
  const orderId = searchParams.get("orderId");

  const verifyPayment = useMutation(api.orders.verifyPayment);
  const orderNumber = searchParams.get("orderNumber") || "";
  const authority = searchParams.get("Authority") || "";
  const refId = searchParams.get("RefId") || "";
  const processedRef = useRef(false);

  const isSuccess = status === "success";

  useEffect(() => {
    if (processedRef.current) return;
    if (orderNumber && (isSuccess || status === "failure")) {
      processedRef.current = true;
      verifyPayment({
        orderNumber,
        transactionId: refId || authority || "unknown",
        success: isSuccess,
      }).catch((err) => console.error("Payment verification failed:", err));
    }
  }, [orderNumber, status, isSuccess, authority, refId, verifyPayment]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="clay-card w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${
            isSuccess ? "bg-emerald-100" : "bg-rose-100"
          }`}>
            {isSuccess ? (
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            ) : (
              <XCircle className="h-10 w-10 text-rose-600" />
            )}
          </div>
        </div>

        <div>
          <h1 className={`text-2xl font-bold ${isSuccess ? "text-emerald-700" : "text-rose-700"}`}>
            {isSuccess ? "پرداخت موفق" : "پرداخت ناموفق"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isSuccess
              ? "پرداخت شما با موفقیت انجام شد و سفارش شما ثبت گردید."
              : "متأسفانه پرداخت شما انجام نشد. لطفاً دوباره تلاش کنید."}
          </p>
        </div>

        {isSuccess && (orderNumber || orderId) && (
          <div className="clay-surface p-4 text-sm space-y-3">
            <p className="text-muted-foreground">شماره سفارش شما:</p>
            <p className="font-bold text-lg font-mono" dir="ltr">{orderNumber || orderId}</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-3">
              <p className="text-xs text-emerald-700 font-semibold">✅ رسید دیجیتال پرداخت</p>
              <p className="text-[11px] text-emerald-600 mt-1">پرداخت شما با موفقیت ثبت شد. این رسید به عنوان مدرک پرداخت شما ذخیره شده است.</p>
              {refId && <p className="text-[10px] text-emerald-500 mt-1">کد پیگیری: {refId}</p>}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isSuccess ? (
            <>
              <Link to={`/dashboard/orders/${orderId}/invoice`} className="clay-button px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                <Printer className="h-4 w-4" /> چاپ فاکتور
              </Link>
              <Link to="/dashboard/orders" className="clay-button px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                مشاهده سفارشات <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/products" className="clay-button px-4 py-3 text-sm bg-muted text-foreground flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" /> ادامه خرید
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard/checkout" className="clay-button px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                تلاش مجدد برای پرداخت
              </Link>
              <Link to="/products" className="clay-button px-4 py-3 text-sm bg-muted text-foreground flex items-center justify-center gap-2">
                بازگشت به فروشگاه
              </Link>
            </>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Clubinex Commerce — خریدی مطمئن و لذت‌بخش
        </p>
      </div>
    </div>
  );
}
