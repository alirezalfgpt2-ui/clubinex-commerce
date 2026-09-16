/**
 * 🔔 تنظیمات اعلانات — جامع و کامل
 * — فعال/غیرفعال کردن هر نوع اعلان به صورت جداگانه
 * — انتخاب روش ارسال (ایمیل، پیامک، درون‌برنامه‌ای)
 * — تنظیم آستانه‌ها و شرایط
 */
import { useSettings } from "../hooks/use-settings";
import { Toggle, SaveButton, SectionHeader, Field } from "../components/SettingsUI";
import { Bell, Mail, MessageSquare, AlertTriangle, ShoppingCart, Package, CreditCard, User, TrendingDown, Truck, RotateCcw } from "lucide-react";

/** هر نوع اعلان با فیلدهای تنظیماتش */
const NOTIFICATION_TYPES = [
  {
    id: "order_new",
    label: "سفارش جدید",
    desc: "اعلان هنگام ثبت سفارش جدید",
    icon: ShoppingCart,
    color: "text-blue-500 bg-blue-50",
  },
  {
    id: "order_status",
    label: "تغییر وضعیت سفارش",
    desc: "اعلان هنگام تغییر وضعیت (پرداخت، ارسال، تحویل)",
    icon: Truck,
    color: "text-indigo-500 bg-indigo-50",
  },
  {
    id: "payment_success",
    label: "پرداخت موفق",
    desc: "اعلان پرداخت موفق به مشتری و ادمین",
    icon: CreditCard,
    color: "text-emerald-500 bg-emerald-50",
  },
  {
    id: "payment_failed",
    label: "پرداخت ناموفق",
    desc: "اعلان پرداخت ناموفق",
    icon: CreditCard,
    color: "text-rose-500 bg-rose-50",
  },
  {
    id: "low_stock",
    label: "هشدار موجودی کم",
    desc: "اعلان هنگام کمبود موجودی محصول",
    icon: AlertTriangle,
    color: "text-amber-500 bg-amber-50",
  },
  {
    id: "out_of_stock",
    label: "ناموجود شدن",
    desc: "اعلان هنگام صفر شدن موجودی",
    icon: Package,
    color: "text-orange-500 bg-orange-50",
  },
  {
    id: "price_drop",
    label: "کاهش قیمت",
    desc: "اعلان کاهش قیمت به کاربران علاقه‌مند",
    icon: TrendingDown,
    color: "text-teal-500 bg-teal-50",
  },
  {
    id: "restock",
    label: "موجود شدن مجدد",
    desc: "اعلان موجود شدن محصول ناموجود",
    icon: Package,
    color: "text-green-500 bg-green-50",
  },
  {
    id: "return_request",
    label: "درخواست مرجوعی",
    desc: "اعلان درخواست مرجوعی کالا",
    icon: RotateCcw,
    color: "text-purple-500 bg-purple-50",
  },
  {
    id: "new_user",
    label: "کاربر جدید",
    desc: "اعلان ثبت‌نام کاربر جدید",
    icon: User,
    color: "text-sky-500 bg-sky-50",
  },
  {
    id: "new_review",
    label: "نظر جدید",
    desc: "اعلان ثبت نظر جدید توسط کاربر",
    icon: MessageSquare,
    color: "text-violet-500 bg-violet-50",
  },
  {
    id: "ticket_new",
    label: "تیکت جدید",
    desc: "اعلان ارسال تیکت پشتیبانی جدید",
    icon: Mail,
    color: "text-pink-500 bg-pink-50",
  },
];

export default function NotificationsSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("notifications");

  const channels = [
    { key: "notifEmail", label: "ایمیل", desc: "ارسال از طریق ایمیل" },
    { key: "notifSms", label: "پیامک", desc: "ارسال از طریق SMS" },
    { key: "notifInApp", label: "درون‌برنامه‌ای", desc: "نمایش در صفحه اعلان‌ها" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="تنظیمات اعلانات"
        description="کنترل دقیق اعلان‌های ارسالی به مشتریان و ادمین‌ها"
        gradient="from-indigo-50 to-blue-50 border-indigo-200/50"
      />

      {/* ── کانال‌های ارسال ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> کانال‌های ارسال
        </h4>
        <p className="text-xs text-muted-foreground">روش‌های ارسال اعلان را فعال/غیرفعال کنید.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {channels.map((ch) => (
            <div key={ch.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <p className="text-sm font-medium">{ch.label}</p>
                <p className="text-[11px] text-muted-foreground">{ch.desc}</p>
              </div>
              <Toggle
                checked={getVal(ch.key) !== false}
                onChange={() => setVal(ch.key, getVal(ch.key) === false ? true : false)}
                label=""
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── انواع اعلان ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold">انواع اعلان</h4>
        <p className="text-xs text-muted-foreground">هر نوع اعلان را جداگانه فعال/غیرفعال کنید.</p>
        <div className="space-y-2">
          {NOTIFICATION_TYPES.map((nt) => {
            const Icon = nt.icon;
            const enabled = getVal(`notif_${nt.id}`) !== false;
            return (
              <div key={nt.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${enabled ? "bg-muted/30" : "bg-muted/10 opacity-60"}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${nt.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{nt.label}</p>
                    <p className="text-[11px] text-muted-foreground">{nt.desc}</p>
                  </div>
                </div>
                <Toggle
                  checked={enabled}
                  onChange={() => setVal(`notif_${nt.id}`, enabled ? false : true)}
                  label=""
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── آستانه‌ها ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold">آستانه‌ها و شرایط</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="آستانه موجودی کم"
            placeholder="5"
            value={getVal("lowStockThreshold") || "5"}
            onChange={(v) => setVal("lowStockThreshold", v)}
          />
          <Field
            label="حداکثر اعلان در روز (هر کاربر)"
            placeholder="20"
            value={getVal("dailyNotificationLimit") || "20"}
            onChange={(v) => setVal("dailyNotificationLimit", v)}
          />
        </div>
      </div>

      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
