/**
 * 💳 تنظیمات درگاه پرداخت — جامع
 * — انتخاب درگاه فعال
 * — حالت تست/زندده
 * — تنظیمات ارز
 * — کلیدهای API تمام درگاه‌ها
 */
import { CreditCard, TestTube, ToggleLeft, ToggleRight } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

const GATEWAYS = [
  { id: "zarinpal", name: "زرین‌پال", color: "blue", fields: [{ label: "Merchant ID", key: "zarinpal_merchant", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }] },
  { id: "payping", name: "پی‌پینگ", color: "green", fields: [{ label: "توکن", key: "payping_token", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }] },
  { id: "saman", name: "سامان کیان", color: "purple", fields: [{ label: "مرچنت کد", key: "saman_merchant", ph: "Terminal ID" }] },
  { id: "pasargad", name: "پاسارگاد", color: "teal", fields: [
    { label: "کد پذیرنده", key: "pasargad_merchant", ph: "Merchant Code" },
    { label: "کد ترمینال", key: "pasargad_terminal", ph: "Terminal Code" },
  ] },
  { id: "mellat", name: "ملت", color: "red", fields: [
    { label: "شماره ترمینال", key: "mellat_terminal", ph: "Terminal ID" },
    { label: "نام کاربری", key: "mellat_username", ph: "Username" },
    { label: "رمز عبور", key: "mellat_password", ph: "••••••••", type: "password" },
  ] },
  { id: "simulate", name: "شبیه‌ساز (آزمایشی)", color: "gray", fields: [] },
];

export default function PaymentSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("payment");
  const activeGateway = getVal("paymentGateway") || "simulate";
  const isTestMode = getVal("paymentTestMode") !== false;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="درگاه‌های پرداخت بانکی"
        description="اتصال و پیکربندی درگاه‌های پرداخت آنلاین"
        gradient="from-amber-50 to-orange-50 border-amber-200/50"
      />

      {/* ── درگاه فعال ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" /> درگاه فعال
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {GATEWAYS.map((gw) => (
            <button
              key={gw.id}
              onClick={() => setVal("paymentGateway", gw.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                activeGateway === gw.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg bg-${gw.color}-500/10 flex items-center justify-center mx-auto mb-1`}>
                <CreditCard className={`h-4 w-4 text-${gw.color}-500`} />
              </div>
              <p className="text-xs font-medium">{gw.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── حالت تست/زندگانی ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-sm font-semibold">حالت تست</p>
              <p className="text-[11px] text-muted-foreground">پرداخت شبیه‌سازی شده بدون اتصال به بانک</p>
            </div>
          </div>
          <button
            onClick={() => setVal("paymentTestMode", !isTestMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isTestMode ? "bg-amber-500" : "bg-emerald-500"}`}
          >
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isTestMode ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
        {isTestMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            ⚠️ در حالت تست، پرداخت واقعی انجام نمی‌شود. برای فعال‌سازی پرداخت واقعی، حالت تست را غیرفعال کنید.
          </div>
        )}
      </div>

      {/* ── تنظیمات ارز ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold">واحد پول</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="واحد پول" placeholder="تومان" value={getVal("currency") || "تومان"} onChange={(v) => setVal("currency", v)} />
          <Field label="نماد پول" placeholder="ت" value={getVal("currencySymbol") || "ت"} onChange={(v) => setVal("currencySymbol", v)} />
        </div>
      </div>

      {/* ── کلیدهای API درگاه‌ها ── */}
      {GATEWAYS.filter((gw) => gw.id !== "simulate" && gw.id === activeGateway).map((gw) => (
        <div key={gw.id} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg bg-${gw.color}-500/10 flex items-center justify-center`}>
              <CreditCard className={`h-4 w-4 text-${gw.color}-500`} />
            </div>
            <p className="text-sm font-semibold">کلیدهای API — {gw.name}</p>
          </div>
          {gw.fields.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gw.fields.map((f) => (
                <Field key={f.key} label={f.label} placeholder={f.ph} value={getVal(f.key)} onChange={(v) => setVal(f.key, v)} type={f.type} />
              ))}
            </div>
          ) : (
            <Field label={gw.fields[0].label} placeholder={gw.fields[0].ph} value={getVal(gw.fields[0].key)} onChange={(v) => setVal(gw.fields[0].key, v)} type={gw.fields[0].type} />
          )}
        </div>
      ))}

      {/* ── صفحه بازگشت ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">صفحه بازگشت پرداخت</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="آدرس بازگشت موفق" placeholder="/payment/return?status=success" value={getVal("payment_return_success")} onChange={(v) => setVal("payment_return_success", v)} />
          <Field label="آدرس بازگشت ناموفق" placeholder="/payment/return?status=failed" value={getVal("payment_return_failed")} onChange={(v) => setVal("payment_return_failed", v)} />
        </div>
      </div>

      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
