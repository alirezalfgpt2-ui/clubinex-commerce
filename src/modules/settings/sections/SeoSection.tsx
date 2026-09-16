import { Globe } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش سئو — متاتگ‌ها و بهینه‌سازی */
export default function SeoSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("seo");

  return (
    <div className="space-y-4">
      <SectionHeader title="بهینه‌سازی موتورهای جستجو" description="متاتگ‌ها و تنظیمات SEO." gradient="from-emerald-50 to-teal-50 border-emerald-200/50" />
      <Field label="عنوان صفحه (Title)" placeholder="فروشگاه آنلاین Clubinex" value={getVal("seoTitle")} onChange={(v) => setVal("seoTitle", v)} icon={Globe} />
      <Field label="توضیحات متا (Description)" placeholder="توضیح کوتاه برای موتورهای جستجو..." value={getVal("seoDescription")} onChange={(v) => setVal("seoDescription", v)} />
      <Field label="کلمات کلیدی" placeholder="فروشگاه, آنلاین, خرید" value={getVal("seoKeywords")} onChange={(v) => setVal("seoKeywords", v)} />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
