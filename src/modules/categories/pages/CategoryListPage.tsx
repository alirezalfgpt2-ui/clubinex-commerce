import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Layers, Plus, Edit3, Trash2, ChevronRight, ChevronDown, FolderOpen, Upload, X } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  level: number;
  order: number;
  isActive: boolean;
}

function CategoryTreeItem({
  category,
  allCategories,
  depth = 0,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  category: Category;
  allCategories: Category[];
  depth?: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}) {
  const children = allCategories.filter((c) => c.parentId === category._id);
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(category._id);

  return (
    <div>
      <div
        className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all hover:bg-muted/50 group`}
        style={{ paddingRight: `${depth * 2.5 + 1}rem` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={() => hasChildren && onToggle(category._id)}
          className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors shrink-0 ${
            hasChildren ? "text-foreground hover:bg-muted" : "text-transparent"
          }`}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Category image */}
        {category.image && (
          <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted shrink-0">
            <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{category.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">/{category.slug}</span>
            {hasChildren && (
              <span className="text-[10px] text-primary font-medium">{children.length} زیرمجموعه</span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${category.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {category.isActive ? "فعال" : "غیرفعال"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleActive(category._id)}
            className={`flex h-7 items-center gap-1 px-2 rounded-lg text-[10px] font-medium transition-all border ${
              category.isActive
                ? "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                : "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
            }`}
            title={category.isActive ? "غیرفعال کردن" : "فعال کردن"}
          >
            {category.isActive ? "🟢 فعال" : "🔴 غیرفعال"}
          </button>
          <button onClick={() => onEdit(category)} className="clay-icon flex h-7 w-7 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors">
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(category._id)} className="clay-icon flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div className="space-y-0.5">
          {children
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <CategoryTreeItem
                key={child._id}
                category={child}
                allCategories={allCategories}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryListPage() {
  const categories = useQuery(api.categories.list);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);
  const toggleCategoryActive = useMutation(api.categories.toggleActive);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", parentId: "", isActive: true, features: "", image: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.categories.generateUploadUrl);
  const [uploading, setUploading] = useState(false);

  const rootCategories = (categories || []).filter((c: Category) => !c.parentId).sort((a: Category, b: Category) => a.order - b.order);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set((categories || []).map((c: Category) => c._id));
    setExpanded(allIds);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("نام دسته‌بندی الزامی است."); return; }
    try {
      if (editCat) {
        const parsedFeatures = form.features ? form.features.split(",").map((f) => { const [k, ...l] = f.trim().split(":"); return { key: k?.trim() || "", label: l.join(":").trim() || k?.trim() || "" }; }).filter((f) => f.key) : undefined;
        await updateCategory({ categoryId: editCat._id as any, name: form.name, slug: form.slug, description: form.description || undefined, features: parsedFeatures, image: form.image || undefined } as any);
        toast.success("دسته‌بندی بروزرسانی شد.");
      } else {
        const level = form.parentId ? (categories?.find((c: Category) => c._id === form.parentId)?.level ?? 0) + 1 : 0;
        const parsedFeatures = form.features ? form.features.split(",").map((f) => { const [k, ...l] = f.trim().split(":"); return { key: k?.trim() || "", label: l.join(":").trim() || k?.trim() || "" }; }).filter((f) => f.key) : undefined;
        await createCategory({ name: form.name, slug: form.slug || undefined, description: form.description || undefined, parentId: (form.parentId || undefined) as any, order: categories?.length || 0, features: parsedFeatures, image: form.image || undefined } as any);
        toast.success("دسته‌بندی جدید ایجاد شد.");
      }
      setShowForm(false);
      setEditCat(null);
      setForm({ name: "", slug: "", description: "", parentId: "", isActive: true, features: "", image: "" });
    } catch { toast.error("خطا در ذخیره‌سازی."); }
  };

  const handleEdit = (cat: any) => {
    setEditCat(cat);
    const feats = (cat.features || []).map((f: any) => `${f.key}:${f.label}`).join(", ");
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", parentId: cat.parentId || "", isActive: cat.isActive, features: feats, image: (cat as any).image || "" });
    setShowForm(true);
  };

  const confirmDialog = useConfirm();
  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف دسته‌بندی", message: "آیا از حذف این دسته‌بندی مطمئن هستید؟", variant: "danger" })) return;
    try {        await deleteCategory({ categoryId: id as any }); toast.success("حذف شد."); }
    catch { toast.error("خطا در حذف."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">دسته‌بندی‌ها</h1>
          <p className="text-sm text-muted-foreground mt-0.5">مدیریت ساختار درختی دسته‌بندی محصولات</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="clay-button px-4 py-2 text-xs font-semibold">باز کردن همه</button>
          <button onClick={() => { setEditCat(null); setForm({ name: "", slug: "", description: "", parentId: "", isActive: true, features: "", image: "" }); setShowForm(true); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> دسته جدید
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="clay-card p-6 animate-slide-up space-y-4">
          <h3 className="font-semibold">{editCat ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">نام</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">اسلاگ</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">دسته والد</label>
              <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="clay-input w-full p-3 text-sm outline-none">
                <option value="">— بدون والد (ریشه) —</option>
                {(categories || []).map((c: Category) => (
                  <option key={c._id} value={c._id}>{`${"—".repeat(c.level)} ${c.name}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">توضیحات</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">تصویر دسته‌بندی</label>
              <div className="flex gap-3 items-start">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const uploadUrl = await generateUploadUrl();
                    const result = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
                    const { storageId } = await result.json();
                    const url = `https://${import.meta.env.VITE_CONVEX_URL?.replace("https://", "").replace(".convex.cloud", "")}.convex.site/api/storage/${storageId}`;
                    setForm({ ...form, image: url });
                    toast.success("تصویر آپلود شد.");
                  } catch { toast.error("خطا در آپلود تصویر."); }
                  setUploading(false);
                  e.target.value = "";
                }} />
                {form.image ? (
                  <div className="relative">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border">
                      <img src={form.image} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                    </div>
                    <button onClick={() => setForm({ ...form, image: "" })} className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">{uploading ? "آپلود..." : "انتخاب"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">ویژگی‌های اختصاصی این دسته (فرمت: key:عنوان, key:عنوان)</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="ram:RAM (گیگابایت), camera:دوربین (مگاپیکسل)" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" />
            <p className="text-[10px] text-muted-foreground mt-1">این ویژگی‌ها هنگام افزودن محصول در این دسته نمایش داده می‌شوند.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="clay-button px-6 py-2 text-sm font-semibold">{editCat ? "بروزرسانی" : "ایجاد"}</button>
            <button onClick={() => { setShowForm(false); setEditCat(null); }} className="clay-surface px-6 py-2 text-sm font-medium hover:bg-muted transition-colors">انصراف</button>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="clay-card p-2">
        {rootCategories.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>هنوز دسته‌بندی ایجاد نشده است.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {rootCategories.map((cat: Category) => (
              <CategoryTreeItem
                key={cat._id}
                category={cat}
                allCategories={categories || []}
                expanded={expanded}
                onToggle={toggleExpand}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={(id) => toggleCategoryActive({ categoryId: id as any })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
