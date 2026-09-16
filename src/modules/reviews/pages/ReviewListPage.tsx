import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Search, Star, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight, MessageSquare, ThumbsUp } from "lucide-react";

const PAGE_SIZE = 15;

export default function ReviewListPage() {
  const reviews = useQuery(api.reviews.listAll);
  const products = useQuery(api.products.list);
  const updateReview = useMutation(api.reviews.updateStatus);
  const deleteReview = useMutation(api.reviews.remove);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const confirmDialog = useConfirm();

  const stats = useMemo(() => {
    const list = reviews || [];
    return {
      total: list.length,
      pending: list.filter((r: any) => r.status === "pending").length,
      approved: list.filter((r: any) => r.status === "approved").length,
      rejected: list.filter((r: any) => r.status === "rejected").length,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = (reviews || []) as any[];
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => (r.title || "").toLowerCase().includes(q) || (r.comment || "").toLowerCase().includes(q));
    }
    return list;
  }, [reviews, search, filter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const getProductName = (id: string) => products?.find((p: any) => p._id === id)?.name || id;

  const handleApprove = async (id: string) => {
    try { await updateReview({ reviewId: id as any, status: "approved" }); toast.success("نظر تایید شد."); }
    catch (e: any) { toast.error(e?.message || "خطا."); }
  };
  const handleReject = async (id: string) => {
    try { await updateReview({ reviewId: id as any, status: "rejected" }); toast.success("نظر رد شد."); }
    catch (e: any) { toast.error(e?.message || "خطا."); }
  };
  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف نظر", message: "آیا از حذف این نظر اطمینان دارید؟", variant: "danger" })) return;
    try { await deleteReview({ reviewId: id as any }); toast.success("نظر حذف شد."); }
    catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مدیریت نظرات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} نظر</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<MessageSquare className="h-5 w-5" />} label="کل نظرات" value={stats.total} color="text-primary" />
        <StatCard icon={<Star className="h-5 w-5" />} label="در انتظار" value={stats.pending} color="text-amber-500" />
        <StatCard icon={<CheckCircle className="h-5 w-5" />} label="تایید شده" value={stats.approved} color="text-emerald-500" />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="رد شده" value={stats.rejected} color="text-rose-500" />
      </div>

      <div className="clay-card p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو در نظرات..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f === "all" ? "همه" : f === "pending" ? "در انتظار" : f === "approved" ? "تایید شده" : "رد شده"}
            </button>
          ))}
        </div>
      </div>

      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">محصول</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">امتیاز</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عنوان</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">متن نظر</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">نقاط قوت/ضعف</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-muted-foreground text-xs">نظری یافت نشد.</td></tr>
              ) : paginated.map((r: any, i: number) => (
                <tr key={r._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="p-3 text-center text-xs">{getProductName(r.productId)}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-3 w-3 ${idx < r.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center text-xs font-medium">{r.title || "—"}</td>
                  <td className="p-3 text-center text-xs max-w-[200px] truncate">{r.comment || "—"}</td>
                  <td className="p-3 text-center text-[10px]">
                    {r.pros?.length > 0 && <div className="text-emerald-600">+{r.pros.length} قوت</div>}
                    {r.cons?.length > 0 && <div className="text-rose-600">-{r.cons.length} ضعف</div>}
                  </td>
                  <td className="p-3 text-center">
                    <select value={r.status || "pending"} onChange={(e) => { if (e.target.value === "approved") handleApprove(r._id); else handleReject(r._id); }} className="clay-input px-2 py-1 text-[10px] outline-none">
                      <option value="pending">در انتظار</option>
                      <option value="approved">تایید شده</option>
                      <option value="rejected">رد شده</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {r.status !== "approved" && <button onClick={() => handleApprove(r._id)} className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors" title="تایید"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /></button>}
                      {r.status !== "rejected" && <button onClick={() => handleReject(r._id)} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors" title="رد"><XCircle className="h-3.5 w-3.5 text-amber-500" /></button>}
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="حذف"><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                    </div>
                  </td>
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="clay-card p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-muted/50 ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value.toLocaleString("fa-IR")}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
