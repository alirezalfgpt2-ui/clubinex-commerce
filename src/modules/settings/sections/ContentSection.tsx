import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { FileText, Save, Loader2, Eye, Shield, Building2 } from "lucide-react";
import { SectionHeader } from "../components/SettingsUI";
import { useSettings } from "../hooks/use-settings";

const PAGES = [
  { slug: "terms", label: "قوانین و مقررات", icon: "📜" },
  { slug: "privacy", label: "سیاست حفظ حریم خصوصی", icon: "🔒" },
  { slug: "returns", label: "شرایط مرجوعی و استرداد کالا", icon: "📦" },
  { slug: "about", label: "درباره ما", icon: "🏢" },
  { slug: "contact", label: "تماس با ما", icon: "📞" },
];

function RichEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "محتوای صفحه را بنویسید..."} className="w-full min-h-[300px] p-4 text-[13px] leading-relaxed bg-card outline-none resize-y" style={{ direction: "rtl" }} />
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-[10px] text-muted-foreground">
        <span>پشتیبانی از متن ساده</span>
        <span>{value.length} کاراکتر</span>
      </div>
    </div>
  );
}

function PageEditor({ slug, label, icon }: { slug: string; label: string; icon: string }) {
  const page = useQuery(api.contentPages.getBySlug, { slug });
  const upsertPage = useMutation(api.contentPages.upsert);
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (page && !initialized) {
    setTitle(page.title);
    setTitleEn(page.titleEn || "");
    setContent(page.content);
    setContentEn(page.contentEn || "");
    setLastUpdated(page.lastUpdated || "");
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!title.trim()) return toast.error("عنوان را وارد کنید.");
    setIsSaving(true);
    try {
      await upsertPage({ slug, title, titleEn: titleEn || undefined, content, contentEn: contentEn || undefined, lastUpdated: lastUpdated || new Date().toLocaleDateString("fa-IR"), isActive: true });
      toast.success("صفحه ذخیره شد.");
    } catch { toast.error("خطا در ذخیره‌سازی."); } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-lg">{icon}</span><h4 className="text-sm font-semibold">{label}</h4></div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">/{slug}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">عنوان فارسی</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان صفحه..." className="w-full rounded-lg border bg-card px-3 py-2 text-[13px] outline-none border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">عنوان انگلیسی</label>
          <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Page title..." className="w-full rounded-lg border bg-card px-3 py-2 text-[13px] outline-none border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground mb-1">تاریخ آخرین به‌روزرسانی</label>
        <input type="text" value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} placeholder="۱۴۰۳/۰۶/۰۱" className="w-full rounded-lg border bg-card px-3 py-2 text-[13px] outline-none border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground mb-1">محتوای فارسی</label>
        <RichEditor value={content} onChange={setContent} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground mb-1">محتوای انگلیسی</label>
        <RichEditor value={contentEn} onChange={setContentEn} placeholder="English content..." />
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-all disabled:opacity-50">
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} ذخیره {label}
        </button>
      </div>
    </div>
  );
}

function TrustLogosEditor() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("trustLogos");

  const logos = [
    { key: "enamadUrl", label: "لوگوی نماد اعتماد الکترونیکی (اینماد)", desc: "لینک صفحه اینماد فروشگاه", placeholder: "https://trustseminfo.com/...", icon: Shield },
    { key: "enamadImg", label: "تصویر نماد اعتماد", desc: "آدرس تصویر لوگوی اینماد", placeholder: "https://trustseminfo.com/images/enamad.png", icon: Eye },
    { key: "samandehiUrl", label: "لوگوی نماد ساماندهی", desc: "لینک صفحه ساماندهی وزارت ارشاد", placeholder: "https://samandehi.ir/...", icon: Building2 },
    { key: "samandehiImg", label: "تصویر نماد ساماندهی", desc: "آدرس تصویر لوگوی ساماندهی", placeholder: "https://samandehi.ir/images/logo.png", icon: Eye },
    { key: "licenseUrl", label: "مجوز صنفی", desc: "لینک مجوز صنفی", placeholder: "https://...", icon: FileText },
    { key: "licenseImg", label: "تصویر مجوز صنفی", desc: "آدرس تصویر مجوز", placeholder: "https://...", icon: Eye },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">لوگوهای اعتماد و مجوزها</p>
          <p className="text-xs text-muted-foreground">لوگوها در فوتر صفحه اصلی نمایش داده می‌شوند.</p>
        </div>
        <button onClick={handleSaveAll} disabled={isSaving} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره
        </button>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {logos.map((logo) => (
            <div key={logo.key} className="flex items-start gap-3 p-3 rounded-xl border bg-muted/30">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><logo.icon className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-0.5">{logo.label}</p>
                <p className="text-[10px] text-muted-foreground mb-2">{logo.desc}</p>
                <input type="url" value={getVal(logo.key) as string} onChange={(e) => setVal(logo.key, e.target.value)} placeholder={logo.placeholder} className="w-full rounded-lg border bg-card px-3 py-2 text-[12px] outline-none border-border focus:border-primary/40 transition-all font-mono" dir="ltr" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ContentSection() {
  const [activeTab, setActiveTab] = useState<"pages" | "logos">("pages");
  return (
    <div className="space-y-6">
      <SectionHeader title="مدیریت محتوا و صفحات قانونی" description="ویرایش صفحات قوانین، درباره ما، تماس و لوگوهای رسمی." gradient="from-blue-50 to-indigo-50 border-blue-200/50" />
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("pages")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "pages" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}><FileText className="h-4 w-4" /> صفحات</button>
        <button onClick={() => setActiveTab("logos")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "logos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}><Shield className="h-4 w-4" /> لوگوهای رسمی</button>
      </div>
      {activeTab === "pages" && <div className="space-y-4">{PAGES.map((p) => <PageEditor key={p.slug} slug={p.slug} label={p.label} icon={p.icon} />)}</div>}
      {activeTab === "logos" && <TrustLogosEditor />}
    </div>
  );
}
