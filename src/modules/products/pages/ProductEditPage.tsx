/**
 * ✏️ صفحه ویرایش محصول
 * — کارت مرکزی در وسط صفحه
 * — اسلاگ خودکار از نام
 * — اسلاگ الزامی
 * — ورودی برچسب‌ها به صورت چیپ (TagInput)
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import { Save, ArrowRight, Loader2, Copy, Eye } from "lucide-react";
import { SearchableSelect } from "@/modules/shared/ui/SearchableSelect";
import { ImageUpload, type ImageItem } from "@/modules/shared/ui/ImageUpload";
import { TagInput } from "@/components/ui/TagInput";
import { ProductVariantsCard } from "@/modules/products/components/ProductVariantsCard";

/** تولید اسلاگ از متن */
function autoSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

export default function ProductEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useQuery(api.products.getBySlug, slug ? { slug } : "skip");
  const categories = useQuery(api.categories.listActive);
  const updateProduct = useMutation(api.products.update);
  const duplicateProduct = useMutation(api.products.duplicate);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [newSlug, setNewSlug] = useState("");
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
  const [isActive, setIsActive] = useState(true);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);
  const [features, setFeatures] = useState<Record<string, string>>({});
  const [trustBadges, setTrustBadges] = useState<{icon: string, label: string, desc: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // پر کردن فرم با داده محصول
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setEnglishName(product.englishName || "");
      setNewSlug(product.slug || "");
      setDescription(product.description || "");
      setShortDescription(product.shortDescription || "");
      setPrice(product.price || 0);
      setSalePrice(product.salePrice);
      setStock(product.stock || 0);
      setStockAlert(product.stockAlert || 5);
      setCategoryId(product.categoryId || "");
      setTags(product.tags || []);
      setBrand(product.brand || "");
      setIsFeatured(product.isFeatured || false);
      setIsActive(product.isActive !== false);
      setTrustBadges(product.trustBadges || []);
      setProductImages(
        (product.images || []).map((url) => ({ url, alt: product.name || "", caption: "" }))
      );
      setFeatures(
        product.features
          ? Object.fromEntries(Object.entries(product.features as Record<string, string>).map(([k, v]) => [k, String(v)]))
          : {}
      );
    }
  }, [product]);

  const computedSlug = slugTouched ? newSlug : autoSlug(name);
  const selectedCategory = categories?.find((c: any) => c._id === categoryId);
  const availableFeatures: { key: string; label: string }[] = selectedCategory?.features || [];
  const categoryOptions = categories?.map((c: any) => ({ value: c._id, label: c.name })) || [];

  const handleSubmit = async () => {
    const finalSlug = computedSlug || autoSlug(name);
    if (!name || !categoryId || !product) { toast.error("نام محصول و دسته‌بندی الزامی است."); return; }
    if (!finalSlug) { toast.error("اسلاگ الزامی است."); return; }
    setIsLoading(true);
    try {
      await updateProduct({
        productId: product._id,
        name, englishName: englishName || undefined, slug: finalSlug, description, shortDescription: shortDescription || undefined,
        price, salePrice: salePrice && salePrice > 0 ? salePrice : undefined,
        stock, stockAlert, categoryId: categoryId as any,
        tags, brand: brand || undefined, isFeatured, isActive,
        images: productImages.map((img) => img.url),
        features: Object.keys(features).length > 0 ? features : undefined,
        trustBadges: trustBadges.length > 0 ? trustBadges : undefined,
      });
      toast.success("محصول با موفقیت ویرایش شد.");
      navigate("/dashboard/products");
    } catch (error: any) { toast.error(error.message || "خطا در ویرایش محصول."); }
    finally { setIsLoading(false); }
  };

  const handleDuplicate = async () => {
    if (!product) return;
    try {
      const newId = await duplicateProduct({ productId: product._id });
      toast.success("کپی محصول ایجاد شد.");
      navigate("/dashboard/products");
    } catch (e: any) {
      toast.error(e.message || "خطا در کپی محصول.");
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">در حال بارگذاری محصول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">ویرایش: {product.name}</h1>
          <button onClick={handleDuplicate} className="clay-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
            <Copy className="h-3.5 w-3.5" /> کپی و ایجاد جدید
          </button>
        </div>

        <div className="clay-card p-6 space-y-5">
          {/* ── اطلاعات پایه ── */}
          <SectionTitle title="اطلاعات پایه" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="نام محصول (فارسی)" required>
              <input value={name} onChange={(e) => setName(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="نام کامل محصول" />
            </Field>
            <Field label="نام محصول (انگلیسی)">
              <input value={englishName} onChange={(e) => setEnglishName(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="Product English Name" dir="ltr" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسلاگ (URL)" required hint="خودکار از نام تولید می‌شود">
              <input
                value={computedSlug}
                onChange={(e) => { setNewSlug(e.target.value); setSlugTouched(true); }}
                className="clay-input w-full p-3 text-sm outline-none"
                placeholder="product-slug"
                dir="ltr"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="توضیح کوتاه">
              <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="یک جمله کوتاه..." />
            </Field>
            <Field label="برند / سازنده">
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="نام برند" />
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

          {/* ── دسته‌بندی ── */}
          <SectionTitle title="دسته‌بندی" />
          <Field label="دسته‌بندی" required>
            <SearchableSelect options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder="انتخاب دسته‌بندی" searchPlaceholder="جستجو..." />
          </Field>

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
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-primary" />
              <span className="text-sm font-medium">محصول ویژه</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary" />
              <span className="text-sm font-medium">فعال</span>
            </label>
          </div>
          
          <ProductVariantsCard productId={product._id} />

          {/* ── دکمه‌ها ── */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <button onClick={handleSubmit} disabled={isLoading} className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره تغییرات
            </button>
            <a href={`/products/${product.slug}`} target="_blank" className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90">
              <Eye className="h-4 w-4" /> پیش‌نمایش / مشاهده
            </a>
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
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-border/50">
      <div className="h-1 w-1 rounded-full bg-primary" />
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
