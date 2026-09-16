import { useState } from "react";
import { Settings, Upload, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export interface ReportSettingsData {
  header: string;
  footer: string;
  logoUrl: string;
  companyName: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  orientation: "portrait" | "landscape";
  paperSize: "A4" | "A5" | "Letter" | "Legal";
  showDate: boolean;
  showPageNumber: boolean;
  showBorder: boolean;
  fontSize: "small" | "medium" | "large";
  direction: "rtl" | "ltr";
}

const DEFAULT_SETTINGS: ReportSettingsData = {
  header: "گزارش فروشگاه Clubinex",
  footer: "Clubinex Commerce — تمامی حقوق محفوظ است",
  logoUrl: "",
  companyName: "Clubinex Commerce",
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 15,
  marginRight: 15,
  orientation: "portrait",
  paperSize: "A4",
  showDate: true,
  showPageNumber: true,
  showBorder: true,
  fontSize: "medium",
  direction: "rtl",
};

interface ReportSettingsProps {
  settings: ReportSettingsData;
  onChange: (settings: ReportSettingsData) => void;
}

export function ReportSettings({ settings, onChange }: ReportSettingsProps) {
  const [showPanel, setShowPanel] = useState(false);

  const update = (partial: Partial<ReportSettingsData>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="clay-button flex items-center gap-2 px-3 py-2 text-xs font-medium"
      >
        <Settings className="h-3.5 w-3.5" />
        تنظیمات گزارش
      </button>

      {showPanel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-2xl shadow-2xl p-5 w-[400px] max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">تنظیمات گزارش</h3>
            <button onClick={() => setShowPanel(false)} className="text-xs text-muted-foreground hover:text-foreground">بستن ✕</button>
          </div>

          <div className="space-y-4">
            {/* Company & Header */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">اطلاعات شرکت</p>
              <div>
                <label className="text-xs text-muted-foreground mb-0.5 block">نام شرکت</label>
                <input value={settings.companyName} onChange={(e) => update({ companyName: e.target.value })} className="clay-input w-full p-2 text-xs outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-0.5 block">هدر گزارش</label>
                <input value={settings.header} onChange={(e) => update({ header: e.target.value })} className="clay-input w-full p-2 text-xs outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-0.5 block">فوتر گزارش</label>
                <input value={settings.footer} onChange={(e) => update({ footer: e.target.value })} className="clay-input w-full p-2 text-xs outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-0.5 block">لوگو (URL تصویر)</label>
                <input value={settings.logoUrl} onChange={(e) => update({ logoUrl: e.target.value })} className="clay-input w-full p-2 text-xs outline-none" placeholder="https://..." dir="ltr" />
              </div>
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">چیدمان صفحه</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">جهت صفحه</label>
                  <select value={settings.orientation} onChange={(e) => update({ orientation: e.target.value as any })} className="clay-input w-full p-2 text-xs outline-none">
                    <option value="portrait">عمودی (Portrait)</option>
                    <option value="landscape">افقی (Landscape)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-0.5 block">اندازه کاغذ</label>
                  <select value={settings.paperSize} onChange={(e) => update({ paperSize: e.target.value as any })} className="clay-input w-full p-2 text-xs outline-none">
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-0.5 block">اندازه فونت</label>
                <select value={settings.fontSize} onChange={(e) => update({ fontSize: e.target.value as any })} className="clay-input w-full p-2 text-xs outline-none">
                  <option value="small">کوچک</option>
                  <option value="medium">متوسط</option>
                  <option value="large">بزرگ</option>
                </select>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">حاشیه‌ها (میلی‌متر)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">بالا</label>
                  <input type="number" value={settings.marginTop} onChange={(e) => update({ marginTop: Number(e.target.value) })} className="clay-input w-full p-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">پایین</label>
                  <input type="number" value={settings.marginBottom} onChange={(e) => update({ marginBottom: Number(e.target.value) })} className="clay-input w-full p-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">راست</label>
                  <input type="number" value={settings.marginRight} onChange={(e) => update({ marginRight: Number(e.target.value) })} className="clay-input w-full p-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">چپ</label>
                  <input type="number" value={settings.marginLeft} onChange={(e) => update({ marginLeft: Number(e.target.value) })} className="clay-input w-full p-2 text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">گزینه‌ها</p>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={settings.showDate} onChange={(e) => update({ showDate: e.target.checked })} className="accent-primary" />
                نمایش تاریخ
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={settings.showPageNumber} onChange={(e) => update({ showPageNumber: e.target.checked })} className="accent-primary" />
                نمایش شماره صفحه
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={settings.showBorder} onChange={(e) => update({ showBorder: e.target.checked })} className="accent-primary" />
                نمایش حاشیه دور صفحه
              </label>
            </div>

            {/* Reset */}
            <button
              onClick={() => onChange(DEFAULT_SETTINGS)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> بازنشانی به پیش‌فرض
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export { DEFAULT_SETTINGS };
