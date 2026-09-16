// هوک مدیریت state و logیک صفحه تسویه حساب
// Checkout state and logic hook

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export type CheckoutStep = "cart" | "info" | "shipping" | "payment" | "result";

export function useCheckout() {
  const cart = useQuery(api.cart.getCart);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const createOrder = useMutation(api.orders.create);
  const validateDiscount = useMutation(api.giftCards.validate);
  const shippingMethods = useQuery(api.shipping.listActive);
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState<CheckoutStep>("info");
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
  const [receiveSms, setReceiveSms] = useState(true);

  // محاسبات
  const subtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((sum: number, item: any) => {
      const price = item.product?.salePrice ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const selectedShipping = shippingMethods?.find((s: any) => s._id === shippingMethod);
  const shippingCost = selectedShipping?.cost || 0;
  const freeShippingThreshold = selectedShipping?.freeShippingMinAmount || 500000;
  const actualShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const tax = Math.round(subtotal * 0.09);
  const total = subtotal + tax + actualShipping - discountAmount;

  // اعمال کد تخفیف
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const res = await validateDiscount({ code: discountCode, orderAmount: subtotal });
      setDiscountAmount(res.discountAmount);
      setDiscountError("");
      toast.success(`کد تخفیف «${res.code}» اعمال شد!`);
    } catch (err: any) {
      setDiscountAmount(0);
      setDiscountError(err.message || "خطا در اعتبارسنجی کد");
    }
  };

  // ثبت سفارش
  const handleOrderSubmit = async () => {
    if (!address.trim()) { toast.error("آدرس ارسال الزامی است."); return; }
    if (!agreedToTerms) { toast.error("لطفاً قوانین و مقررات را بپذیرید."); return; }
    if (!cart || cart.length === 0) { toast.error("سبد خرید خالی است."); return; }

    setIsProcessing(true);
    try {
      const orderItems = cart.filter((item: any) => item.product).map((item: any) => ({
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
        total,
        paymentMethod,
        shippingMethod,
        address,
        postalCode,
        notes: notes || undefined,
        receiveSms,
      });

      setOrderResult({ orderId: orderId as string, orderNumber: `ORD-${Date.now()}` });
      setStep("result");
      toast.success(paymentMethod === "cod" ? "سفارش شما با موفقیت ثبت شد." : "سفارش ثبت شد. در حال انتقال به درگاه پرداخت...");
    } catch (error: any) {
      toast.error(error.message || "خطا در ثبت سفارش.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // Data
    cart, user, shippingMethods,
    // State
    step, setStep, address, setAddress, postalCode, setPostalCode,
    paymentMethod, setPaymentMethod, shippingMethod, setShippingMethod,
    notes, setNotes, orderResult, isProcessing,
    discountCode, setDiscountCode, discountAmount, discountError, agreedToTerms, setAgreedToTerms,
    receiveSms, setReceiveSms,
    // Calculations
    subtotal, actualShipping, freeShippingThreshold, tax, total,
    // Actions
    handleApplyDiscount, handleOrderSubmit,
    updateQuantity, removeItem, navigate,
  };
}
