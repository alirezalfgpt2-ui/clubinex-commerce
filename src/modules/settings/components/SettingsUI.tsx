import { useState } from "react";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

/* ═══════════════════════════════════════════════════════════════
 *  کامپوننت‌های UI مشترک برای بخش‌های تنظیمات
 *  قابل استفاده مجدد در هر بخش
 * ═══════════════════════════════════════════════════════════════ */

/** فیلد ورودی متنی */
export function Field({ label, placeholder, value, onChange, type = "text", icon: Icon, compact }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ComponentType<{ className?: string }>; compact?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";
  return (
    <div className="group">
      <label className="block text-[11px] font-medium text-muted-foreground mb-1 group-focus-within:text-primary transition-colors">{label}</label>
      <div className={`relative flex items-center rounded-lg border bg-card transition-all duration-200 ${focused ? "border-primary/40 ring-2 ring-primary/10 shadow-sm" : "border-border hover:border-border/80"}`}>
        {Icon && <div className="pr-2 pl-0.5"><Icon className="h-3 w-3 text-muted-foreground/60" /></div>}
        <input type={isPw && !showPw ? "password" : type} value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder} className={`flex-1 bg-transparent ${compact ? "px-2 py-1.5" : "px-2.5 py-2"} text-[13px] outline-none placeholder:text-muted-foreground/40`} />
        {isPw && <button type="button" onClick={() => setShowPw(!showPw)} className="pr-2.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors">{showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>}
      </div>
    </div>
  );
}

/** سوئیچ با لیبل */
export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-card border border-border hover:border-border/80 transition-all">
      <div className="text-right min-w-0"><p className="text-sm font-medium">{label}</p>{description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}</div>
      <ToggleSwitch checked={checked} onChange={() => onChange()} />
    </div>
  );
}

/** لیست انتخابی */
export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border bg-card px-2.5 py-2 text-[13px] outline-none border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "12px center" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/** انتخابگر رنگ */
export function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-lg border border-border cursor-pointer shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">{label}</p>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-[11px] text-muted-foreground bg-transparent outline-none font-mono" />
      </div>
    </div>
  );
}

/** دکمه ذخیره */
export function SaveButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <div className="flex justify-end pt-3 mt-3 border-t border-border/30">
      <button type="button" onClick={onClick} disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        ذخیره تنظیمات
      </button>
    </div>
  );
}

/** هدر بخش با گرادیانت */
export function SectionHeader({ title, description, gradient }: { title: string; description: string; gradient: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br p-5 border ${gradient}`}>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
