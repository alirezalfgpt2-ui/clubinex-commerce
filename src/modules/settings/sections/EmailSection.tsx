import { Mail } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش ایمیل (SMTP) */
export default function EmailSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("email");

  return (
    <div className="space-y-4">
      <SectionHeader title="تنظیمات ایمیل (SMTP)" description="اتصال به سرور ایمیل." gradient="from-rose-50 to-pink-50 border-rose-200/50" />
      <Field label="SMTP Host" placeholder="smtp.gmail.com" value={getVal("smtp_host")} onChange={(v) => setVal("smtp_host", v)} icon={Mail} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="SMTP Port" placeholder="587" value={getVal("smtp_port")} onChange={(v) => setVal("smtp_port", v)} />
        <Field label="ایمیل فرستنده" placeholder="noreply@clubinex.com" value={getVal("smtp_from")} onChange={(v) => setVal("smtp_from", v)} />
      </div>
      <Field label="نام کاربری" placeholder="email@example.com" value={getVal("smtp_user")} onChange={(v) => setVal("smtp_user", v)} />
      <Field label="رمز عبور" type="password" placeholder="••••••••" value={getVal("smtp_pass")} onChange={(v) => setVal("smtp_pass", v)} />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
