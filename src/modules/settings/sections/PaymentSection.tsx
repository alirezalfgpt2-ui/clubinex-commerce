import { CreditCard } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش درگاه‌های پرداخت بانکی */
export default function PaymentSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("payment");

  const gateways = [
    { name: "زرین‌پال", color: "blue", fields: [{ label: "Merchant ID", key: "zarinpal_merchant", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }] },
    { name: "پی‌پینگ", color: "green", fields: [{ label: "توکن", key: "payping_token", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }] },
    { name: "سامان کیان", color: "purple", fields: [{ label: "مرچنت کد", key: "saman_merchant", ph: "Terminal ID" }] },
    { name: "پاسارگاد", color: "teal", fields: [{ label: "کد پذیرنده", key: "pasargad_merchant", ph: "Merchant Code" }, { label: "کد ترمینال", key: "pasargad_terminal", ph: "Terminal Code" }] },
    { name: "ملت", color: "red", fields: [{ label: "شماره ترمینال", key: "mellat_terminal", ph: "Terminal ID" }, { label: "نام کاربری", key: "mellat_username", ph: "Username" }, { label: "رمز عبور", key: "mellat_password", ph: "••••••••", type: "password" }] },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="درگاه‌های پرداخت بانکی" description="کلید API درگاه‌های فعال را وارد کنید." gradient="from-amber-50 to-orange-50 border-amber-200/50" />
      {gateways.map((gw) => (
        <div key={gw.name} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg bg-${gw.color}-500/10 flex items-center justify-center`}><CreditCard className={`h-4 w-4 text-${gw.color}-500`} /></div>
            <p className="text-sm font-semibold">{gw.name}</p>
          </div>
          {gw.fields.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gw.fields.map((f) => <Field key={f.key} label={f.label} placeholder={f.ph} value={getVal(f.key)} onChange={(v) => setVal(f.key, v)} type={f.type} />)}
            </div>
          ) : <Field label={gw.fields[0].label} placeholder={gw.fields[0].ph} value={getVal(gw.fields[0].key)} onChange={(v) => setVal(gw.fields[0].key, v)} type={gw.fields[0].type} />}
        </div>
      ))}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">صفحه بازگشت</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="آدرس بازگشت موفق" placeholder="/payment/return?status=success" value={getVal("payment_return_success")} onChange={(v) => setVal("payment_return_success", v)} />
          <Field label="آدرس بازگشت ناموفق" placeholder="/payment/return?status=failed" value={getVal("payment_return_failed")} onChange={(v) => setVal("payment_return_failed", v)} />
        </div>
      </div>
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
