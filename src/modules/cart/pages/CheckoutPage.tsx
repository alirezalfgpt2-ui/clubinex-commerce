import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Check, CreditCard, Plus, Minus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";



type Step = "cart" | "info" | "shipping" | "payment" | "result";

export default function CheckoutPage() {
  const cart = useQuery(api.cart.getCart);
  const cartTotal = useQuery(api.cart.getCartTotal);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const createOrder = useMutation(api.orders.create);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("info");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [shippingMethod, setShippingMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [orderResult, setOrderResult] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [receiveSms, setReceiveSms] = useState(true);
  const validateDiscount = useMutation(api.giftCards.validate);

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">تسویه حساب</h1>
        <div className="clay-card p-12 text-center">
          <p className="text-muted-foreground mb-4">برای ادامه خرید لطفاً وارد حساب شوید.</p>
          <Link to={`/auth?returnTo=${encodeURIComponent("/dashboard/checkout")}`} className="clay-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold">
            <ArrowRight className="h-4 w-4" /> ورود به حساب
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">تسویه حساب</h1>
        <div className="clay-card p-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">سبد خرید شما خالی است.</p>
          <Link to="/products" className="clay-button inline-flex items-center gap-2 px-6 py-3 text-sm">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.salePrice ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingMethods = useQuery(api.shipping.listActive);
  const shippingCost = shippingMethods?.find((s: any) => s._id === shippingMethod)?.cost || 0;
  const freeShippingMin = shippingMethods?.find((s: any) => s._id === shippingMethod)?.freeShippingMinAmount || 500000;
  const freeShippingThreshold = freeShippingMin;
  const actualShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const tax = Math.round(subtotal * 0.09);
  const total = subtotal + tax + actualShipping - discountAmount;

  const handleOrderSubmit = async () => {
    if (!address.trim()) { toast.error("آدرس ارسال الزامی است."); return; }
    if (!agreedToTerms) { toast.error("لطفاً قوانین و مقررات را بپذیرید."); return; }
    if (!cart || cart.length === 0) { toast.error("سبد خرید خالی است."); return; }

    setIsProcessing(true);
    try {
      const orderItems = cart.filter((item) => item.product).map((item) => ({
        productId: item.productId,
        name: item.product!.name,
        quantity: item.quantity,
        price: item.product!.salePrice ?? item.product!.price,
        total: (item.product!.salePrice ?? item.product!.price) * item.quantity,
      }));

      const orderId = await createOrder({
        items: orderItems,
        subtotal,
        tax,
        shippingCost: actualShipping,
        discount: discountAmount,
        total: total,
        paymentMethod,
        shippingMethod,
        address,
        postalCode,
        notes: notes || undefined,
      });

      setOrderResult({ orderId: orderId as string, orderNumber: (orderId as string).replace(/.*\//, '').slice(0, 12) || `ORD${Date.now()}` });
      setStep("result");
      if (paymentMethod === "cod") {
        toast.success("سفارش شما با موفقیت ثبت شد.");
      } else {
        toast.success("سفارش ثبت شد. در حال انتقال به درگاه پرداخت...");
        // TODO: Redirect to payment gateway using payment.initiateZarinPal or other provider
        // const callbackUrl = `${window.location.origin}/payment/return?orderNumber=${orderResult.orderNumber}`;
      }
    } catch (error: any) {
      toast.error(error.message || "خطا در ثبت سفارش.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-primary">داشبورد</Link><span>/</span>
        <Link to="/dashboard/cart" className="hover:text-primary">سبد خرید</Link><span>/</span>
        <span className="text-foreground font-medium">تسویه حساب</span>
      </div>

      {/* مراحل خرید 5 مرحله‌ای */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs">
        {(
          [
            { id: "cart", label: "۱. سبد خرید", num: 1 },
            { id: "info", label: "۲. اطلاعات", num: 2 },
            { id: "shipping", label: "۳. ارسال", num: 3 },
            { id: "payment", label: "۴. پرداخت", num: 4 },
            { id: "result", label: "۵. نتیجه", num: 5 },
          ] as const
        ).map((s, i) => {
          const stepOrder = ["cart", "info", "shipping", "payment", "result"];
          const currentIdx = stepOrder.indexOf(step);
          const isDone = currentIdx > i;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-1 sm:gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary/20" :
                  isDone ? "bg-emerald-500 text-white" :
                  "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : s.num}
              </div>
              <span className={`hidden sm:inline ${isCurrent ? "font-semibold text-foreground" : isDone ? "text-emerald-600" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < 4 && <div className={`w-4 sm:w-8 h-px ${isDone ? "bg-emerald-400" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <h1 className="text-2xl font-bold tracking-tight">تسویه حساب</h1>

      {/* مرحله ۱: سبد خرید */}
      {step === "cart" && (
        <div className="space-y-4">
          <div className="clay-card p-6">
            <h3 className="font-semibold text-sm mb-4">اقلام سبد خرید</h3>
            <div className="space-y-3">
              {cart.map((item) => {
                if (!item.product) return null;
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="h-14 w-14 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product.name}</p>
                      <p className="text-[11px] text-muted-foreground">{price.toLocaleString("fa-IR")} تومان</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity + 1 })} className="clay-icon flex h-6 w-6 items-center justify-center bg-muted"><Plus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity - 1 })} className="clay-icon flex h-6 w-6 items-center justify-center bg-muted"><Minus className="h-3 w-3" /></button>
                    </div>
                    <span className="text-xs font-bold shrink-0">{(price * item.quantity).toLocaleString("fa-IR")} ت</span>
                    <button onClick={() => { removeItem({ cartItemId: item._id }); toast.success("حذف شد"); }} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep("info")} className="clay-button px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
              ادامه <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* مرحله ۲: اطلاعات */}
      {step === "info" && (
        <div className="space-y-4">
          <div className="clay-card p-6 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">۲</span>
              آدرس ارسال
            </h3>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="آدرس کامل پستی..."
              className="clay-input w-full p-3 text-sm outline-none min-h-[80px]"
              rows={3}
            />
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="کد پستی ۱۰ رقمی"
              className="clay-input w-full p-3 text-sm outline-none max-w-xs"
              dir="ltr"
            />
          </div>

          <div className="clay-card p-6">
            <label className="text-xs text-muted-foreground mb-1.5 block">یادداشت سفارش (اختیاری)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات اضافی..."
              className="clay-input w-full p-3 text-sm outline-none min-h-[60px]"
              rows={2}
            />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep("cart")} className="clay-button px-5 py-2.5 text-sm bg-muted text-foreground">
              بازگشت
            </button>
            <button onClick={() => { if (!address.trim()) { toast.error("آدرس الزامی است"); return; } setStep("shipping"); }} className="clay-button px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
              ادامه <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* مرحله ۳: روش ارسال */}
      {step === "shipping" && (
        <div className="space-y-4">
          <div className="clay-card p-6 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">۳</span>
              انتخاب روش ارسال
              {subtotal >= freeShippingThreshold && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">ارسال رایگان!</span>
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(!shippingMethods || shippingMethods.length === 0) ? (
                <p className="text-xs text-muted-foreground col-span-3">روش ارسالی تعریف نشده است.</p>
              ) : shippingMethods.map((opt: any) => (
                <button
                  key={opt._id}
                  onClick={() => setShippingMethod(opt._id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    shippingMethod === opt._id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.nameFa || opt.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {subtotal >= (opt.freeShippingMinAmount || freeShippingThreshold) ? (
                      <span className="text-emerald-600 font-semibold">رایگان</span>
                    ) : (
                      `${opt.cost.toLocaleString("fa-IR")} تومان`
                    )}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="clay-card p-6 space-y-3">
            <h3 className="font-semibold text-sm">تنظیمات اعلان</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={receiveSms} onChange={(e) => setReceiveSms(e.target.checked)} className="accent-primary" />
              <span className="text-xs text-muted-foreground">ارسال پیامک اطلاع‌رسانی وضعیت سفارش</span>
            </label>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep("info")} className="clay-button px-5 py-2.5 text-sm bg-muted text-foreground">
              بازگشت
            </button>
            <button onClick={() => { if (!shippingMethod) { toast.error("لطفاً روش ارسال را انتخاب کنید."); return; } setStep("payment"); }} className="clay-button px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
              ادامه <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* مرحله ۴: پرداخت + پیش‌فاکتور */}
      {step === "payment" && (
        <div className="space-y-4">
          <div className="clay-card p-6 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">۴</span>
              روش پرداخت
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setPaymentMethod("online")} className={`p-4 rounded-xl border-2 text-center transition-all flex items-center gap-3 ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="text-right">
                  <p className="text-sm font-medium">پرداخت آنلاین</p>
                  <p className="text-[11px] text-muted-foreground">از طریق درگاه بانکی</p>
                </div>
              </button>
              <button onClick={() => setPaymentMethod("cod")} className={`p-4 rounded-xl border-2 text-center transition-all flex items-center gap-3 ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                <span className="text-xl">💰</span>
                <div className="text-right">
                  <p className="text-sm font-medium">پرداخت در محل</p>
                  <p className="text-[11px] text-muted-foreground">هنگام تحویل کالا</p>
                </div>
              </button>
            </div>
          </div>

          {/* پیش‌فاکتور شفاف */}
          <div className="clay-card p-6 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">📄 پیش‌فاکتور</h3>
            <div className="text-xs space-y-2">
              {cart.map((item) => {
                if (!item.product) return null;
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <div key={item._id} className="flex justify-between py-1.5 border-b border-dashed border-border/50">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span className="font-bold">{(price * item.quantity).toLocaleString("fa-IR")} تومان</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">جمع کل</span><span>{subtotal.toLocaleString("fa-IR")} تومان</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">مالیات (۹٪)</span><span>{tax.toLocaleString("fa-IR")} تومان</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">هزینه ارسال</span><span>{subtotal >= freeShippingThreshold ? "رایگان" : `${actualShipping.toLocaleString("fa-IR")} تومان`}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>تخفیف ({discountCode})</span><span className="font-bold">-{discountAmount.toLocaleString("fa-IR")} تومان</span></div>
              )}
              <div className="flex justify-between font-bold border-t pt-2 text-sm"><span>مبلغ نهایی</span><span className="text-primary">{total.toLocaleString("fa-IR")} تومان</span></div>
            </div>
          </div>

          {/* کد تخفیف */}
          <div className="clay-card p-6">
            <h3 className="font-semibold text-sm mb-3">کد تخفیف</h3>
            <div className="flex gap-2">
              <input value={discountCode} onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(""); }} placeholder="کد تخفیف را وارد کنید" className="clay-input flex-1 p-2.5 text-xs outline-none font-mono" />
              <button onClick={async () => {
                if (!discountCode.trim()) return;
                try {
                  const res = await validateDiscount({ code: discountCode, orderAmount: subtotal });
                  setDiscountAmount(res.discountAmount);
                  setDiscountApplied(true);
                  toast.success(`کد تخفیف «${res.code}» اعمال شد!`);
                } catch (err: any) {
                  setDiscountAmount(0);
                  setDiscountApplied(false);
                  setDiscountError(err.message || "خطا");
                }
              }} className="clay-button px-3 py-2 text-xs bg-muted text-foreground">اعمال</button>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg mt-2">
                <span>✓ اعمال شد</span><span className="font-bold">-{discountAmount.toLocaleString("fa-IR")} تومان</span>
              </div>
            )}
            {discountError && <p className="text-[11px] text-red-500 mt-1">{discountError}</p>}
          </div>

          {/* چک‌باکس اجباری قوانین */}
          <label className="flex items-start gap-2 cursor-pointer clay-card p-4">
            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="accent-primary mt-0.5" />
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              قوانین و مقررات فروشگاه و <Link to="/legal/return" className="text-primary underline">شرایط مرجوعی کالا</Link> را مطالعه کرده و می‌پذیرم. <span className="text-red-500">*</span>
            </span>
          </label>

          <div className="flex justify-between">
            <button onClick={() => setStep("shipping")} className="clay-button px-5 py-2.5 text-sm bg-muted text-foreground">
              بازگشت
            </button>
            <button onClick={handleOrderSubmit} disabled={isProcessing || !agreedToTerms} className="clay-button px-6 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessing ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (<><CreditCard className="h-4 w-4" />{paymentMethod === "cod" ? "ثبت سفارش" : "پرداخت و ثبت سفارش"}</>)}
            </button>
          </div>
        </div>
      )}

      {/* مرحله ۵: نتیجه */}
      {step === "result" && orderResult ? (
        <div className="clay-card p-12 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">سفارش شما ثبت شد!</h2>
          <p className="text-sm text-muted-foreground">
            شماره سفارش: <span className="font-mono font-bold">{orderResult.orderNumber}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            مبلغ: <span className="font-bold text-primary">{total.toLocaleString("fa-IR")} تومان</span>
          </p>
          {paymentMethod === "online" ? (
            <p className="text-xs text-muted-foreground">در حال انتقال به درگاه پرداخت...</p>
          ) : (
            <p className="text-xs text-muted-foreground">پرداخت در محل تحویل انجام می‌شود.</p>
          )}
          <div className="flex gap-3 justify-center pt-4 flex-wrap">
            <Link to={`/dashboard/orders/${orderResult.orderId}/invoice`} className="clay-button px-4 py-2 text-xs flex items-center gap-1">🖨️ چاپ پیش‌فاکتور</Link>
            <Link to="/dashboard/orders" className="clay-button px-6 py-2 text-sm">مشاهده سفارشات</Link>
            <Link to="/products" className="clay-button px-6 py-2 text-sm bg-muted text-foreground">ادامه خرید</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
