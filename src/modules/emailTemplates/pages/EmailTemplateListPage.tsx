/**
 * 📧 صفحه مدیریت قالب‌های ایمیل
 * — مشاهده، ایجاد، ویرایش و حذف قالب‌های ایمیل
 * — قالب‌ها بر اساس نوع (order, welcome, newsletter و...) دسته‌بندی می‌شوند
 * — پیش‌نمایش قالب و ویرایش HTML
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Mail, Plus, Pencil, Trash2, Search, Loader2, Copy, Eye, X } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_TYPES = [
  { value: "order", label: "سفارش" },
  { value: "welcome", label: "خوش‌آمدگویی" },
  { value: "newsletter", label: "خبرنامه" },
  { value: "password_reset", label: "بازیابی رمز" },
  { value: "shipping", label: "ارسال" },
  { value: "payment", label: "پرداخت" },
  { value: "promotion", label: "تبلیغاتی" },
  { value: "other", label: "سایر" },
];

export default function EmailTemplateListPage() {
  const templates = useQuery(api.emailTemplates.list);
  const createTemplate = useMutation(api.emailTemplates.create);
  const updateTemplate = useMutation(api.emailTemplates.update);
  const removeTemplate = useMutation(api.emailTemplates.remove);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [form, setForm] = useState({ name: "", type: "order", subject: "", body: "" });

  const filtered = (templates ?? []).filter(
    (t: any) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.type?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: "", type: "order", subject: "", body: "" });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (t: any) => {
    setForm({ name: t.name, type: t.type, subject: t.subject || "", body: t.body || "" });
    setEditId(t._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("نام قالب الزامی است");
    try {
      if (editId) {
        await updateTemplate({ templateId: editId as any, ...form });
        toast.success("قالب بروزرسانی شد.");
      } else {
        await createTemplate({ ...form, variables: [] });
        toast.success("قالب ایجاد شد.");
      }
      resetForm();
    } catch (e: any) {
      toast.error("خطا: " + (e.message || "ناشناخته"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این قالب اطمینان دارید؟")) return;
    try {
      await removeTemplate({ templateId: id as any });
      toast.success("قالب حذف شد.");
    } catch {
      toast.error("خطا در حذف قالب.");
    }
  };

  const getTypeLabel = (type: string) => TEMPLATE_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">قالب‌های ایمیل</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            مدیریت قالب‌های ایمیل ارسالی به مشتریان
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="clay-button flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> قالب جدید
        </button>
      </div>

      {/* Search */}
      <div className="clay-card p-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی قالب..."
            className="clay-input w-full pl-9 pr-3 h-9 text-sm"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {!templates ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">قالبی یافت نشد.</p>
          <p className="text-xs text-muted-foreground mt-1">قالب جدیدی ایجاد کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t: any) => (
            <div key={t._id} className="clay-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{t.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {getTypeLabel(t.type)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                <span className="font-medium">موضوع:</span> {t.subject || "—"}
              </p>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                {t.body?.replace(/<[^>]*>/g, "").slice(0, 120) || "بدون محتوا"}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(t)} className="clay-button px-2 py-1 text-[10px] flex items-center gap-1">
                  <Eye className="h-3 w-3" /> پیش‌نمایش
                </button>
                <button onClick={() => openEdit(t)} className="clay-button px-2 py-1 text-[10px] flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> ویرایش
                </button>
                <button onClick={() => handleDelete(t._id)} className="clay-button px-2 py-1 text-[10px] flex items-center gap-1 hover:text-destructive">
                  <Trash2 className="h-3 w-3" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{editId ? "ویرایش قالب" : "قالب جدید"}</h3>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">نام قالب *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="clay-input w-full h-9 text-sm"
                    placeholder="مثال: تایید سفارش"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">نوع قالب</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="clay-input w-full h-9 text-sm"
                  >
                    {TEMPLATE_TYPES.map((tt) => (
                      <option key={tt.value} value={tt.value}>{tt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">موضوع ایمیل</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="clay-input w-full h-9 text-sm"
                  placeholder="موضوع ایمیل..."
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">محتوا (HTML)</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="clay-input w-full h-48 text-sm font-mono resize-y"
                  placeholder="<h1>سلام!</h1><p>محتوای ایمیل...</p>"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={resetForm} className="clay-button px-4 py-2 text-sm">انصراف</button>
                <button onClick={handleSave} className="clay-button px-4 py-2 text-sm bg-primary text-primary-foreground">
                  {editId ? "بروزرسانی" : "ایجاد"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">پیش‌نمایش: {preview.name}</h3>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border rounded-xl p-4 bg-white text-gray-900">
              <p className="text-xs text-gray-500 mb-2">موضوع: {preview.subject}</p>
              <div dangerouslySetInnerHTML={{ __html: preview.body || "<p>بدون محتوا</p>" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
