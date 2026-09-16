/**
 * ChatThemeSection — تنظیمات رنگ و ظاهر چت زنده
 */
import { useState } from "react";
import { MessageSquare, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "../hooks/use-settings";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ColorPicker, SaveButton, SectionHeader } from "../components/SettingsUI";

const DEFAULT_CHAT_THEME = {
  background: "linear-gradient(135deg, oklch(0.50 0.18 270), oklch(0.70 0.15 320))",
  headerBg: "",
  textColor: "",
  userBubbleColor: "",
  operatorBubbleColor: "",
  accentColor: "",
};

export default function ChatThemeSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("chatTheme");
  const confirmDialog = useConfirm();
  const [bgType, setBgType] = useState<"gradient" | "solid">(() => {
    const v = getVal("background");
    return v && v.includes("gradient") ? "gradient" : "solid";
  });

  const handleReset = async () => {
    if (!await confirmDialog({ title: "بازگشت به پیش‌فرض", message: "رنگ‌های چت به حالت پیش‌فرض بازمی‌گردد.", variant: "warning" })) return;
    Object.entries(DEFAULT_CHAT_THEME).forEach(([k, v]) => setVal(k, v));
    toast.success("رنگ‌های چت بازگشت.");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="تنظیمات ظاهر چت زنده"
        description="رنگ و ظاهر ویجت چت در صفحه اصلی را سفارشی کنید."
        gradient="from-blue-50 to-cyan-50 border-blue-200/50"
      />

      {/* پیش‌نمایش زنده */}
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground mb-2">پیش‌نمایش</p>
          <div className="flex justify-center">
            <div className="w-[280px] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="p-3 flex items-center gap-2 text-white"
                style={{
                  background: getVal("headerBg") || undefined || "linear-gradient(135deg, oklch(0.50 0.18 270), oklch(0.70 0.15 320))",
                }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold">پشتیبانی زنده</p>
                  <p className="text-[9px] text-white/70">آنلاین و آماده</p>
                </div>
              </div>
              <div className="p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-md p-2">
                    <p className="text-[10px] text-gray-600">سلام! خوش آمدید 👋</p>
                    <p className="text-[8px] text-gray-400 mt-0.5">۱۴:۳۰</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-primary text-white rounded-2xl rounded-br-md p-2">
                    <p className="text-[10px]">سلام، سوال دارم</p>
                    <p className="text-[8px] text-white/60 mt-0.5 text-left">۱۴:۳۱</p>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t bg-white dark:bg-gray-900">
                <div className="flex gap-1.5">
                  <input readOnly placeholder="پیام..." className="flex-1 rounded-lg border px-2 py-1.5 text-[10px] outline-none bg-white dark:bg-gray-800" />
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-[10px]">→</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* رنگ‌ها */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-2">رنگ هدر</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ColorPicker
              label="رنگ پس‌زمینه هدر"
              value={getVal("headerBg") || "#5046e5"}
              onChange={(v) => setVal("headerBg", v)}
            />
            <ColorPicker
              label="رنگ متن هدر"
              value={getVal("textColor") || "#ffffff"}
              onChange={(v) => setVal("textColor", v)}
            />
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-[11px] font-medium text-muted-foreground mb-2">رنگ حباب‌های پیام</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ColorPicker
              label="حباب کاربر"
              value={getVal("userBubbleColor") || "#5046e5"}
              onChange={(v) => setVal("userBubbleColor", v)}
            />
            <ColorPicker
              label="حباب اپراتور"
              value={getVal("operatorBubbleColor") || "#ffffff"}
              onChange={(v) => setVal("operatorBubbleColor", v)}
            />
            <ColorPicker
              label="رنگ ثانویه"
              value={getVal("accentColor") || "#8b5cf6"}
              onChange={(v) => setVal("accentColor", v)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <RotateCcw className="h-4 w-4" /> بازگشت به پیش‌فرض
        </button>
        <SaveButton onClick={handleSaveAll} loading={isSaving} />
      </div>
    </div>
  );
}
