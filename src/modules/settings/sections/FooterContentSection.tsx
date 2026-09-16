import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { SaveButton, SectionHeader } from "../components/SettingsUI";
import { Field } from "../components/SettingsUI";

interface FooterLink {
  label: string;
  href: string;
}

interface TrustLogo {
  name: string;
  url: string;
  icon: string;
}

const DEFAULT_QUICK_LINKS: FooterLink[] = [
  { label: "فروشگاه", href: "/products" },
  { label: "بلاگ و اخبار", href: "/blog" },
  { label: "مقایسه محصولات", href: "/compare" },
  { label: "ورود / ثبت‌نام", href: "/auth" },
  { label: "پیگیری سفارش", href: "/track-order" },
  { label: "پنل کاربری", href: "/dashboard" },
];

const DEFAULT_POLICY_LINKS: FooterLink[] = [
  { label: "شرایط استفاده", href: "/legal/terms" },
  { label: "حریم خصوصی", href: "/legal/privacy" },
  { label: "شرایط مرجوعی کالا", href: "/legal/return" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

const DEFAULT_TRUST_LOGOS: TrustLogo[] = [
  { name: "نماد اعتماد الکترونیکی", url: "https://trustseminister.ir", icon: "🛡️" },
  { name: "ساماندهی وزارت ارشاد", url: "https://samandehi.ir", icon: "✅" },
  { name: "گواهی SSL امن", url: "", icon: "🔒" },
  { name: "مجوز صنفی", url: "", icon: "📋" },
];

export default function FooterContentSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("footer");

  const [sitePhone, setPhone] = useState(getVal("sitePhone") || "۰۲۱-۱۲۳۴۵۶۷۸");
  const [siteEmail, setEmail] = useState(getVal("siteEmail") || "support@clubinex.com");
  const [siteAddress, setAddress] = useState(getVal("siteAddress") || "تهران، خیابان ولیعصر، پلاک ۱۲۳");
  const [copyright, setCopyright] = useState(() => {
    const v = getVal("footerCopyright");
    return typeof v === "string" ? v : "";
  });

  const [quickLinks, setQuickLinks] = useState<FooterLink[]>(() => {
    const v = getVal("footerQuickLinks");
    return Array.isArray(v) ? v : DEFAULT_QUICK_LINKS;
  });
  const [policyLinks, setPolicyLinks] = useState<FooterLink[]>(() => {
    const v = getVal("footerPolicyLinks");
    return Array.isArray(v) ? v : DEFAULT_POLICY_LINKS;
  });
  const [trustLogos, setTrustLogos] = useState<TrustLogo[]>(() => {
    const v = getVal("footerTrustLogos");
    return Array.isArray(v) ? v : DEFAULT_TRUST_LOGOS;
  });

  const updateLink = (type: "quick" | "policy", idx: number, field: keyof FooterLink, value: string) => {
    const setter = type === "quick" ? setQuickLinks : setPolicyLinks;
    setter((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addLink = (type: "quick" | "policy") => {
    const setter = type === "quick" ? setQuickLinks : setPolicyLinks;
    setter((prev) => [...prev, { label: "لینک جدید", href: "/" }]);
  };

  const updateTrustLogo = (idx: number, field: keyof TrustLogo, value: string) => {
    setTrustLogos((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    setVal("sitePhone", sitePhone);
    setVal("siteEmail", siteEmail);
    setVal("siteAddress", siteAddress);
    setVal("footerCopyright", copyright || `© ${new Date().getFullYear()} تمامی حقوق محفوظ است.`);
    setVal("footerQuickLinks", quickLinks);
    setVal("footerPolicyLinks", policyLinks);
    setVal("footerTrustLogos", trustLogos);
    setTimeout(() => handleSaveAll(), 100);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="فوتر و اطلاعات تماس"
        description="اطلاعات تماس، لینک‌های سریع، لینک‌های قانونی و نمادهای اعتماد فوتر را مدیریت کنید."
        gradient="from-gray-50 to-slate-50 border-gray-100"
      />

      {/* Contact Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">اطلاعات تماس</h3>
        <Field label="تلفن" value={sitePhone} onChange={setPhone} placeholder="۰۲۱-۱۲۳۴۵۶۷۸" />
        <Field label="ایمیل" value={siteEmail} onChange={setEmail} placeholder="support@example.com" />
        <Field label="آدرس" value={siteAddress} onChange={setAddress} placeholder="آدرس فروشگاه" />
        <Field label="متن کپی‌رایت" value={copyright} onChange={setCopyright} placeholder="© ۱۴۰۵ نام فروشگاه. تمامی حقوق محفوظ است." />
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">لینک‌های سریع فوتر</h3>
        {quickLinks.map((link, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input value={link.label} onChange={(e) => updateLink("quick", idx, "label", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="عنوان" />
            <input value={link.href} onChange={(e) => updateLink("quick", idx, "href", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="/path" dir="ltr" />
            <button onClick={() => setQuickLinks((p) => p.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button onClick={() => addLink("quick")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-xs hover:bg-primary/5">
          <Plus className="h-3 w-3" /> افزودن لینک
        </button>
      </div>

      {/* Policy Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">لینک‌های قانونی</h3>
        {policyLinks.map((link, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input value={link.label} onChange={(e) => updateLink("policy", idx, "label", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="عنوان" />
            <input value={link.href} onChange={(e) => updateLink("policy", idx, "href", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="/path" dir="ltr" />
            <button onClick={() => setPolicyLinks((p) => p.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button onClick={() => addLink("policy")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-xs hover:bg-primary/5">
          <Plus className="h-3 w-3" /> افزودن لینک
        </button>
      </div>

      {/* Trust Logos */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">نمادهای اعتماد</h3>
        {trustLogos.map((logo, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xl">{logo.icon}</span>
            <input value={logo.name} onChange={(e) => updateTrustLogo(idx, "name", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="نام نماد" />
            <input value={logo.url} onChange={(e) => updateTrustLogo(idx, "url", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="https://..." dir="ltr" />
            <button onClick={() => setTrustLogos((p) => p.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button onClick={() => setTrustLogos((p) => [...p, { name: "نماد جدید", url: "", icon: "⭐" }])} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-xs hover:bg-primary/5">
          <Plus className="h-3 w-3" /> افزودن نماد
        </button>
      </div>

      <SaveButton onClick={handleSave} loading={isSaving} />
    </div>
  );
}
