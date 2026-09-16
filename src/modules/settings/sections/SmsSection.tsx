import { Key, Phone } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش تنظیمات پنل پیامکی */
export default function SmsSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("sms");

  return (
    <div className="space-y-4">
      <SectionHeader title="تنظیمات پنل پیامکی" description="اتصال به پنل‌های پیامکی." gradient="from-cyan-50 to-sky-50 border-cyan-200/50" />
      <Field label="API Key" placeholder="کلید API پنل پیامک" value={getVal("sms_api_key")} onChange={(v) => setVal("sms_api_key", v)} icon={Key} />
      <Field label="شماره ارسال کننده" placeholder="۱۰۰۰۰۰۰۰۰" value={getVal("sms_sender")} onChange={(v) => setVal("sms_sender", v)} icon={Phone} />
      <Field label="آدرس API" placeholder="https://api.kavenegar.com/v1/..." value={getVal("sms_endpoint")} onChange={(v) => setVal("sms_endpoint", v)} />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
