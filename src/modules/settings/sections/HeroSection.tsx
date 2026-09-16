import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { SaveButton, SectionHeader } from "../components/SettingsUI";

interface Slide {
  badge: string;
  title: string;
  highlight: string;
  desc: string;
  btnPrimary: string;
  btnSecondary: string;
  gradient: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    badge: "فروش ویژه تا ۵۰٪ تخفیف",
    title: "خرید هوشمند،",
    highlight: "زندگی آسان‌تر",
    desc: "هزاران محصول متنوع با بهترین قیمت‌ها، ارسال سریع به سراسر کشور و ضمانت اصالت کالا.",
    btnPrimary: "شروع خرید",
    btnSecondary: "مشاهده تخفیف‌ها",
    gradient: "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]",
  },
  {
    badge: "ارسال رایگان بالای ۵۰۰ هزار تومان",
    title: "کیفیت تضمینی،",
    highlight: "ارسال سریع",
    desc: "محصولات اورجینال با ضمانت بازگشت ۷ روزه. خریدی مطمئن و لذت‌بخش.",
    btnPrimary: "مشاهده محصولات",
    btnSecondary: "درباره ما",
    gradient: "from-[#0ea5e9] via-[#06b6d4] to-[#14b8a6]",
  },
  {
    badge: "تا ۵۰٪ تخفیف روی محصولات منتخب",
    title: "فروش ویژه،",
    highlight: "فرصت محدود",
    desc: "فرصت استثنایی خرید محصولات پرفروش با قیمت‌های باورنکردنی.",
    btnPrimary: "مشاهده فروش ویژه",
    btnSecondary: "مشاهده همه",
    gradient: "from-[#f43f5e] via-[#e11d48] to-[#be123c]",
  },
];

const GRADIENT_OPTIONS = [
  "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]",
  "from-[#0ea5e9] via-[#06b6d4] to-[#14b8a6]",
  "from-[#f43f5e] via-[#e11d48] to-[#be123c]",
  "from-[#f59e0b] via-[#eab308] to-[#facc15]",
  "from-[#10b981] via-[#059669] to-[#047857]",
  "from-[#ec4899] via-[#d946ef] to-[#a855f7]",
  "from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]",
  "from-[#f97316] via-[#ea580c] to-[#c2410c]",
];

export default function HeroSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("hero");
  const stored = getVal("heroSlides");
  const [slides, setSlides] = useState<Slide[]>(() => {
    if (Array.isArray(stored)) return stored;
    return DEFAULT_SLIDES;
  });

  const updateSlide = (idx: number, field: keyof Slide, value: string) => {
    setSlides((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        badge: "اسلاید جدید",
        title: "عنوان",
        highlight: "هایلایت",
        desc: "توضیحات اسلاید",
        btnPrimary: "دکمه اصلی",
        btnSecondary: "دکمه فرعی",
        gradient: GRADIENT_OPTIONS[slides.length % GRADIENT_OPTIONS.length],
      },
    ]);
  };

  const removeSlide = (idx: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    setSlides((prev) => {
      const next = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const handleSave = () => {
    setVal("heroSlides", slides);
    setTimeout(() => handleSaveAll(), 100);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="اسلایدر اصلی صفحه هوم"
        description="اسلایدهای هیرو صفحه اصلی را مدیریت کنید. هر اسلاید یک بخش تبلیغاتی با گرادیان رنگی است."
        gradient="from-purple-50 to-pink-50 border-purple-100"
      />

      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <div key={idx} className="clay-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground">
                  اسلاید {idx + 1}
                </span>
                <div
                  className={`h-6 w-16 rounded-lg bg-gradient-to-r ${slide.gradient}`}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSlide(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSlide(idx, 1)}
                  disabled={idx === slides.length - 1}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 text-xs"
                >
                  ▼
                </button>
                <button
                  onClick={() => removeSlide(idx)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  بج (بالای عنوان)
                </label>
                <input
                  value={slide.badge}
                  onChange={(e) => updateSlide(idx, "badge", e.target.value)}
                  className="clay-input w-full p-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  عنوان اصلی
                </label>
                <input
                  value={slide.title}
                  onChange={(e) => updateSlide(idx, "title", e.target.value)}
                  className="clay-input w-full p-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  هایلایت (رنگی)
                </label>
                <input
                  value={slide.highlight}
                  onChange={(e) =>
                    updateSlide(idx, "highlight", e.target.value)
                  }
                  className="clay-input w-full p-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  گرادیان رنگی
                </label>
                <select
                  value={slide.gradient}
                  onChange={(e) =>
                    updateSlide(idx, "gradient", e.target.value)
                  }
                  className="clay-input w-full p-2.5 text-sm outline-none"
                >
                  {GRADIENT_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g.replace("from-[", "").replace("] via-", " → ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                توضیحات
              </label>
              <textarea
                value={slide.desc}
                onChange={(e) => updateSlide(idx, "desc", e.target.value)}
                rows={2}
                className="clay-input w-full p-2.5 text-sm outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  متن دکمه اصلی
                </label>
                <input
                  value={slide.btnPrimary}
                  onChange={(e) =>
                    updateSlide(idx, "btnPrimary", e.target.value)
                  }
                  className="clay-input w-full p-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  متن دکمه فرعی
                </label>
                <input
                  value={slide.btnSecondary}
                  onChange={(e) =>
                    updateSlide(idx, "btnSecondary", e.target.value)
                  }
                  className="clay-input w-full p-2.5 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSlide}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        افزودن اسلاید جدید
      </button>

      <SaveButton onClick={handleSave} loading={isSaving} />
    </div>
  );
}
