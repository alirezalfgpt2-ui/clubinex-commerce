import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { FileText, Plus, Eye, Pencil, Trash2, Copy, X } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import type { Id } from "@/convex/_generated/dataModel";

const TEMPLATE_TYPES = [
  { value: "welcome", label: "خوش‌آمدگویی" },
  { value: "reset_password", label: "بازنشانی رمز" },
  { value: "order_confirmation", label: "تأیید سفارش" },
  { value: "invoice", label: "فاکتور" },
  { value: "newsletter", label: "خبرنامه" },
  { value: "custom", label: "سفارشی" },
];

const TEMPLATE_VARIABLES: Record<string, string[]> = {
  welcome: ["{{name}}", "{{email}}", "{{date}}"],
  reset_password: ["{{name}}", "{{link}}", "{{expiry}}"],
  order_confirmation: ["{{name}}", "{{orderNumber}}", "{{total}}", "{{items}}"],
  invoice: ["{{name}}", "{{orderNumber}}", "{{total}}", "{{date}}", "{{items}}"],
  newsletter: ["{{name}}", "{{unsubscribe_link}}"],
  custom: ["{{name}}", "{{email}}", "{{date}}", "{{custom_field}}"],
};

export default function TemplateListPage() {
  const templates = useQuery(api.emailTemplates.list);
  const createTemplate = useMutation(api.emailTemplates.create);
  const updateTemplate = useMutation(api.emailTemplates.update);
  const removeTemplate = useMutation(api.emailTemplates.remove);

  const [preview, setPreview] = useState<Id<'emailTemplates'> | null>(null);
  const [editing, setEditing] = useState<Id<'emailTemplates'> | null>(null);
  const confirmDialog = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    type: "welcome",
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("لطفاً تمام فیلدها را پر کنید.");
      return;
    }
    try {
      const vars = TEMPLATE_VARIABLES[formData.type] || [];
      await createTemplate({
        ...formData,
        variables: vars,
      });
      toast.success("قالب با موفقیت ایجاد شد.");
      setShowForm(false);
      setFormData({ name: "", subject: "", body: "", type: "welcome" });
    } catch {
      toast.error("خطا در ایجاد قالب.");
    }
  };

  const handleUpdate = async (templateId: Id<'emailTemplates'>, updates: any) => {
    try {
      await updateTemplate({ templateId, ...updates });
      toast.success("قالب با موفقیت بروزرسانی شد.");
      setEditing(null);
    } catch {
      toast.error("خطا در بروزرسانی قالب.");
    }
  };

  const handleDelete = async (templateId: Id<'emailTemplates'>) => {
    if (!await confirmDialog({ title: "حذف قالب", message: "آیا از حذف این قالب اطمینان دارید؟", variant: "danger" })) return;
    try {
      await removeTemplate({ templateId });
      toast.success("قالب با موفقیت حذف شد.");
    } catch {
      toast.error("خطا در حذف قالب.");
    }
  };

  const handleCopyCode = (template: { body: string }) => {
    navigator.clipboard.writeText(template.body);
    toast.success("کد قالب کپی شد.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">قالب‌های ایمیل</h1>
          <p className="text-sm text-muted-foreground mt-0.5">مدیریت و ویرایش قالب‌های ایمیل سیستم</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> {showForm ? "بستن" : "قالب جدید"}
        </button>
      </div>

      {showForm && (
        <div className="clay-card p-6 space-y-4">
          <h3 className="font-semibold text-sm">ایجاد قالب جدید</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نام قالب</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: خوش‌آمدگویی"
                className="clay-input w-full p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نوع قالب</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="clay-input w-full p-3 text-sm outline-none"
              >
                {TEMPLATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">موضوع ایمیل</label>
            <input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="موضوع ایمیل..."
              className="clay-input w-full p-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">محتوای قالب</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="محتوای قالب با متغیرها..."
              rows={5}
              className="clay-input w-full p-3 text-sm outline-none resize-none font-mono"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              متغیرهای موجود: {(TEMPLATE_VARIABLES[formData.type] || []).join(", ")}
            </p>
          </div>
          <button onClick={handleCreate} className="clay-button px-4 py-2 text-sm font-semibold">
            ایجاد قالب
          </button>
        </div>
      )}

      {!templates || templates.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">هنوز قالبی ایجاد نشده است.</p>
          <p className="text-xs text-muted-foreground mt-1">قالب‌های پیش‌فرض با ایجاد داده‌های تستی اضافه می‌شوند.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t._id} className="clay-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {TEMPLATE_TYPES.find((tp) => tp.value === t.type)?.label || t.type}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    t.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {t.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">موضوع: {t.subject}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(preview === t._id ? null : t._id)}
                  className="clay-button px-3 py-1.5 text-xs flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" /> پیش‌نمایش
                </button>
                <button
                  onClick={() => setEditing(editing === t._id ? null : t._id)}
                  className="clay-button px-3 py-1.5 text-xs flex items-center gap-1 bg-muted text-foreground"
                >
                  <Pencil className="h-3 w-3" /> ویرایش
                </button>
                <button
                  onClick={() => handleCopyCode(t)}
                  className="clay-button px-3 py-1.5 text-xs flex items-center gap-1 bg-muted text-foreground"
                >
                  <Copy className="h-3 w-3" /> کپی
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="clay-button px-3 py-1.5 text-xs flex items-center gap-1 bg-rose-500 text-white hover:bg-rose-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              {preview === t._id && (
                <div className="clay-surface p-3 rounded-lg text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                  {t.body}
                </div>
              )}
              {editing === t._id && (
                <div className="space-y-2 mt-2">
                  <input
                    defaultValue={t.name}
                    onBlur={(e) => handleUpdate(t._id, { name: e.target.value })}
                    className="clay-input w-full p-2 text-xs outline-none"
                    placeholder="نام قالب"
                  />
                  <input
                    defaultValue={t.subject}
                    onBlur={(e) => handleUpdate(t._id, { subject: e.target.value })}
                    className="clay-input w-full p-2 text-xs outline-none"
                    placeholder="موضوع"
                  />
                  <textarea
                    defaultValue={t.body}
                    onBlur={(e) => handleUpdate(t._id, { body: e.target.value })}
                    className="clay-input w-full p-2 text-xs outline-none resize-none font-mono"
                    rows={4}
                    placeholder="محتوا"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(t._id, { isActive: !t.isActive })}
                      className={`clay-button px-3 py-1.5 text-xs ${t.isActive ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}
                    >
                      {t.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    </button>
                    <button onClick={() => setEditing(null)} className="clay-button px-3 py-1.5 text-xs bg-muted text-foreground">
                      <X className="h-3 w-3 mr-1" /> انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
