import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Search, MessageCircle, Trash2, ChevronLeft, ChevronRight, HelpCircle, CheckCircle } from "lucide-react";

const PAGE_SIZE = 15;

export default function QAListPage() {
  const questions = useQuery(api.questions.listAll);
  const products = useQuery(api.products.list);
  const removeQuestion = useMutation(api.questions.remove);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const confirmDialog = useConfirm();

  const stats = useMemo(() => {
    const list = questions || [];
    return { total: list.length, answered: list.filter((q: any) => q.status === "answered").length, pending: list.filter((q: any) => q.status !== "answered").length };
  }, [questions]);

  const filtered = useMemo(() => {
    let list = (questions || []) as any[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => (r.content || "").toLowerCase().includes(q));
    }
    return list;
  }, [questions, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const getProductName = (id: string) => products?.find((p: any) => p._id === id)?.name || id;

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف سوال", message: "آیا از حذف این سوال اطمینان دارید؟", variant: "danger" })) return;
    try { await removeQuestion({ questionId: id as any }); toast.success("سوال حذف شد."); }
    catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">پرسش و پاسخ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} سوال</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={<HelpCircle className="h-5 w-5" />} label="کل سوالات" value={stats.total} color="text-primary" />
        <StatCard icon={<CheckCircle className="h-5 w-5" />} label="پاسخ داده شده" value={stats.answered} color="text-emerald-500" />
        <StatCard icon={<MessageCircle className="h-5 w-5" />} label="در انتظار پاسخ" value={stats.pending} color="text-amber-500" />
      </div>

      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو در سوالات..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
      </div>

      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">محصول</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">سوال</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">پاسخ‌ها</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground text-xs">سوالی یافت نشد.</td></tr>
              ) : paginated.map((q: any, i: number) => (
                <tr key={q._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="p-3 text-center text-xs">{getProductName(q.productId)}</td>
                  <td className="p-3 text-center text-xs max-w-[250px] truncate">{q.content}</td>
                  <td className="p-3 text-center text-xs">{q.answers?.length || 0}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${q.status === "answered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {q.status === "answered" ? "پاسخ داده شده" : "در انتظار"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="حذف"><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
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
      <div><p className="text-2xl font-bold">{value.toLocaleString("fa-IR")}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>
    </div>
  );
}
