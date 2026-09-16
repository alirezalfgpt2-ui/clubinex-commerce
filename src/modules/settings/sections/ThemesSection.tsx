import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { THEME_PRESETS, applyTheme, getCurrentTheme, updateBrowserThemeColor, getBrowserThemeColor } from "@/config/themes";
import { SIDEBAR_THEMES, applySidebarTheme, SIDEBAR_THEME_PREVIEWS, getCurrentSidebarTheme } from "@/config/sidebar-themes";
import { ThemePreviewCard } from "../components/ThemePreviewCard";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useSettings } from "../hooks/use-settings";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ColorPicker, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش تم و رنگ‌بندی */
export default function ThemesSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("themes");
  const [activeTheme, setActiveTheme] = useState(getCurrentTheme());
  const [browserThemeColor, setBrowserThemeColor] = useState(getBrowserThemeColor());
  const [sidebarTheme, setSidebarTheme] = useState(getCurrentSidebarTheme);
  const confirmDialog = useConfirm();

  /** تغییر تم اصلی سایت */
  const handleThemeChange = (themeId: string) => {
    applyTheme(themeId);
    setActiveTheme(themeId);
    toast.success("تم تغییر کرد.");
  };

  /** تغییر تم سایدبار — تمام CSS variables را اعمال می‌کند */
  const handleSidebarTheme = (id: string) => {
    setSidebarTheme(id);
    localStorage.setItem("clubinex-sidebar-theme", id);
    if (id === "sidebar-auto") { applyTheme(getCurrentTheme()); } else { applySidebarTheme(id); }
    toast.success("سبک سایدبار تغییر کرد.");
  };

  /** بازگشت به تنظیمات پیش‌فرض */
  const handleResetDefaults = async () => {
    if (!await confirmDialog({ title: "بازگشت به پیش‌فرض", message: "آیا از بازگشت به تنظیمات پیش‌فرض اطمینان دارید؟", variant: "warning" })) return;
    applyTheme("royal-indigo");
    setActiveTheme("royal-indigo");
    localStorage.removeItem("clubinex-sidebar-theme");
    setSidebarTheme("sidebar-light");
    applySidebarTheme("sidebar-light");
    // حذف رنگ‌های سفارشی
    ["customPrimary", "customAccent", "customBg", "customCard", "customForeground", "customBorder",
     "customTopbar", "customSubnav", "customSidebar", "customBreadcrumb", "customFooter"
    ].forEach((k) => localStorage.removeItem("clubinex_" + k));
    updateBrowserThemeColor("#6366f1");
    setBrowserThemeColor("#6366f1");
    toast.success("تنظیمات به حالت پیش‌فرض بازگشت.");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="تم و رنگ‌بندی فروشگاه"
        description="ظاهر سایت را با پیش‌نمایش زنده انتخاب کنید."
        gradient="from-violet-50 to-purple-50 border-violet-200/50"
      />

      {/* ── گرید تم‌ها ── */}
      <div>
        <h4 className="text-sm font-semibold mb-3">انتخاب تم اصلی</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_PRESETS.map((theme) => {
            const isDark = document.documentElement.classList.contains("dark");
            const vars = isDark && theme.darkVars ? { ...theme.vars, ...theme.darkVars } : theme.vars;
            return (
              <ThemePreviewCard
                key={theme.id}
                name={theme.name}
                nameFa={theme.nameFa}
                isActive={activeTheme === theme.id}
                primary={vars["--primary"] || theme.preview}
                accent={vars["--accent"] || theme.accentPreview}
                sidebar={vars["--sidebar"] || "#f8f9fa"}
                background={vars["--background"] || "#ffffff"}
                card={vars["--card"] || "#ffffff"}
                border={vars["--border"] || "#e5e7eb"}
                onClick={() => handleThemeChange(theme.id)}
              />
            );
          })}
        </div>
      </div>

      {/* ── تم‌های سایدبار با پیش‌نمایش واقعی ── */}
      <div>
        <h4 className="text-sm font-semibold mb-3">سبک سایدبار</h4>
        <p className="text-xs text-muted-foreground mb-3">هر تم تمام ویژگی‌های بصری سایدبار را تغییر می‌دهد: پس‌زمینه، متن، جستجو، آیتم‌ها و افکت‌ها.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SIDEBAR_THEMES.map((st) => {
            const isActive = sidebarTheme === st.id;
            const p = SIDEBAR_THEME_PREVIEWS[st.id];
            return (
              <button
                key={st.id}
                onClick={() => handleSidebarTheme(st.id)}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  isActive
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border/50 hover:border-border hover:shadow-md"
                }`}
              >
                {/* ── پیش‌نمایش سایدبار مینیاتوری ── */}
                <div
                  className="h-36 p-2 flex"
                  style={{ background: st.id === "sidebar-light" ? "#f1f5f9" : "#1a1a2e" }}
                >
                  <div className="w-full rounded-xl overflow-hidden flex flex-col" style={{ background: p.bg }}>
                    {/* لوگو */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-2"
                      style={{ borderBottom: `1px solid ${p.border}` }}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold"
                        style={{ background: st.vars["--sb-logo-bg"], color: st.vars["--sb-logo-text"] }}
                      >
                        C
                      </div>
                      <div className="h-1.5 w-14 rounded-full" style={{ background: p.text, opacity: 0.7 }} />
                    </div>

                    {/* کاربر */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5"
                      style={{ borderBottom: `1px solid ${p.border}` }}
                    >
                      <div className="w-5 h-5 rounded-full" style={{ background: p.active, opacity: 0.6 }} />
                      <div className="flex-1">
                        <div className="h-1 w-10 rounded-full mb-0.5" style={{ background: p.text, opacity: 0.5 }} />
                        <div className="h-0.5 w-8 rounded-full" style={{ background: p.group }} />
                      </div>
                    </div>

                    {/* جستجو */}
                    <div className="px-2 py-1.5">
                      <div
                        className="h-4 rounded"
                        style={{ background: p.search, borderRadius: st.vars["--sb-item-radius"] }}
                      />
                    </div>

                    {/* آیتم‌ها */}
                    <div className="flex-1 px-2 py-1 space-y-0.5">
                      <div className="h-1 w-10 rounded-full" style={{ background: p.group }} />
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-1.5 py-1"
                          style={{
                            background: i === 1 ? p.active : "transparent",
                            borderRadius: st.vars["--sb-item-radius"],
                          }}
                        >
                          <div
                            className="w-2.5 h-2.5"
                            style={{
                              background: i === 1 ? st.vars["--sb-active-text"] : p.text,
                              opacity: i === 1 ? 0.8 : 0.2,
                              borderRadius: Number(st.vars["--sb-item-radius"]) > 8 ? "4px" : "2px",
                            }}
                          />
                          <div
                            className="h-1 rounded-full flex-1"
                            style={{ background: i === 1 ? st.vars["--sb-active-text"] : p.text, opacity: i === 1 ? 0.7 : 0.15 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* برچسب */}
                <div className="p-3 text-center bg-card">
                  <p className="text-xs font-bold" style={{ color: st.accent }}>
                    {st.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{st.desc}</p>
                  {isActive && (
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <Check className="h-3.5 w-3.5" style={{ color: st.accent }} />
                      <span className="text-[10px] font-medium" style={{ color: st.accent }}>فعال</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      
      {/* ── شفافیت و افکت‌ها ── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h4 className="text-sm font-semibold mb-3">شفافیت و افکت‌ها</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">شفافیت مودال</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{getVal("modalOpacity") || "95"}%</span>
                </div>
                <input
                  type="range" min="50" max="100"
                  value={getVal("modalOpacity") || "95"}
                  onChange={(e) => { setVal("modalOpacity", e.target.value); document.documentElement.style.setProperty("--modal-opacity", e.target.value + "%"); }}
                  className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">شفافیت کارت‌ها</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{getVal("cardOpacity") || "100"}%</span>
                </div>
                <input
                  type="range" min="50" max="100"
                  value={getVal("cardOpacity") || "100"}
                  onChange={(e) => { setVal("cardOpacity", e.target.value); document.documentElement.style.setProperty("--card-opacity", e.target.value + "%"); }}
                  className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">افکت شیشه‌ای (Glass)</span>
                <ToggleSwitch
                  checked={getVal("glassEffect") === true}
                  onChange={(v) => { setVal("glassEffect", v); document.documentElement.style.setProperty("--glass-blur", v ? "12px" : "0px"); }}
                />
              </div>
          </div>
      </div>
      
      {/* ── رنگ نوار مرورگر (Theme Color) ── */}
      <div>
        <h4 className="text-sm font-semibold mb-3">رنگ نوار مرورگر</h4>
        <p className="text-xs text-muted-foreground mb-3">رنگ نوار بالای مرورگر در موبایل و نوار تب در دسکتاپ را تغییر دهید (مانند دیجی‌کالا).</p>
        <div className="flex flex-wrap items-center gap-3">
          {["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#000000", "#ffffff", "#1e293b", "#f97316", "#14b8a6"].map((color) => (
            <button
              key={color}
              onClick={() => { setBrowserThemeColor(color); updateBrowserThemeColor(color); toast.success("رنگ نوار مرورگر تغییر کرد."); }}
              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer shadow-sm ${browserThemeColor === color ? "border-primary ring-4 ring-primary/20 scale-110" : "border-border hover:scale-110"}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-medium">رنگ دلخواه:</span>
          <div className="relative">
            <input
              type="color"
              value={browserThemeColor}
              onChange={(e) => { setBrowserThemeColor(e.target.value); updateBrowserThemeColor(e.target.value); }}
              className="w-10 h-10 rounded-xl border border-border cursor-pointer overflow-hidden"
            />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono" dir="ltr">{browserThemeColor}</span>
        </div>
      </div>

      {/* ── دکمه بازگشت ── */}
      <button
        onClick={handleResetDefaults}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
      >
        <RotateCcw className="h-4 w-4" /> بازگشت به تنظیمات پیش‌فرض
      </button>
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
