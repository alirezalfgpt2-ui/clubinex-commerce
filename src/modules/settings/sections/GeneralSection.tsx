import { Settings, Mail, Phone } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش تنظیمات عمومی — اطلاعات فروشگاه */
export default function GeneralSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("general");

  return (
    <div className="space-y-4">
      <SectionHeader title="اطلاعات فروشگاه" description="اطلاعات اصلی فروشگاه خود را تنظیم کنید." gradient="from-primary/5 to-accent/5 border-primary/10" />
      <Field label="نام فروشگاه" placeholder="Clubinex Commerce" value={getVal("siteName")} onChange={(v) => setVal("siteName", v)} icon={Settings} />
      <Field label="توضیحات فروشگاه" placeholder="فروشگاه آنلاین هوشمند..." value={getVal("siteDescription")} onChange={(v) => setVal("siteDescription", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="شماره تماس" placeholder="۰۲۱-۱۲۳۴۵۶۷۸" value={getVal("sitePhone")} onChange={(v) => setVal("sitePhone", v)} icon={Phone} />
        <Field label="ایمیل پشتیبانی" placeholder="support@clubinex.com" value={getVal("siteEmail")} onChange={(v) => setVal("siteEmail", v)} icon={Mail} />
      </div>
      <Field label="آدرس فروشگاه" placeholder="تهران، خیابان ولیعصر..." value={getVal("siteAddress")} onChange={(v) => setVal("siteAddress", v)} />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
