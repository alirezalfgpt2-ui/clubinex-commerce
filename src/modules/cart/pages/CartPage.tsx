import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function CartPage() {
  const cart = useQuery(api.cart.getCart);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);

  if (!cart) {
    return <div className="text-muted-foreground p-8 text-center">در حال بارگذاری...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">سبد خرید</h1>
        <div className="clay-card p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-semibold mb-2">سبد خرید شما خالی است</p>
          <p className="text-sm text-muted-foreground mb-6">محصولات مورد علاقه‌تان را به سبد اضافه کنید.</p>
          <Link to="/dashboard/products" className="clay-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold">
            مشاهده محصولات <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.salePrice ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">سبد خرید <span className="text-base font-normal text-muted-foreground">({cart.length} کالا)</span></h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => {
            if (!item.product) return null;
            const price = item.product.salePrice ?? item.product.price;
            return (
              <div key={item._id} className="clay-card p-4 flex items-center gap-4">
                <div className="clay-icon h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted/50">
                  {item.product.images[0] ? <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                  <p className="text-sm text-primary font-bold mt-1">{price.toLocaleString("fa-IR")} تومان</p>
                </div>
                <div className="clay-surface flex items-center gap-1 px-2 py-1">
                  <button onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity - 1 })} className="clay-icon flex h-7 w-7 items-center justify-center bg-muted"><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity + 1 })} className="clay-icon flex h-7 w-7 items-center justify-center bg-muted"><Plus className="h-3 w-3" /></button>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{(price * item.quantity).toLocaleString("fa-IR")} ت</p>
                  <button onClick={() => { removeItem({ cartItemId: item._id }); toast.success("حذف شد"); }} className="text-rose-500 hover:text-rose-700 mt-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="clay-card p-6 h-fit sticky top-24">
          <h3 className="font-semibold mb-4">خلاصه سفارش</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">جمع کل</span><span className="font-medium">{subtotal.toLocaleString("fa-IR")} تومان</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">مالیات (۹٪)</span><span className="font-medium">{Math.round(subtotal * 0.09).toLocaleString("fa-IR")} تومان</span></div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">مبلغ قابل پرداخت</span>
              <span className="font-bold text-primary text-lg">{(subtotal + Math.round(subtotal * 0.09)).toLocaleString("fa-IR")} تومان</span>
            </div>
          </div>
          <Link to="/dashboard/checkout" className="clay-button w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold mt-6">
            تکمیل خرید <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
