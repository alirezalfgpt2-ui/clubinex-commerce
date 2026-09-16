/**
 * 🎯 تنظیمات بخش‌های داینامیک محصولات صفحه اصلی
 * — محصولات ویژه (Featured)
 * — فروش ویژه تایمردار (Flash Sale)
 * — پرفروش‌ها (Best Sellers)
 * — جدیدترین‌ها (Newest)
 * — اسلایدر محصولات
 * — پیشنهاد شگفت‌انگیز
 */
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Save, X, Plus, Clock, Star, TrendingUp, Sparkles, Image } from "lucide-react";

interface SectionConfig {
  title: string;
  subtitle: string;
  productIds: string[];
  limit: number;
  showTimer: boolean;
  isActive: boolean;
}

const DEFAULT_SECTIONS: Record<string, SectionConfig> = {
  featured: {
    title: "محصولات ویژه",
    subtitle: "مجموعه‌ای از بهترین محصولات ما",
    productIds: [],
    limit: 8,
    showTimer: false,
    isActive: true,
  },
  flashSale: {
    title: "پیشنهاد ویژه و شگفت‌انگیز",
    subtitle: "فقط تا پایان امروز!",
    productIds: [],
    limit: 6,
    showTimer: true,
    isActive: true,
  },
  bestSellers: {
    title: "پرفروش‌ترین‌ها",
    subtitle: "محصولات محبوب مشتریان",
    productIds: [],
    limit: 8,
    showTimer: false,
    isActive: true,
  },
  newest: {
    title: "جدیدترین محصولات",
    subtitle: "تازه‌های فروشگاه",
    productIds: [],
    limit: 8,
    showTimer: false,
    isActive: true,
  },
  slider: {
    title: "اسلایدر محصولات",
    subtitle: "محصولات برتر در اسلایدر",
    productIds: [],
    limit: 5,
    showTimer: false,
    isActive: true,
  },
  amazingDeals: {
    title: "پیشنهاد شگفت‌انگیز",
    subtitle: "بهترین قیمت‌ها با بیشترین تخفیف",
    productIds: [],
    limit: 8,
    showTimer: false,
    isActive: true,
  },
};

const SECTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  featured: { label: "محصولات ویژه", icon: <Star className="h-4 w-4" />, color: "text-amber-500" },
  flashSale: { label: "فروش ویژه تایمردار", icon: <Clock className="h-4 w-4" />, color: "text-rose-500" },
  bestSellers: { label: "پرفروش‌ها", icon: <TrendingUp className="h-4 w-4" />, color: "text-emerald-500" },
  newest: { label: "جدیدترین‌ها", icon: <Sparkles className="h-4 w-4" />, color: "text-blue-500" },
  slider: { label: "اسلایدر محصولات", icon: <Image className="h-4 w-4" />, color: "text-purple-500" },
  amazingDeals: { label: "پیشنهاد شگفت‌انگیز", icon: <Sparkles className="h-4 w-4" />, color: "text-orange-500" },
};

