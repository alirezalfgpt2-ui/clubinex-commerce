import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Search, Heart, ChevronLeft, ChevronRight, Bell } from "lucide-react";

const PAGE_SIZE = 15;

export default function WishlistAdminPage() {
  const wishlists = useQuery(api.wishlists.listAll);
  const products = useQuery(api.products.list);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const list = wishlists || [];
    return { total: list.length, notifyStock: list.filter((w: any) => w.notifyOnStock).length };
  }, [wishlists]);

  const filtered = useMemo(() => {
    let list = (wishlists || []) as any[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((w) => {
        const p = products?.find((p: any) => p._id === w.productId);
        return p?.name?.toLowerCase().includes(q);
      });
    }
    return list;
  }, [wishlists, products, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const getProductName = (id: string) => products?.find((p: any) => p._id === id)?.name || id;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">لیست علاقه‌مندی‌ها</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} مورد</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="clay-card p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-muted/50 text-primary"><Heart className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-[11px] text-muted-foreground">کل علاقه‌مندی‌ها</p></div></div>
        <div className="clay-card p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-muted/50 text-amber-500"><Bell className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{stats.notifyStock}</p><p className="text-[11px] text-muted-foreground">اطلاع‌رسانی موجودی</p></div></div>
      </div>

      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو در محصولات علاقه‌مندی..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
      </div>

      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">محصول</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">اطلاع موجودی</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">اطلاع تخفیف</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground text-xs">موردی یافت نشد.</td></tr>
              ) : paginated.map((w: any, i: number) => (
                <tr key={w._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="p-3 text-center text-xs font-medium">{getProductName(w.productId)}</td>
                  <td className="p-3 text-center"><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${w.notifyOnStock ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{w.notifyOnStock ? "فعال" : "غیرفعال"}</span></td>
                  <td className="p-3 text-center"><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${w.notifyOnSale ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{w.notifyOnSale ? "فعال" : "غیرفعال"}</span></td>
                  <td className="p-3 text-center text-xs">{new Date(w.createdAt).toLocaleDateString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
