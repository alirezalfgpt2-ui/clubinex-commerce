/**
 * 📦 صفحه مدیریت موجودی انبار
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Plus, Boxes, AlertTriangle, Edit3, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "productName" | "quantity" | "warehouseName";

export default function InventoryPage() {
  const inventory = useQuery(api.inventory.listAll, {});
  const warehouses = useQuery(api.warehouses.listActive, {});
  const products = useQuery(api.products.list);
  const summary = useQuery(api.inventory.getStockSummary);
  const upsertInventory = useMutation(api.inventory.upsert);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("productName");
  const [sortAsc, setSortAsc] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [editQty, setEditQty] = useState(0);
  const [editMinStock, setEditMinStock] = useState(0);
  const [editMaxStock, setEditMaxStock] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formProductId, setFormProductId] = useState("");
  const [formWarehouseId, setFormWarehouseId] = useState("");
  const [formQuantity, setFormQuantity] = useState(0);
  const [formMinStock, setFormMinStock] = useState(0);
  const [formProductSearch, setFormProductSearch] = useState("");

  const filtered = useMemo(() => {
    let list = inventory || [];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((i: any) => i.productName.toLowerCase().includes(s) || i.warehouseName.toLowerCase().includes(s));
    }
    list.sort((a: any, b: any) => {
      let cmp = 0;
      if (sortKey === "productName") cmp = a.productName.localeCompare(b.productName);
      else if (sortKey === "quantity") cmp = a.quantity - b.quantity;
      else if (sortKey === "warehouseName") cmp = a.warehouseName.localeCompare(b.warehouseName);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [inventory, search, sortKey, sortAsc]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortAsc ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!formProductSearch) return products.slice(0, 20);
    const s = formProductSearch.toLowerCase();
    return products.filter((p: any) => p.name.toLowerCase().includes(s));
  }, [products, formProductSearch]);

  const handleSaveEdit = async () => {
    if (!editItem) return;
    try {
      await upsertInventory({
        productId: editItem.productId,
        warehouseId: editItem.warehouseId,
        quantity: editQty,
        minStock: editMinStock || undefined,
        maxStock: editMaxStock || undefined,
      });
      toast.success("موجودی بروزرسانی شد.");
      setEditItem(null);
    } catch (e: any) {
      toast.error(e?.message || "خطا در بروزرسانی.");
    }
  };

  const handleCreate = async () => {
    if (!formProductId) { toast.error("محصول را انتخاب کنید."); return; }
    try {
      await upsertInventory({
        productId: formProductId as any,
        warehouseId: formWarehouseId ? (formWarehouseId as any) : undefined,
        quantity: formQuantity,
        minStock: formMinStock || undefined,
      });
      toast.success("موجودی ثبت شد.");
      setShowForm(false);
      setFormProductId(""); setFormWarehouseId(""); setFormQuantity(0); setFormMinStock(0); setFormProductSearch("");
    } catch (e: any) {
      toast.error(e?.message || "خطا.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">موجودی انبار</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} ردیف موجودی</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> ثبت موجودی جدید
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="clay-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Boxes className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{summary.totalItems.toLocaleString("fa-IR")}</p>
              <p className="text-[11px] text-muted-foreground">کل موجودی</p>
            </div>
          </div>
          <div className="clay-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted/50 text-blue-500"><Boxes className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{summary.totalRecords.toLocaleString("fa-IR")}</p>
              <p className="text-[11px] text-muted-foreground">ردیف ثبت شده</p>
            </div>
          </div>
          <div className="clay-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100"><AlertTriangle className="h-5 w-5 text-rose-600" /></div>
            <div>
              <p className="text-2xl font-bold">{summary.lowStockItems.toLocaleString("fa-IR")}</p>
              <p className="text-[11px] text-muted-foreground">موجودی کم</p>
            </div>
          </div>
          <div className="clay-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100"><Boxes className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">{summary.activeWarehouses.toLocaleString("fa-IR")}</p>
              <p className="text-[11px] text-muted-foreground">انبار فعال</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو بر اساس نام محصول یا انبار..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="clay-card p-5 space-y-4">
          <h3 className="font-bold text-sm">ثبت موجودی جدید</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <label className="text-xs text-muted-foreground mb-1 block">محصول</label>
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
              <label className="text-xs text-muted-foreground mb-1 block">تعداد</label>
              <input type="number" value={formQuantity || ""} onChange={(e) => setFormQuantity(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">حداقل موجودی</label>
              <input type="number" value={formMinStock || ""} onChange={(e) => setFormMinStock(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="clay-button px-4 py-2 text-sm font-semibold">ذخیره</button>
            <button onClick={() => setShowForm(false)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("productName")}>
                  <span className="inline-flex items-center gap-1">محصول <SortIcon col="productName" /></span>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("warehouseName")}>
                  <span className="inline-flex items-center gap-1">انبار <SortIcon col="warehouseName" /></span>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("quantity")}>
                  <span className="inline-flex items-center gap-1 justify-center">موجودی <SortIcon col="quantity" /></span>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">حداقل</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">موجودی یافت نشد.</td></tr>
              ) : filtered.map((item: any, idx: number) => {
                const isLow = item.minStock !== undefined && item.quantity <= item.minStock;
                return (
                  <tr key={item._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-center text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 text-xs font-medium">{item.productName}</td>
                    <td className="p-3 text-xs text-muted-foreground">{item.warehouseName}</td>
                    <td className="p-3 text-center text-xs font-bold">{item.quantity.toLocaleString("fa-IR")}</td>
                    <td className="p-3 text-center text-xs text-muted-foreground">{item.minStock ?? "—"}</td>
                    <td className="p-3 text-center">
                      {isLow ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">کمتر از حد</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">کافی</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => { setEditItem(item); setEditQty(item.quantity); setEditMinStock(item.minStock || 0); setEditMaxStock(item.maxStock || 0); }} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"><Edit3 className="h-3.5 w-3.5 text-primary" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditItem(null)}>
          <div className="bg-background rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-sm">ویرایش موجودی — {editItem.productName}</h3>
            <div><label className="text-xs text-muted-foreground mb-1 block">تعداد موجودی</label><input type="number" value={editQty} onChange={(e) => setEditQty(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">حداقل موجودی</label><input type="number" value={editMinStock || ""} onChange={(e) => setEditMinStock(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">حداکثر موجودی</label><input type="number" value={editMaxStock || ""} onChange={(e) => setEditMaxStock(Number(e.target.value))} className="clay-input w-full p-3 text-sm outline-none" /></div>
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="clay-button px-4 py-2 text-sm font-semibold">ذخیره</button>
              <button onClick={() => setEditItem(null)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