export function ProductSectionsSection() {
  const products = useQuery(api.products.listActive);
  const sectionsData = useQuery(api.settings.get, { key: "productSections" });
  const setSetting = useMutation(api.settings.set);

  const [sections, setSections] = useState<Record<string, SectionConfig> | null>(null);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string>("featured");

  // مقداردهی اولیه از دیتابیس
  const currentSections = sections ?? (sectionsData?.value as Record<string, SectionConfig>) ?? DEFAULT_SECTIONS;

  const handleSave = async () => {
    try {
      await setSetting({ key: "productSections", value: currentSections, category: "productSections", isPublic: true });
      setSections(null);
      toast.success("تنظیمات بخش‌های محصولات ذخیره شد.");
    } catch (e: any) {
      toast.error(e?.message || "خطا در ذخیره‌سازی.");
    }
  };

  const updateSection = (key: string, patch: Partial<SectionConfig>) => {
    setSections((prev) => {
      const base = prev ?? (sectionsData?.value as Record<string, SectionConfig>) ?? DEFAULT_SECTIONS;
      return { ...base, [key]: { ...base[key], ...patch } };
    });
  };

  const toggleProduct = (sectionKey: string, productId: string) => {
    const sec = currentSections[sectionKey];
    if (!sec) return;
    const ids = sec.productIds.includes(productId)
      ? sec.productIds.filter((id) => id !== productId)
      : [...sec.productIds, productId];
    updateSection(sectionKey, { productIds: ids });
  };

  // فیلتر محصولات برای جستجو
  const filteredProducts = (products || []).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q);
  });

  const currentSec = currentSections[activeSection] || DEFAULT_SECTIONS[activeSection];

  return (
    <div className="space-y-5">
      {/* ── هدر ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">بخش‌های داینامیک محصولات</h2>
          <p className="text-xs text-muted-foreground mt-0.5">محصولات هر بخش صفحه اصلی را اینجا تنظیم کنید</p>
        </div>
        <button onClick={handleSave} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Save className="h-4 w-4" /> ذخیره تنظیمات
        </button>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* ── سایدبار بخش‌ها ── */}
        <div className="lg:w-56 flex-shrink-0 space-y-1">
          {Object.entries(SECTION_META).map(([key, meta]) => {
            const sec = currentSections[key];
            const count = sec?.productIds?.length || 0;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-right ${activeSection === key ? "bg-primary/10 text-primary font-semibold shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
              >
                <span className={meta.color}>{meta.icon}</span>
                <span className="flex-1">{meta.label}</span>
                {count > 0 && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ── محتوای بخش انتخاب‌شده ── */}
        <div className="flex-1 space-y-4">
          {/* تنظیمات بخش */}
          <div className="clay-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{SECTION_META[activeSection]?.label}</h3>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={currentSec?.isActive ?? true} onChange={(e) => updateSection(activeSection, { isActive: e.target.checked })} className="accent-primary" />
                فعال
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">عنوان بخش</label>
                <input value={currentSec?.title || ""} onChange={(e) => updateSection(activeSection, { title: e.target.value })} className="clay-input w-full px-3 py-2 text-xs outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">زیرعنوان</label>
                <input value={currentSec?.subtitle || ""} onChange={(e) => updateSection(activeSection, { subtitle: e.target.value })} className="clay-input w-full px-3 py-2 text-xs outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">حداکثر نمایش</label>
                <input type="number" value={currentSec?.limit || 8} onChange={(e) => updateSection(activeSection, { limit: Number(e.target.value) })} className="clay-input w-20 px-3 py-2 text-xs outline-none" min={1} max={50} />
              </div>
              {activeSection === "flashSale" && (
                <label className="flex items-center gap-2 text-xs mt-4">
                  <input type="checkbox" checked={currentSec?.showTimer ?? true} onChange={(e) => updateSection(activeSection, { showTimer: e.target.checked })} className="accent-primary" />
                  نمایش تایمر شمارش معکوس
                </label>
              )}
            </div>
          </div>

          {/* انتخاب محصولات */}
          <div className="clay-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold">انتخاب محصولات ({currentSec?.productIds?.length || 0} انتخاب شده)</h4>
              <div className="relative">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی محصول..." className="clay-input h-8 pl-2 pr-6 text-xs outline-none w-48" />
                {search && <button onClick={() => setSearch("")} className="absolute left-1.5 top-1/2 -translate-y-1/2"><X className="h-3 w-3 text-muted-foreground" /></button>}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">محصولی یافت نشد</p>
              ) : (
                filteredProducts.map((p) => {
                  const selected = currentSec?.productIds?.includes(p._id) || false;
                  return (
                    <button
                      key={p._id}
                      onClick={() => toggleProduct(activeSection, p._id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-right transition-all ${selected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent"}`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.price.toLocaleString("fa-IR")} تومان</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selected ? "bg-primary border-primary text-white" : "border-muted-foreground/30"}`}>
                        {selected && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
