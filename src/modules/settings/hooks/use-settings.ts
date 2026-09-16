import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

/**
 * هوک مشترک مدیریت状态 تنظیمات
 * خواندن، نوشتن و ذخیره مقادیر تنظیمات
 */
export function useSettings(category: string) {
  const settings = useQuery(api.settings.getByCategory, { category });
  const setSetting = useMutation(api.settings.set);
  const [values, setValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  /** خواندن مقدار */
  const getVal = (key: string) => {
    const existing = settings?.find((s) => s.key === key);
    return values[key] ?? existing?.value ?? "";
  };

  /** نوشتن مقدار */
  const setVal = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  /** ذخیره تمام تغییرات */
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const [key, value] of Object.entries(values)) {
        await setSetting({ key, value, category, isPublic: true });
      }
      toast.success("تنظیمات ذخیره شد.");
    } catch {
      toast.error("خطا در ذخیره‌سازی.");
    } finally {
      setIsSaving(false);
    }
  };

  return { settings, getVal, setVal, handleSaveAll, isSaving };
}
