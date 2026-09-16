import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import { ArrowRight, Image as ImageIcon, Send, EyeOff, Sparkles, LayoutGrid } from "lucide-react";
import { TagInput } from "@/components/ui/TagInput";

export default function BlogFormPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEdit = !!slug;

  const [title, setTitle] = useState("");
  const [computedSlug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("مدیر سیستم");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(title.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (isEdit) {
      // شبیه‌سازی دریافت اطلاعات مقاله
      setTitle("مقاله تستی جهت ویرایش");
      setSlug("مقاله-تستی-جهت-ویرایش");
      setSlugTouched(true);
      setExcerpt("این یک خلاصه تستی برای ویرایش مقاله است...");
      setContent("محتوای اصلی مقاله برای ویرایش در اینجا قرار می‌گیرد.");
      setCategory("فناوری");
      setTags(["تست", "ویرایش"]);
      setImage("https://picsum.photos/seed/blog/800/400");
    }
  }, [isEdit, slug]);

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim() || !content.trim()) {
      toast.error("عنوان و محتوای مقاله الزامی است");
      return;
    }
    
    setLoading(true);
    // شبیه‌سازی ذخیره‌سازی
    setTimeout(() => {
      if (publish) setStatus("published");
      else setStatus("draft");
      
      setLoading(false);
      toast.success(isEdit ? "مقاله با موفقیت ویرایش شد" : "مقاله با موفقیت ایجاد شد");
      navigate("/dashboard/blog");
    }, 1000);
  };

  return (
    <div className="w-full max-w-3xl space-y-5 pb-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-primary transition-colors">داشبورد</Link>
        <span className="text-muted-foreground/40">/</span>
        <Link to="/dashboard/blog" className="hover:text-primary transition-colors">وبلاگ</Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground font-medium">{isEdit ? "ویرایش مقاله" : "مقاله جدید"}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? "ویرایش مقاله" : "افزودن مقاله جدید"}
      </h1>

      <div className="clay-card p-6 space-y-5">
        {/* ── اطلاعات پایه ── */}
        <SectionTitle icon={<Sparkles className="h-4 w-4" />} title="اطلاعات پایه" />
        
        <Field label="عنوان مقاله" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="clay-input w-full p-3 text-sm outline-none"
            placeholder="مثلا: راهنمای جامع خرید موبایل..."
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="اسلاگ (URL اختصاصی)" required hint={slugTouched ? undefined : "خودکار از عنوان تولید می‌شود"}>
            <input
              value={computedSlug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              className="clay-input w-full p-3 text-sm outline-none"
              placeholder="post-slug"
              dir="ltr"
              required
            />
          </Field>
          <Field label="نویسنده">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="clay-input w-full p-3 text-sm outline-none"
              placeholder="نام نویسنده"
            />
          </Field>
        </div>

        <Field label="خلاصه (برای نمایش در لیست)">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="clay-input w-full p-3 text-sm outline-none min-h-[60px]"
            placeholder="یک خلاصه کوتاه از مقاله بنویسید..."
          />
        </Field>

        {/* ── محتوا ── */}
        <SectionTitle icon={<LayoutGrid className="h-4 w-4" />} title="محتوای اصلی" />
        <Field label="محتوای کامل مقاله" required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="clay-input w-full p-3 text-sm outline-none min-h-[250px]"
            placeholder="محتوای اصلی مقاله را اینجا بنویسید..."
          />
        </Field>

        {/* ── دسته‌بندی و برچسب‌ها ── */}
        <SectionTitle title="دسته‌بندی و برچسب‌ها" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="دسته‌بندی">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="clay-input w-full p-3 text-sm outline-none"
              placeholder="مثلا: اخبار تکنولوژی"
            />
          </Field>
        </div>
        
        <Field label="برچسب‌ها">
          <TagInput value={tags} onChange={setTags} placeholder="تگ را تایپ کنید و اینتر بزنید..." />
        </Field>

        {/* ── تصاویر ── */}
        <SectionTitle title="تصویر شاخص" />
        <Field label="لینک تصویر">
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="clay-input w-full p-3 text-sm outline-none"
            placeholder="https://..."
            dir="ltr"
          />
        </Field>
        {image ? (
          <div className="mt-4 aspect-video rounded-xl border border-border/50 overflow-hidden w-full max-w-sm">
            <img src={image} alt="پیش‌نمایش" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="mt-4 aspect-video rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground bg-muted/30 w-full max-w-sm">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs">تصویری انتخاب نشده</span>
          </div>
        )}

        {/* ── تنظیمات نمایش ── */}
        <SectionTitle title="تنظیمات نمایش" />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={status === "published"}
              onChange={() => setStatus("published")}
              className="accent-primary"
            />
            <span className="text-sm font-medium">منتشر شده</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={status === "draft"}
              onChange={() => setStatus("draft")}
              className="accent-primary"
            />
            <span className="text-sm font-medium">پیش‌نویس</span>
          </label>
        </div>

        {/* ── دکمه‌ها ── */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
          >
            <EyeOff className="h-4 w-4" /> ذخیره پیش‌نویس
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {isEdit ? "بروزرسانی مقاله" : "انتشار مقاله"}
          </button>
          <Link
            to="/dashboard/blog"
            className="clay-button flex items-center gap-2 px-5 py-2.5 text-sm bg-muted text-foreground hover:bg-muted/80"
          >
            <ArrowRight className="h-4 w-4" /> بازگشت
          </Link>
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
