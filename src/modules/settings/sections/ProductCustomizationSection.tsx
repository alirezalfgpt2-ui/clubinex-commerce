/**
 * 🎨 تنظیمات سفارشی‌سازی محصولات
 * — فعال/غیرفعال کردن انتخاب رنگ، سایز، حکاکی
 * — تنظیم هزینه اضافی هر گزینه
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Palette, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CustomOption {
  label: string;
  extraPrice: number;
  isActive: boolean;
}

export default function ProductCustomizationSection() {
  const settings = useQuery(api.settings.get, { key: "productCustomization" });
  const updateSettings = useMutation(api.settings.set);

  const [colorEnabled, setColorEnabled] = useState(true);
  const [sizeEnabled, setSizeEnabled] = useState(true);
  const [engravingEnabled, setEngravingEnabled] = useState(false);
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.value) {
      const v = settings.value;
      setColorEnabled(v.colorEnabled ?? true);
      setSizeEnabled(v.sizeEnabled ?? true);
      setEngravingEnabled(v.engravingEnabled ?? false);
      setCustomOptions(v.customOptions ?? []);
    }
  }, [settings]);

  const addOption = () => {
    setCustomOptions([...customOptions, { label: "", extraPrice: 0, isActive: true }]);
  };

  const removeOption = (i: number) => {
    setCustomOptions(customOptions.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, key: keyof CustomOption, val: any) => {
    const next = [...customOptions];
    next[i] = { ...next[i], [key]: val };
    setCustomOptions(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        key: "productCustomization",
        category: "product",
        value: { colorEnabled, sizeEnabled, engravingEnabled, customOptions },
      });
      toast.success("تنظیمات ذخیره شد.");
    } catch {
      toast.error("خطا در ذخیره.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle options */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">گزینه‌های سفارشی</h4>
        <p className="text-xs text-muted-foreground">گزینه‌هایی که مشتری هنگام خرید می‌تواند انتخاب کند.</p>

        {[
          { label: "انتخاب رنگ", desc: "مشتری رنگ محصول را انتخاب کند", value: colorEnabled, onChange: setColorEnabled },
          { label: "انتخاب سایز", desc: "مشتری سایز محصول را انتخاب کند", value: sizeEnabled, onChange: setSizeEnabled },
          { label: "حکاکی سفارشی", desc: "امکان ثبت متن حکاکی روی محصول", value: engravingEnabled, onChange: setEngravingEnabled },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={() => item.onChange(!item.value)}
              className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.value ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Custom options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">گزینه‌های سفارشی اضافی</h4>
          <button onClick={addOption} className="clay-button px-3 py-1.5 text-xs flex items-center gap-1">
            <Plus className="h-3 w-3" /> افزودن
          </button>
        </div>
        {customOptions.length === 0 && (
          <p className="text-xs text-muted-foreground">گزینه سفارشی تعریف نشده.</p>
        )}
        {customOptions.map((opt, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <input
              value={opt.label}
              onChange={(e) => updateOption(i, "label", e.target.value)}
              placeholder="نام گزینه"
              className="clay-input flex-1 h-8 text-xs"
            />
            <input
              type="number"
              value={opt.extraPrice}
              onChange={(e) => updateOption(i, "extraPrice", Number(e.target.value))}
              placeholder="هزینه اضافی"
              className="clay-input w-28 h-8 text-xs"
            />
            <button
              onClick={() => updateOption(i, "isActive", !opt.isActive)}
              className={`w-9 h-5 rounded-full transition-colors ${opt.isActive ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${opt.isActive ? "ml-[18px]" : "ml-[2px]"} mt-[2px]`} />
            </button>
            <button onClick={() => removeOption(i)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="clay-button flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        ذخیره تنظیمات
      </button>
    </div>
  );
}
