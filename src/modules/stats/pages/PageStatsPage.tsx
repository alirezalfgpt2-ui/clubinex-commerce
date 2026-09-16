import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Eye, TrendingUp, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

export default function PageStatsPage() {
  const products = useQuery(api.products.listActive);
  const [sortBy, setSortBy] = useState<"views" | "name">("views");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const list = products || [];
    const totalViews = list.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
    const avgRating = list.length > 0 ? list.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / list.length : 0;
    return { total: list.length, totalViews, avgRating: avgRating.toFixed(1) };
  }, [products]);

  const sorted = useMemo(() => {
    const list = (products || []) as any[];
    return [...list].sort((a, b) => sortBy === "views" ? (b.views || 0) - (a.views || 0) : a.name.localeCompare(b.name));
  }, [products, sortBy]);

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">آمار بازدید محصولات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">تحلیل بازدید و عملکرد محصولات</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="clay-card p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-muted/50 text-primary"><ShoppingCart className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-[11px] text-muted-foreground">کل محصولات</p></div></div>
        <div className="clay-card p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-muted/50 text-emerald-500"><Eye className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{stats.totalViews.toLocaleString("fa-IR")}</p><p className="text-[11px] text-muted-foreground">کل بازدیدها</p></div></div>
        <div className="clay-card p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-muted/50 text-amber-500"><TrendingUp className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{stats.avgRating}</p><p className="text-[11px] text-muted-foreground">میانگین امتیاز</p></div></div>
      </div>

      <div className="clay-card p-3 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">مرتب‌سازی:</span>
        <button onClick={() => setSortBy("views")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === "views" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>پربازدیدترین</button>
        <button onClick={() => setSortBy("name")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === "name" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>الفبایی</button>
      </div>

      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">محصول</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">بازدید</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">امتیاز</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تعداد نظر</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">قیمت</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground text-xs">محصولی یافت نشد.</td></tr>
              ) : paginated.map((p: any, i: number) => (
                <tr key={p._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="p-3 text-center text-xs font-medium max-w-[200px] truncate">{p.name}</td>
                  <td className="p-3 text-center text-xs font-bold">{(p.views || 0).toLocaleString("fa-IR")}</td>
                  <td className="p-3 text-center text-xs">{p.rating || "—"}</td>
                  <td className="p-3 text-center text-xs">{p.reviewCount || 0}</td>
                  <td className="p-3 text-center text-xs">{p.price?.toLocaleString("fa-IR")} تومان</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>صفحه {page} از {totalPages} — {sorted.length} رکورد</span>
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
