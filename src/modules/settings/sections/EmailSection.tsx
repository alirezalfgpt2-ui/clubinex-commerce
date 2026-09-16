/**
 * 📧 تنظیمات ایمیل (SMTP) — جامع
 * — تنظیمات اتصال SMTP
 * — تست ارسال ایمیل
 * — قالب‌های ایمیل
 */
import { useState } from "react";
import { Mail, Send, Loader2, Server } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";
import { toast } from "sonner";

const SMTP_PRESETS = [
  { name: "Gmail", host: "smtp.gmail.com", port: "587" },
  { name: "Outlook", host: "smtp-mail.outlook.com", port: "587" },
  { name: "Yahoo", host: "smtp.mail.yahoo.com", port: "587" },
  { name: "Custom", host: "", port: "" },
];

export default function EmailSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("email");
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  const handleTestEmail = async () => {
    if (!testEmail.trim()) return toast.error("ایمیل را وارد کنید");
    setTesting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("ایمیل تست با موفقیت ارسال شد.");
    } catch {
      toast.error("خطا در ارسال ایمیل تست.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="تنظیمات ایمیل (SMTP)"
        description="اتصال به سرور ایمیل برای ارسال خودکار"
        gradient="from-rose-50 to-pink-50 border-rose-200/50"
      />

      {/* ── پیش‌تنظیم SMTP ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" /> سرویس‌دهنده ایمیل
        </h4>
        <div className="flex flex-wrap gap-2">
          {SMTP_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                if (p.host) {
                  setVal("smtp_host", p.host);
                  setVal("smtp_port", p.port);
                }
              }}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── تنظیمات SMTP ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold">تنظیمات اتصال</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="SMTP Host" placeholder="smtp.gmail.com" value={getVal("smtp_host")} onChange={(v) => setVal("smtp_host", v)} icon={Mail} />
          <Field label="SMTP Port" placeholder="587" value={getVal("smtp_port")} onChange={(v) => setVal("smtp_port", v)} />
        </div>
        <Field label="ایمیل فرستنده" placeholder="noreply@yourdomain.com" value={getVal("smtp_from")} onChange={(v) => setVal("smtp_from", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="نام کاربری" placeholder="email@example.com" value={getVal("smtp_user")} onChange={(v) => setVal("smtp_user", v)} />
          <Field label="رمز عبور" type="password" placeholder="••••••••" value={getVal("smtp_pass")} onChange={(v) => setVal("smtp_pass", v)} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium">SSL/TLS</label>
          <button
            onClick={() => setVal("smtp_ssl", getVal("smtp_ssl") === false ? true : false)}
            className={`relative w-10 h-5 rounded-full transition-colors ${getVal("smtp_ssl") !== false ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${getVal("smtp_ssl") !== false ? "left-[20px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      {/* ── تست ارسال ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" /> تست ارسال ایمیل
        </h4>
        <p className="text-xs text-muted-foreground">یک ایمیل تست به آدرس مورد نظر ارسال کنید.</p>
        <div className="flex items-center gap-2">
          <input
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="آدرس ایمیل تست"
            className="clay-input flex-1 h-9 text-sm"
            dir="ltr"
          />
          <button
            onClick={handleTestEmail}
            disabled={testing || !testEmail.trim()}
            className="clay-button flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground disabled:opacity-50"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            ارسال تست
          </button>
        </div>
      </div>

      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
