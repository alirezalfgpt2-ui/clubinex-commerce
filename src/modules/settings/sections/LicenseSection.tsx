import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Key } from "lucide-react";
import { SectionHeader } from "../components/SettingsUI";

/** بخش مدیریت لایسنس */
export default function LicenseSection() {
  const licenses = useQuery(api.settings.listLicenses);
  const createLicense = useMutation(api.settings.createLicense);
  const [key, setKey] = useState("");
  const [type, setType] = useState<"monthly" | "yearly" | "permanent">("permanent");

  const handleCreate = async () => {
    if (!key.trim()) return toast.error("کلید را وارد کنید.");
    try {
      await createLicense({
        key: key.trim(),
        type,
        expiryDate: type === "permanent" ? undefined : Date.now() + (type === "monthly" ? 30 : 365) * 86400000,
        isActive: true,
        features: { products: true, orders: true, tickets: true, chat: true, reports: true, emailTemplates: true, bookings: true, brands: true, settings: true, discounts: true, shipping: true, roles: true },
      });
      toast.success("لایسنس ایجاد شد.");
      setKey("");
    } catch {
      toast.error("خطا.");
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="مدیریت لایسنس" description="ایجاد و مدیریت لایسنس‌ها." gradient="from-violet-50 to-indigo-50 border-violet-200/50" />
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm font-medium">ایجاد لایسنس جدید</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="کلید لایسنس" className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none font-mono border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none border-border">
            <option value="permanent">دائمی</option><option value="yearly">سالانه</option><option value="monthly">ماهانه</option>
          </select>
          <button onClick={handleCreate} className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90"><Key className="h-4 w-4" /> ایجاد</button>
        </div>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30"><th className="p-3 text-right text-xs font-medium text-muted-foreground">کلید</th><th className="p-3 text-center text-xs font-medium text-muted-foreground">نوع</th><th className="p-3 text-center text-xs font-medium text-muted-foreground">انقضا</th><th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th></tr></thead>
          <tbody>{(!licenses || licenses.length === 0) ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">لایسنسی نیست.</td></tr> : licenses.map((l: any) => <tr key={l._id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-mono text-xs">{l.key}</td><td className="p-3 text-center text-xs">{l.type === "permanent" ? "دائمی" : l.type === "yearly" ? "سالانه" : "ماهانه"}</td><td className="p-3 text-center text-xs text-muted-foreground">{l.expiryDate ? new Date(l.expiryDate).toLocaleDateString("fa-IR") : "—"}</td><td className="p-3 text-center"><span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${l.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{l.isActive ? "فعال" : "غیرفعال"}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
