import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { SaveButton, SectionHeader } from "../components/SettingsUI";

interface Feature {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

interface Banner {
  gradient: string;
  title: string;
  desc: string;
  badge: string;
}

const DEFAULT_FEATURES: Feature[] = [
  { icon: "Truck", title: "ارسال رایگان", desc: "بالای ۵۰۰ هزار تومان", color: "bg-blue-50 text-blue-600" },
  { icon: "Shield", title: "ضمانت اصالت", desc: "۱۰۰٪ اورجینال", color: "bg-green-50 text-green-600" },
  { icon: "Headphones", title: "پشتیبانی ۲۴/۷", desc: "همیشه در دسترس", color: "bg-purple-50 text-purple-600" },
  { icon: "Zap", title: "ارسال سریع", desc: "۱-۳ روز کاری", color: "bg-amber-50 text-amber-600" },
];

const DEFAULT_BANNERS: Banner[] = [
  { gradient: "from-indigo-600 to-purple-700", title: "کد تخفیف ۱۰٪", desc: "برای خرید اول", badge: "WELCOME10" },
  { gradient: "from-emerald-500 to-teal-600", title: "ارسال رایگان", desc: "بالای ۵۰۰ هزار تومان", badge: "" },
  { gradient: "from-amber-500 to-orange-500", title: "فروش ویژه", desc: "تا ۵۰٪ تخفیف", badge: "" },
];

const ICON_OPTIONS = ["Truck", "Shield", "Headphones", "Zap", "Gift", "TrendingUp", "Star", "Heart", "Clock", "Flame", "ShoppingCart", "Sparkles", "CheckCircle", "Award", "Lock"];

const BANNER_GRADIENTS = [
  "from-indigo-600 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
];

export default function LandingFeaturesSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("landing");
  const storedFeatures = getVal("landingFeatures");
  const storedBanners = getVal("landingBanners");

  const [features, setFeatures] = useState<Feature[]>(() =>
    Array.isArray(storedFeatures) ? storedFeatures : DEFAULT_FEATURES
  );
  const [banners, setBanners] = useState<Banner[]>(() =>
    Array.isArray(storedBanners) ? storedBanners : DEFAULT_BANNERS
  );

  const updateFeature = (idx: number, field: keyof Feature, value: string) => {
    setFeatures((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addFeature = () => {
    setFeatures((prev) => [...prev, { icon: "Star", title: "ویژگی جدید", desc: "توضیحات", color: "bg-gray-50 text-gray-600" }]);
  };

  const updateBanner = (idx: number, field: keyof Banner, value: string) => {
    setBanners((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addBanner = () => {
    setBanners((prev) => [...prev, { gradient: BANNER_GRADIENTS[prev.length % BANNER_GRADIENTS.length], title: "بنر جدید", desc: "توضیحات بنر", badge: "" }]);
  };

  const handleSave = () => {
    setVal("landingFeatures", features);
    setVal("landingBanners", banners);
    setTimeout(() => handleSaveAll(), 100);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="ویژگی‌ها و بنرهای صفحه اصلی"
        description="نوار ویژگی‌ها و بنرهای تبلیغاتی صفحه هوم را مدیریت کنید."
        gradient="from-green-50 to-emerald-50 border-green-100"
      />

      {/* Features */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">نوار ویژگی‌ها</h3>
        {features.map((f, idx) => (
          <div key={idx} className="clay-card p-3 flex items-center gap-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={f.icon}
                onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                className="clay-input p-2 text-sm outline-none"
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
              <input
                value={f.title}
                onChange={(e) => updateFeature(idx, "title", e.target.value)}
                className="clay-input p-2 text-sm outline-none"
                placeholder="عنوان"
              />
              <input
                value={f.desc}
                onChange={(e) => updateFeature(idx, "desc", e.target.value)}
                className="clay-input p-2 text-sm outline-none"
                placeholder="توضیح"
              />
            </div>
            <button onClick={() => setFeatures((p) => p.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button onClick={addFeature} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 w-full justify-center">
          <Plus className="h-3.5 w-3.5" /> افزودن ویژگی
        </button>
      </div>

      {/* Banners */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">بنرهای تبلیغاتی</h3>
        {banners.map((b, idx) => (
          <div key={idx} className="clay-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className={`h-5 w-20 rounded-lg bg-gradient-to-r ${b.gradient}`} />
              <button onClick={() => setBanners((p) => p.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={b.gradient}
                onChange={(e) => updateBanner(idx, "gradient", e.target.value)}
                className="clay-input p-2 text-sm outline-none"
              >
                {BANNER_GRADIENTS.map((g) => (
                  <option key={g} value={g}>{g.replace("from-", "").replace(" to-", " → ")}</option>
                ))}
              </select>
              <input value={b.title} onChange={(e) => updateBanner(idx, "title", e.target.value)} className="clay-input p-2 text-sm outline-none" placeholder="عنوان" />
              <input value={b.desc} onChange={(e) => updateBanner(idx, "desc", e.target.value)} className="clay-input p-2 text-sm outline-none" placeholder="توضیح" />
            </div>
            <input value={b.badge} onChange={(e) => updateBanner(idx, "badge", e.target.value)} className="clay-input p-2 text-sm outline-none w-full" placeholder="کد تخفیف (اختیاری)" />
          </div>
        ))}
        <button onClick={addBanner} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 w-full justify-center">
          <Plus className="h-3.5 w-3.5" /> افزودن بنر
        </button>
      </div>

      <SaveButton onClick={handleSave} loading={isSaving} />
    </div>
  );
}
