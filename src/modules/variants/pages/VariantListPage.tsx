/**
 * 🎨 صفحه مدیریت متغیرهای محصولات
 * — مدیریت تنوع محصولات (رنگ، سایز، گارانتی و...)
 * — هر متغیر موجودی و قیمت جداگانه دارد
 * — ایجاد، ویرایش و حذف متغیرها
 * — نمایش اختلاف قیمت با قیمت پایه محصول
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Search, Palette, Trash2, ChevronLeft, ChevronRight, Plus, Edit3, X } from "lucide-react";

const PAGE_SIZE = 15;

export default function VariantListPage() {
  const variants = useQuery(api.variants.listAll);
  const products = useQuery(api.products.list);
  const createVariant = useMutation(api.variants.create);
  const updateVariant = useMutation(api.variants.update);
  const removeVariant = useMutation(api.variants.remove);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editVariant, setEditVariant] = useState<any>(null);
  const confirmDialog = useConfirm();

  // Form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [type, setType] = useState("color");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const resetForm = () => {
    setSelectedProductId(""); setType("color"); setName(""); setValue(""); setAdditionalPrice(0); setStock(0);
  };

  const filtered = useMemo(() => {
    let list = (variants || []) as any[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((v) => {
        const p = products?.find((p: any) => p._id === v.productId);
        return p?.name?.toLowerCase().includes(q) || v.value?.toLowerCase().includes(q) || v.type?.toLowerCase().includes(q);
      });
    }
    return list;
  }, [variants, products, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const getProductName = (id: string) => products?.find((p: any) => p._id === id)?.name || id;

  const handleCreate = async () => {
    if (!selectedProductId || !name.trim()) { toast.error("محصول و نام متغیر الزامی است."); return; }
    try {
      await createVariant({ productId: selectedProductId as any, type, name: name.trim(), value: value.trim() || undefined, additionalPrice, stock });
      toast.success("متغیر ایجاد شد.");
      setShowForm(false); resetForm();
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleUpdate = async () => {
    if (!editVariant || !name.trim()) { toast.error("نام متغیر الزامی است."); return; }
    try {
      await updateVariant({ variantId: editVariant._id, type, name: name.trim(), value: value.trim() || undefined, additionalPrice, stock });
      toast.success("متغیر بروزرسانی شد.");
      setShowForm(false); setEditVariant(null); resetForm();
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف متغیر", message: "آیا از حذف این متغیر اطمینان دارید؟", variant: "danger" })) return;
    try { await removeVariant({ variantId: id as any }); toast.success("متغیر حذف شد."); }
    catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  return (
    <div className="space-y-5">
      {/* ── هدر ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">متغیرهای محصولات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            مدیریت تنوع محصولات — رنگ، سایز، گارانتی و... با موجودی و قیمت جداگانه
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditVariant(null); resetForm(); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> متغیر جدید
        </button>
      </div>

      {/* ── جستجو ── */}
      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو در متغیرها..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
      </div>

      {/* ── فرم ایجاد/ویرایش ── */}
      {showForm && (
        <div className="clay-card p-6 space-y-4 relative z-20">
          <h3 className="font-bold text-sm">{editVariant ? "ویرایش متغیر" : "افزودن متغیر جدید"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {!editVariant && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">محصول *</label>
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
                  <option value="">انتخاب محصول...</option>
                  {products?.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            )}
            {editVariant && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">محصول</label>
                <input value={getProductName(editVariant.productId)} disabled className="clay-input w-full p-3 text-sm outline-none opacity-60" />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نوع متغیر *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
                <option value="color">رنگ</option>
                <option value="size">سایز</option>
                <option value="guarantee">گارانتی</option>
                <option value="material">جنس</option>
                <option value="weight">وزن</option>
                <option value="other">سایر</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نام متغیر *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: مشکی، XL، ۱۸ ماهه" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">مقدار (اختیاری)</label>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="مقدار تکمیلی" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اختلاف قیمت (تومان)</label>
              <input type="number" value={additionalPrice || ""} onChange={(e) => setAdditionalPrice(Number(e.target.value))} placeholder="مثبت یا منفی" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">موجودی</label>
              <input type="number" value={stock || ""} onChange={(e) => setStock(Number(e.target.value))} placeholder="تعداد" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={editVariant ? handleUpdate : handleCreate} className="clay-button px-5 py-2 text-sm font-semibold">
              {editVariant ? "ذخیره تغییرات" : "ایجاد متغیر"}
            </button>
            <button onClick={() => { setShowForm(false); setEditVariant(null); resetForm(); }} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        </div>
      )}

      {/* ── جدول ── */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">محصول</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">نوع</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">مقدار</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">موجودی</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">اختلاف قیمت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">متغیری یافت نشد.</td></tr>
              ) : paginated.map((v: any, i: number) => (
                <tr key={v._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="p-3 text-center text-xs font-medium max-w-[150px] truncate">{getProductName(v.productId)}</td>
                  <td className="p-3 text-center text-xs"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{v.type}</span></td>
                  <td className="p-3 text-center text-xs">
                    <div className="flex items-center justify-center gap-1">
                      {v.name}
                    </div>
                  </td>
                  <td className="p-3 text-center text-xs font-medium">{v.stock}</td>
                  <td className="p-3 text-center text-xs">{v.additionalPrice > 0 ? "+" : ""}{v.additionalPrice?.toLocaleString("fa-IR")}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditVariant(v); setType(v.type); setName(v.name || ""); setValue(v.value || ""); setAdditionalPrice(v.additionalPrice || 0); setStock(v.stock || 0); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="ویرایش">
                        <Edit3 className="h-3.5 w-3.5 text-primary" />
                      </button>
                      <button onClick={() => handleDelete(v._id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="حذف">
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── صفحه‌بندی ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>صفحه {page} از {totalPages} — {filtered.length} رکورد</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const s = Math.max(1, Math.min(page - 2, totalPages - 4)); const p = s + i; if (p > totalPages) return null; return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>; })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
