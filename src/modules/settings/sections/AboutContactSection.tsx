import { useState } from "react";
import { useSettings } from "../hooks/use-settings";
import { SaveButton, SectionHeader } from "../components/SettingsUI";
import { Field } from "../components/SettingsUI";

interface StatItem {
  value: string;
  label: string;
}

interface AboutFeature {
  title: string;
  desc: string;
  icon: string;
}

const DEFAULT_STATS: StatItem[] = [
  { value: "۱۰,۰۰۰+", label: "محصول متنوع" },
  { value: "۵۰,۰۰۰+", label: "مشتری راضی" },
  { value: "۹۹.۹٪", label: "رضایت از خدمات" },
  { value: "۲۴/۷", label: "پشتیبانی" },
];

const DEFAULT_FEATURES: AboutFeature[] = [
  { title: "خرید امن", desc: "پرداخت امن و محافظت از اطلاعات شخصی شما", icon: "Shield" },
  { title: "ارسال سریع", desc: "ارسال سریع و مطمئن به سراسر کشور", icon: "Truck" },
  { title: "پشتیبانی ۲۴/۷", desc: "تیم پشتیبانی ما همواره آماده کمک است", icon: "Headphones" },
  { title: "پرداخت آسان", desc: "پرداخت از طریق کلیه کارت‌های بانکی", icon: "CreditCard" },
];

export default function AboutContactSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("about");

  const [aboutTitle, setAboutTitle] = useState(() => String(getVal("aboutTitle") || "داستان ما"));
  const [aboutStory, setAboutStory] = useState(() => String(getVal("aboutStory") || "فروشگاه اینترنتی هوشمند با تجربه خریدی ساده، سریع و لذت‌بخش."));
  const [aboutStory2, setAboutStory2] = useState(() => String(getVal("aboutStory2") || "تیم ما متشکل از متخصصان حوزه فناوری و تجارت الکترونیک است."));
  const [stats, setStats] = useState<StatItem[]>(() => {
    const v = getVal("aboutStats");
    return Array.isArray(v) ? v : DEFAULT_STATS;
  });
  const [features, setFeatures] = useState<AboutFeature[]>(() => {
    const v = getVal("aboutFeatures");
    return Array.isArray(v) ? v : DEFAULT_FEATURES;
  });
  const [contactWorkingHours, setContactWorkingHours] = useState(() => String(getVal("contactWorkingHours") || "شنبه تا پنج‌شنبه ۹ تا ۱۸"));

  const updateStat = (idx: number, field: keyof StatItem, value: string) => {
    setStats((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const updateFeature = (idx: number, field: keyof AboutFeature, value: string) => {
    setFeatures((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    setVal("aboutTitle", aboutTitle);
    setVal("aboutStory", aboutStory);
    setVal("aboutStory2", aboutStory2);
    setVal("aboutStats", stats);
    setVal("aboutFeatures", features);
    setVal("contactWorkingHours", contactWorkingHours);
    setTimeout(() => handleSaveAll(), 100);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="صفحه درباره ما و تماس با ما"
        description="محتوای صفحات درباره ما و تماس با ما را مدیریت کنید."
        gradient="from-blue-50 to-indigo-50 border-blue-100"
      />

      {/* About Page */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">صفحه درباره ما</h3>
        <Field label="عنوان داستان" value={aboutTitle} onChange={setAboutTitle} placeholder="داستان ما" />
        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">پاراگراف اول</label>
          <textarea value={aboutStory} onChange={(e) => setAboutStory(e.target.value)} rows={3} className="clay-input w-full p-2.5 text-sm outline-none resize-none" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">پاراگراف دوم</label>
          <textarea value={aboutStory2} onChange={(e) => setAboutStory2(e.target.value)} rows={3} className="clay-input w-full p-2.5 text-sm outline-none resize-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">آمار و ارقام</h3>
        {stats.map((s, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input value={s.value} onChange={(e) => updateStat(idx, "value", e.target.value)} className="clay-input w-32 p-2 text-sm outline-none" placeholder="مقدار" />
            <input value={s.label} onChange={(e) => updateStat(idx, "label", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="برچسب" />
            <button onClick={() => setStats((p) => p.filter((_, i) => i !== idx))} className="text-destructive text-xs hover:underline">حذف</button>
          </div>
        ))}
        <button onClick={() => setStats((p) => [...p, { value: "جدید", label: "آمار جدید" }])} className="text-xs text-primary hover:underline">+ افزودن آمار</button>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">ویژگی‌های صفحه درباره</h3>
        {features.map((f, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={f.title} onChange={(e) => updateFeature(idx, "title", e.target.value)} className="clay-input p-2 text-sm outline-none" placeholder="عنوان" />
            <input value={f.desc} onChange={(e) => updateFeature(idx, "desc", e.target.value)} className="clay-input p-2 text-sm outline-none" placeholder="توضیح" />
            <div className="flex items-center gap-2">
              <input value={f.icon} onChange={(e) => updateFeature(idx, "icon", e.target.value)} className="clay-input flex-1 p-2 text-sm outline-none" placeholder="Shield" />
              <button onClick={() => setFeatures((p) => p.filter((_, i) => i !== idx))} className="text-destructive text-xs hover:underline">حذف</button>
            </div>
          </div>
        ))}
        <button onClick={() => setFeatures((p) => [...p, { title: "ویژگی جدید", desc: "توضیحات", icon: "Star" }])} className="text-xs text-primary hover:underline">+ افزودن ویژگی</button>
      </div>

      {/* Contact Page */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">صفحه تماس با ما</h3>
        <Field label="ساعات کاری" value={contactWorkingHours} onChange={setContactWorkingHours} placeholder="شنبه تا پنج‌شنبه ۹ تا ۱۸" />
      </div>

      <SaveButton onClick={handleSave} loading={isSaving} />
    </div>
  );
}
