import { Share2, Phone } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش شبکه‌های اجتماعی */
export default function SocialSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("social");

  return (
    <div className="space-y-4">
      <SectionHeader title="شبکه‌های اجتماعی" description="لینک‌های صفحات اجتماعی فروشگاه." gradient="from-blue-50 to-indigo-50 border-blue-200/50" />
      <Field label="اینستاگرام" placeholder="https://instagram.com/clubinex" value={getVal("instagram")} onChange={(v) => setVal("instagram", v)} icon={Share2} />
      <Field label="تلگرام" placeholder="https://t.me/clubinex" value={getVal("telegram")} onChange={(v) => setVal("telegram", v)} />
      <Field label="واتساپ" placeholder="۰۹۱۲۱۲۳۴۵۶۷" value={getVal("whatsapp")} onChange={(v) => setVal("whatsapp", v)} icon={Phone} />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
