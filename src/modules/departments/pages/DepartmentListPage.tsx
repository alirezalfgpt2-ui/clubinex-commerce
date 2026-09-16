/**
 * 🏢 صفحه مدیریت دپارتمان‌ها
 * — رنگ‌ها با hex (نه Tailwind class)
 * — آیکون‌ها از lucide-react
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, Save, X, Building2 } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive?: boolean;
}

const HEX_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#06b6d4",
  "#f59e0b", "#f43f5e", "#6366f1", "#ec4899",
  "#14b8a6", "#84cc16", "#f97316", "#64748b",
];

export default function DepartmentListPage() {
  const settingsData = useQuery(api.settings.get, { key: "departments" });
  const setSetting = useMutation(api.settings.set);
  const departments: Department[] = (settingsData?.value as Department[]) || [];
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Department>({ id: "", name: "", icon: "Building2", color: "#3b82f6" });
  const confirmDialog = useConfirm();

  const save = async (list: Department[]) => {
    try {
      await setSetting({ key: "departments", value: list, category: "general", isPublic: true });
      toast.success("ذخیره شد.");
    } catch (e: any) { toast.error(e?.message || "خطا"); }
  };

  const handleAdd = async () => {
    if (!form.name || !form.id) { toast.error("نام و شناسه الزامی است."); return; }
    if (departments.some((d) => d.id === form.id)) { toast.error("شناسه تکراری است."); return; }
    await save([...departments, { ...form, isActive: true }]);
    setShowForm(false);
    setForm({ id: "", name: "", icon: "Building2", color: "#3b82f6" });
  };

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف دپارتمان", message: "آیا از حذف اطمینان دارید؟", variant: "danger" })) return;
    await save(departments.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">دپارتمان‌ها</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{departments.length} دپارتمان فعال</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> افزودن
        </button>
      </div>

      {showForm && (
        <div className="clay-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">دپارتمان جدید</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div><label className="text-[11px] text-muted-foreground mb-1 block">شناسه</label><input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className="clay-input w-full px-3 py-2 text-xs outline-none" placeholder="sales" dir="ltr" /></div>
            <div><label className="text-[11px] text-muted-foreground mb-1 block">نام فارسی</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="clay-input w-full px-3 py-2 text-xs outline-none" placeholder="فروش" /></div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">رنگ</label>
              <div className="flex gap-1.5 flex-wrap">{HEX_COLORS.map((c) => (<button key={c} onClick={() => setForm({ ...form, color: c })} style={{ backgroundColor: c }} className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110 ring-2 ring-foreground/20" : "border-white/50"}`} />))}</div>
            </div>
            <div className="flex items-end"><button onClick={handleAdd} className="clay-button px-4 py-2 text-sm font-semibold w-full">ذخیره</button></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className={`clay-card p-5 space-y-3 transition-all ${dept.isActive === false ? "opacity-50" : ""}`}>
            {editing === dept.id ? (
              <div className="space-y-2">
                <input defaultValue={dept.name} onBlur={(e) => save(departments.map((d) => d.id === dept.id ? { ...d, name: e.target.value } : d))} className="clay-input w-full px-3 py-2 text-sm outline-none" />
                <button onClick={() => setEditing(null)} className="clay-button px-3 py-1.5 text-xs flex items-center gap-1"><Save className="h-3 w-3" /> ذخیره</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: dept.color + "20" }}>
                      <Building2 className="h-5 w-5" style={{ color: dept.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{dept.name}</h3>
                      <p className="text-[10px] text-muted-foreground" dir="ltr">{dept.id}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dept.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {dept.isActive !== false ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(dept.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => save(departments.map((d) => d.id === dept.id ? { ...d, isActive: d.isActive === false ? true : false } : d))} className="text-[10px] px-2 py-1 rounded-lg hover:bg-muted transition-colors">{dept.isActive !== false ? "غیرفعال" : "فعال"}</button>
                  <button onClick={() => handleDelete(dept.id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {departments.length === 0 && (
          <div className="col-span-full clay-card p-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">هنوز دپارتمانی تعریف نشده.</p>
          </div>
        )}
      </div>
    </div>
  );
}
