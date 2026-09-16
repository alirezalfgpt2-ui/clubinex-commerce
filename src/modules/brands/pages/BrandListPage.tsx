import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 15;

export default function BrandListPage() {
  const brands = useQuery(api.brands.list);
  const createBrand = useMutation(api.brands.create);
  const updateBrand = useMutation(api.brands.update);
  const removeBrand = useMutation(api.brands.remove);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");

  const resetForm = () => { setName(""); setNameFa(""); setSlug(""); setDescription(""); setLogo(""); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("نام برند را وارد کنید."); return; }
    try {
      if (editId) {
        await updateBrand({ brandId: editId as any, name, description, logo });
        toast.success("برند ویرایش شد.");
      } else {
        await createBrand({ name, description, logo });
        toast.success("برند جدید اضافه شد.");
      }
      resetForm();
    } catch { toast.error("خطا در ذخیره‌سازی."); }
  };

  const handleEdit = (b: any) => {
    setEditId(b._id); setName(b.name); setNameFa(b.nameFa || ""); setSlug(b.slug); setDescription(b.description || ""); setLogo(b.logo || ""); setShowForm(true);
  };

  const confirmDialog = useConfirm();
  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف برند", message: "آیا از حذف این برند مطمئن هستید؟", variant: "danger" })) return;
    try { await removeBrand({ brandId: id as any }); toast.success("برند حذف شد."); } catch { toast.error("خطا در حذف."); }
  };

  const filtered = useMemo(() => {
    if (!brands) return [];
    if (!search) return brands;
    const q = search.toLowerCase();
    return brands.filter((b: any) => b.name.toLowerCase().includes(q) || (b.nameFa || "").includes(q) || b.slug.toLowerCase().includes(q));
  }, [brands, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">برندها</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} برند ثبت شده</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> برند جدید
        </button>
      </div>

      {showForm && (
        <div className="clay-card p-6 space-y-3">
          <h3 className="font-semibold text-sm">{editId ? "ویرایش برند" : "برند جدید"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام انگلیسی *" className="clay-input p-3 text-sm outline-none" />
            <input value={nameFa} onChange={(e) => setNameFa(e.target.value)} placeholder="نام فارسی" className="clay-input p-3 text-sm outline-none" />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="اسلاگ" className="clay-input p-3 text-sm outline-none" dir="ltr" />
            <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="آدرس لوگو" className="clay-input p-3 text-sm outline-none" dir="ltr" />
          </div>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات" className="clay-input p-3 text-sm outline-none w-full" />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="clay-button px-4 py-2 text-sm font-semibold">{editId ? "ذخیره" : "ایجاد"}</button>
            <button onClick={resetForm} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        </div>
      )}

      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجوی برند..." className="clay-input w-full h-10 pl-9 pr-3 text-sm outline-none" />
        </div>
      </div>

      <div className="clay-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-right text-xs font-medium text-muted-foreground w-8">#</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">لوگو</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">نام</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">نام فارسی</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">اسلاگ</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
              <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">برندی یافت نشد.</td></tr>
            ) : paginated.map((b: any, i: number) => (
              <tr key={b._id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="p-3">
                  {b.logo ? <img src={b.logo} alt="" className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs">🏷️</div>}
                </td>
                <td className="p-3 font-medium text-xs">{b.name}</td>
                <td className="p-3 text-xs">{b.nameFa || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground" dir="ltr">{b.slug}</td>
                <td className="p-3 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {b.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(b)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground py-2">
          <span>صفحه {page} از {totalPages} — مجموع {filtered.length} رکورد</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>;
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
