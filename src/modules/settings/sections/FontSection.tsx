import { RotateCcw, Type } from "lucide-react";
import { toast } from "sonner";
import { applyFont } from "@/config/themes";
import { useSettings } from "../hooks/use-settings";
import { Field, Select, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش تنظیمات فونت */
export default function FontSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("font");

  const handleResetDefaults = () => {
    applyFont("Vazirmatn", "14");
    toast.success("فونت به حالت پیش‌فرض بازگشت.");
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="تنظیمات فونت" description="فونت و اندازه متن سایت." gradient="from-fuchsia-50 to-pink-50 border-fuchsia-200/50" />
      <Select
        label="فونت اصلی سایت"
        value={getVal("fontFamily") || "Vazirmatn"}
        onChange={(v) => { setVal("fontFamily", v); applyFont(v, getVal("fontSize") || "14"); }}
        options={[
          { value: "Vazirmatn", label: "وزیرمتن (Vazirmatn)" },
          { value: "IRANSans", label: "ایران‌سنس (IRANSans)" },
          { value: "YekanBakh", label: "یکان‌بخ (Yekan Bakh)" },
          { value: "Shabnam", label: "شبنم (Shabnam)" },
          { value: "Tahoma", label: "تاهوما (Tahoma)" },
          { value: "system-ui", label: "سیستم (System UI)" },
        ]}
      />
      <Field label="اندازه فونت (پیکسل)" placeholder="14" value={getVal("fontSize") || "14"} onChange={(v) => { setVal("fontSize", v); applyFont(getVal("fontFamily") || "Vazirmatn", v); }} icon={Type} />
      <div className="rounded-xl border bg-card p-4">
        <p className="text-[11px] text-muted-foreground mb-2">پیش‌نمایش:</p>
        <p className="text-lg font-bold">فارسی — وزیرمتن</p>
        <p className="text-sm text-muted-foreground mt-1">این متن نمونه‌ای از فونت انتخابی شماست.</p>
      </div>
      <button onClick={handleResetDefaults} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-all">
        <RotateCcw className="h-4 w-4" /> بازگشت به فونت پیش‌فرض
      </button>
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
