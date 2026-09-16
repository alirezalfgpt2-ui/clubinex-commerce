/**
 * 📋 صفحه گردش موجودی — نمایش تمام جابجایی‌ها
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, ArrowDown, ArrowUp, ShoppingCart, RotateCcw, Wrench, ArrowRightLeft, Plus, Filter } from "lucide-react";

const TYPE_MAP: Record<string, { label: string; icon: any; color: string }> = {
  in: { label: "ورود", icon: ArrowDown, color: "bg-emerald-100 text-emerald-700" },
  out: { label: "خروج", icon: ArrowUp, color: "bg-rose-100 text-rose-700" },
  purchase: { label: "خرید", icon: ShoppingCart, color: "bg-blue-100 text-blue-700" },
  sale: { label: "فروش", icon: ShoppingCart, color: "bg-purple-100 text-purple-700" },
  return: { label: "مرجوعی", icon: RotateCcw, color: "bg-amber-100 text-amber-700" },
  adjustment: { label: "اصلاح", icon: Wrench, color: "bg-gray-100 text-gray-700" },
  transfer: { label: "انتقال", icon: ArrowRightLeft, color: "bg-sky-100 text-sky-700" },
};

export default function InventoryMovementsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const movements = useQuery(api.inventory.listMovements, typeFilter ? { type: typeFilter as any } : {});
  const inventory = useQuery(api.inventory.listAll, {});
  const warehouses = useQuery(api.warehouses.listActive, {});
  const products = useQuery(api.products.list);
  const recordMovement = useMutation(api.inventory.recordMovement);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formProductId, setFormProductId] = useState("");
  const [formWarehouseId, setFormWarehouseId] = useState("");
  const [formType, setFormType] = useState<string>("in");
  const [formQuantity, setFormQuantity] = useState(0);
  const [formNote, setFormNote] = useState("");
  const [formProductSearch, setFormProductSearch] = useState("");

  const filtered = useMemo(() => {
    let list = movements || [];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((m: any) => m.productName.toLowerCase().includes(s) || m.warehouseName.toLowerCase().includes(s) || (m.note || "").toLowerCase().includes(s));
    }
    return list;
  }, [movements, search]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!formProductSearch) return products.slice(0, 20);
    const s = formProductSearch.toLowerCase();
    return products.filter((p: any) => p.name.toLowerCase().includes(s));
  }, [products, formProductSearch]);

  const handleRecord = async () => {
    if (!formProductId) { toast.error("محصول را انتخاب کنید."); return; }
    if (formQuantity <= 0) { toast.error("تعداد باید مثبت باشد."); return; }
    try {
      await recordMovement({
        productId: formProductId as any,
        warehouseId: formWarehouseId ? (formWarehouseId as any) : undefined,
        type: formType as any,
        quantity: formQuantity,
        note: formNote || undefined,
      });
      toast.success("گردش ثبت شد.");
      setShowForm(false);
      setFormProductId(""); setFormWarehouseId(""); setFormType("in"); setFormQuantity(0); setFormNote(""); setFormProductSearch("");
    } catch (e: any) {
      toast.error(e?.message || "خطا.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">گردش موجودی</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} رکورد گردش</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> ثبت گردش جدید
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="clay-card p-5 space-y-4">
          <h3 className="font-bold text-sm">ثبت گردش موجودی</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <label className="text-xs text-muted-foreground mb-1 block">محصول *</label>
              <input value={formProductSearch || (formProductId ? (products as any)?.find((p: any) => p._id === formProductId)?.name || "" : "")} onChange={(e) => { setFormProductSearch(e.target.value); setFormProductId(""); }} onFocus={() => setFormProductSearch(formProductSearch || " ")} placeholder="جستجوی محصول..." className="clay-input w-full p-3 text-sm outline-none" />
              {formProductSearch && filteredProducts.length > 0 && !formProductId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                  {filteredProducts.map((p: any) => (
                    <button key={p._id} onClick={() => { setFormProductId(p._id); setFormProductSearch(p.name); }} className="w-full px-3 py-2 text-xs hover:bg-muted text-right border-b border-border/50 last:border-0">{p.name}</button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">انبار</label>
              <select value={formWarehouseId} onChange={(e) => setFormWarehouseId(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
                <option value="">انبار مرکزی</option>
                {(warehouses || []).map((w: any) => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نوع گردش *</label>
              <select value={formType} onChange={(e) => setFormType(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
                {Object.entries(TYPE_MAP).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">تعداد *</label>
              <input type="number" value={formQuantity || ""} onChange={(e) => setFormQuantity(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">یادداشت</label>
              <input value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="توضیحات..." className="clay-input w-full p-3 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRecord} className="clay-button px-4 py-2 text-sm font-semibold">ثبت گردش</button>
            <button onClick={() => setShowForm(false)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="clay-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {Object.entries(TYPE_MAP).map(([key, val]) => (
            <button key={key} onClick={() => setTypeFilter(typeFilter === key ? "" : key)} className={`px-2 py-1 rounded-lg transition-all ${typeFilter === key ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{val.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">محصول</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">انبار</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">نوع</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تعداد</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تاریخ</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">کاربر</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">یادداشت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-muted-foreground text-xs">گردشی ثبت نشده است.</td></tr>
              ) : filtered.map((m: any, idx: number) => {
                const cfg = TYPE_MAP[m.type] || TYPE_MAP.in;
                const IconComp = cfg.icon;
                return (
                  <tr key={m._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-center text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 text-xs font-medium">{m.productName}</td>
                    <td className="p-3 text-xs text-muted-foreground">{m.warehouseName}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                        <IconComp className="h-3 w-3" /> {cfg.label}
                      </span>
                    </td>
                    <td className="p-3 text-center text-xs font-bold">{m.quantity.toLocaleString("fa-IR")}</td>
                    <td className="p-3 text-center text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("fa-IR")}</td>
                    <td className="p-3 text-center text-xs text-muted-foreground">{m.userName}</td>
                    <td className="p-3 text-center text-xs text-muted-foreground max-w-[150px] truncate">{m.note || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
