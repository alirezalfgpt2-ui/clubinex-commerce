/**
 * ➕ صفحه ایجاد محصول جدید
 * — کارت مرکزی در وسط صفحه
 * — اسلاگ خودکار از نام فارسی/انگلیسی
 * — اسلاگ الزامی
 * — ورودی برچسب‌ها به صورت چیپ (TagInput)
 * — دکمه‌های کاربرپسند
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Save, ArrowRight, Send, EyeOff, Copy, Sparkles } from "lucide-react";
import { SearchableSelect } from "@/modules/shared/ui/SearchableSelect";
import { ImageUpload, ImageItem } from "@/modules/shared/ui/ImageUpload";
import { TagInput } from "@/components/ui/TagInput";

/** تولید اسلاگ از متن فارسی یا انگلیسی */
function autoSlug(fa: string, en: string): string {
  const source = en || fa;
  return source
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

export default function ProductFormPage() {
  const categories = useQuery(api.categories.listActive);
  const createProduct = useMutation(api.products.create);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(0);
  const [stockAlert, setStockAlert] = useState(5);
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);
  const [features, setFeatures] = useState<Record<string, string>>({});
  const [trustBadges, setTrustBadges] = useState<{icon: string, label: string, desc: string}[]>([
    { icon: "Truck", label: "ارسال سریع", desc: "۱-۳ روز کاری" },
    { icon: "Shield", label: "ضمانت اصالت", desc: "۱۰۰٪ اورجینال" },
    { icon: "RotateCcw", label: "گارانتی بازگشت", desc: "۷ روز ضمانت" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // اسلاگ خودکار (فقط اگر کاربر تغییر نداده باشد)
  const computedSlug = slugTouched ? slug : autoSlug(name, nameEn);
  const selectedCategory = categories?.find((c: any) => c._id === categoryId);
  const availableFeatures: { key: string; label: string }[] = selectedCategory?.features || [];
  const categoryOptions = categories?.map((c: any) => ({ value: c._id, label: c.name })) || [];

  const handleSubmit = async (publish: boolean) => {
    const finalSlug = computedSlug || autoSlug(name, nameEn);
    if (!name || !categoryId) { toast.error("نام محصول و دسته‌بندی الزامی است."); return; }
    if (!finalSlug) { toast.error("اسلاگ الزامی است. لطفاً نام محصول را وارد کنید."); return; }
    setIsLoading(true);
    try {
      await createProduct({
        name, englishName: nameEn || undefined, slug: finalSlug, description: description || `${name} - ${nameEn}`,
        shortDescription: shortDescription || undefined,
        price, salePrice: salePrice || undefined,
        stock, stockAlert, categoryId: categoryId as any,
        tags, brand: brand || undefined, isFeatured, isActive: publish,
        images: productImages.map((img) => img.url),
        features: Object.keys(features).length > 0 ? features : undefined,
        trustBadges: trustBadges.length > 0 ? trustBadges : undefined,
      });
      toast.success(publish ? "محصول با موفقیت منتشر شد." : "محصول به عنوان پیش‌نویس ذخیره شد.");
      if (publish) {
        navigate("/dashboard/products");
      } else {
        navigate(`/dashboard/products/edit/${finalSlug}`);
      }
    } catch (error: any) { toast.error(error.message || "خطا در ایجاد محصول."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-5">
        <h1 className="text-2xl font-bold tracking-tight">افزودن محصول جدید</h1>

        <div className="clay-card p-6 space-y-5">
          {/* ── اطلاعات پایه ── */}
          <SectionTitle icon={<Sparkles className="h-4 w-4" />} title="اطلاعات پایه" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="نام محصول (فارسی)" required>
              <input value={name} onChange={(e) => setName(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="نام کامل محصول" />
            </Field>
            <Field label="نام محصول (انگلیسی)">
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="Product English Name" dir="ltr" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسلاگ (URL اختصاصی)" required hint={slugTouched ? undefined : "خودکار از نام تولید می‌شود"}>
              <input
                value={computedSlug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                className="clay-input w-full p-3 text-sm outline-none"
                placeholder="product-slug"
                dir="ltr"
                required
              />
            </Field>
            <Field label="توضیح کوتاه">
              <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="یک جمله کوتاه..." />
            </Field>
          </div>

          <Field label="توضیحات کامل">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="clay-input w-full p-3 text-sm outline-none min-h-[100px]" placeholder="توضیحات جامع محصول..." />
          </Field>

          {/* ── قیمت و موجودی ── */}
          <SectionTitle title="قیمت و موجودی" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="قیمت (تومان)" required>
              <input type="number" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" min={0} />
            </Field>
            <Field label="قیمت ویژه">
              <input type="number" value={salePrice || ""} onChange={(e) => setSalePrice(Number(e.target.value) || undefined)} className="clay-input w-full p-3 text-sm outline-none" min={0} />
            </Field>
            <Field label="موجودی انبار" required>
              <input type="number" value={stock || ""} onChange={(e) => setStock(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" min={0} />
            </Field>
            <Field label="آستانه هشدار">
              <input type="number" value={stockAlert || ""} onChange={(e) => setStockAlert(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" min={0} />
            </Field>
          </div>

          {/* ── دسته‌بندی و برند ── */}
          <SectionTitle title="دسته‌بندی و برند" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="دسته‌بندی" required>
              <SearchableSelect options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder="انتخاب دسته‌بندی" searchPlaceholder="جستجو..." />
            </Field>
            <Field label="برند / سازنده">
              <BrandSelect value={brand} onChange={setBrand} />
            </Field>
          </div>

          {/* ── ویژگی‌های داینامیک ── */}
          {availableFeatures.length > 0 && (
            <div className="clay-surface p-4 space-y-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground">ویژگی‌های «{selectedCategory?.name}»</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFeatures.map((feat) => (
                  <div key={feat.key}>
                    <label className="text-[11px] text-muted-foreground mb-0.5 block">{feat.label}</label>
                    <input value={features[feat.key] || ""} onChange={(e) => setFeatures({ ...features, [feat.key]: e.target.value })} className="clay-input w-full px-3 py-2 text-xs outline-none" placeholder={feat.label} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── برچسب‌ها ── */}
          <SectionTitle title="برچسب‌ها" />
          <TagInput value={tags} onChange={setTags} placeholder="تگ را تایپ کنید و اینتر بزنید..." />

          {/* ── تصاویر ── */}
          <SectionTitle title="تصاویر محصول" />
          <ImageUpload images={productImages} onChange={setProductImages} maxImages={10} maxSizeMB={5} />

          {/* ── نشان‌های اعتماد (ویژگی‌های برجسته) ── */}
          <SectionTitle title="نشان‌های اعتماد (مزایای محصول)" />
          <div className="space-y-3">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 items-start sm:items-center">
                <input
                  value={badge.icon}
                  onChange={(e) => {
                    const newB = [...trustBadges];
                    newB[index].icon = e.target.value;
                    setTrustBadges(newB);
                  }}
                  className="clay-input w-full sm:w-1/4 p-2 text-xs outline-none"
                  placeholder="آیکون (Lucide) مثل Truck"
                />
                <input
                  value={badge.label}
                  onChange={(e) => {
                    const newB = [...trustBadges];
                    newB[index].label = e.target.value;
                    setTrustBadges(newB);
                  }}
                  className="clay-input w-full sm:w-1/4 p-2 text-xs outline-none font-medium"
                  placeholder="عنوان (مثل: ارسال سریع)"
                />
                <input
                  value={badge.desc}
                  onChange={(e) => {
                    const newB = [...trustBadges];
                    newB[index].desc = e.target.value;
                    setTrustBadges(newB);
                  }}
                  className="clay-input w-full sm:w-1/2 p-2 text-xs outline-none"
                  placeholder="توضیح کوتاه"
                />
                <button
                  type="button"
                  onClick={() => setTrustBadges(trustBadges.filter((_, i) => i !== index))}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                >
                  حذف
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTrustBadges([...trustBadges, { icon: "CheckCircle", label: "ویژگی جدید", desc: "توضیحات" }])}
              className="text-xs font-semibold text-primary px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              + افزودن نشان جدید
            </button>
          </div>

          {/* ── تنظیمات نمایش ── */}
          <SectionTitle title="تنظیمات نمایش" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-primary" />
            <span className="text-sm font-medium">نمایش در بخش محصولات ویژه صفحه اصلی</span>
          </label>

          {/* ── دکمه‌ها ── */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <button onClick={() => handleSubmit(false)} disabled={isLoading} className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50">
              <EyeOff className="h-4 w-4" /> ذخیره پیش‌نویس
            </button>
            <button onClick={() => handleSubmit(true)} disabled={isLoading} className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
              <Send className="h-4 w-4" /> انتشار و فعال‌سازی
            </button>
            <Link to="/dashboard/products" className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm bg-muted text-foreground">
              <ArrowRight className="h-4 w-4" /> بازگشت
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ── Helper Components ── */
function SectionTitle({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-border/50">
      {icon && <span className="text-primary">{icon}</span>}
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/60 mt-1">{hint}</p>}
    </div>
  );
}

function BrandSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const brands = useQuery(api.brands.listActive);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = (brands || []).filter((b: any) => b.isActive !== false);
  const filtered = search.trim()
    ? options.filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase()))
    : options;
  const selectedLabel = options.find((b: any) => b.name === value)?.name || "";

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="clay-input w-full p-3 text-sm text-right flex items-center justify-between">
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{selectedLabel || "انتخاب برند (اختیاری)"}</span>
        <div className="flex items-center gap-2">
          {value && <span onClick={(e) => { e.stopPropagation(); onChange(""); setOpen(false); }} className="text-muted-foreground hover:text-foreground cursor-pointer text-xs">✕</span>}
        </div>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی برند..." className="w-full h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border-0 px-3 text-xs outline-none" autoFocus />
          </div>
          <div className="overflow-y-auto max-h-48 py-1">
            <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch(""); }} className="w-full text-right px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">بدون برند</button>
            {filtered.map((b: any) => (
              <button key={b._id} type="button" onClick={() => { onChange(b.name); setOpen(false); setSearch(""); }} className={`w-full text-right px-3 py-2 text-sm hover:bg-primary/5 transition-colors ${value === b.name ? "bg-primary/10 text-primary font-semibold" : ""}`}>{b.name}</button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground text-center">برندی یافت نشد</p>}
          </div>
        </div>
      )}
    </div>
  );
}
