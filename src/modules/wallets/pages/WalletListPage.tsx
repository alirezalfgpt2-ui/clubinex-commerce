/**
 * 💰 صفحه مدیریت کیف پول و وفاداری
 * — مشاهده موجودی و امتیازات کاربران
 * — افزودن موجودی به کیف پول کاربران
 * — مشاهده تراکنش‌ها و تاریخچه
 * — سیستم امتیازدهی وفاداری (باشگاه مشتریان)
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Search, Wallet, Star, ChevronLeft, ChevronRight, Plus, Edit3, Trash2, X, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const PAGE_SIZE = 15;

export default function WalletListPage() {
  const wallets = useQuery(api.wallets.listAll);
  const users = useQuery(api.users.list);
  const adminAdjustBalance = useMutation(api.wallets.adminAdjustBalance);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editWallet, setEditWallet] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const confirmDialog = useConfirm();

  const stats = useMemo(() => {
    const list = wallets || [];
    return {
      total: list.length,
      totalBalance: list.reduce((sum: number, w: any) => sum + (w.balance || 0), 0),
      totalPoints: list.reduce((sum: number, w: any) => sum + (w.points || 0), 0),
    };
  }, [wallets]);

  const filtered = useMemo(() => {
    let list = (wallets || []) as any[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((w) => {
        const user = users?.find((u: any) => u._id === w.userId);
        return (user?.name || "").toLowerCase().includes(q) || (user?.email || "").toLowerCase().includes(q);
      });
    }
    return list;
  }, [wallets, users, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const getUserName = (userId: string) => {
    const user = users?.find((u: any) => u._id === userId);
    return user?.name || user?.email || userId;
  };

  const handleAddBalance = async () => {
    if (!selectedUserId || amount === 0) { toast.error("کاربر و مبلغ را وارد کنید."); return; }
    try {
      await adminAdjustBalance({ userId: selectedUserId as any, amount, description: description || (amount >= 0 ? "افزایش موجودی توسط ادمین" : "کاهش موجودی توسط ادمین") });
      toast.success(`${amount > 0 ? "افزایش" : "کاهش"} موجودی با موفقیت انجام شد.`);
      setShowForm(false);
      setSelectedUserId("");
      setAmount(0);
      setDescription("");
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  return (
    <div className="space-y-5">
      {/* ── هدر ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">کیف پول و وفاداری</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            مدیریت موجودی ریالی و امتیازات وفاداری کاربران — باشگاه مشتریان
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditWallet(null); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> افزایش/کاهش موجودی
        </button>
      </div>

      {/* ── آمار ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="clay-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted/50 text-primary"><Wallet className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{stats.totalBalance.toLocaleString("fa-IR")}</p><p className="text-[11px] text-muted-foreground">موجودی کل (تومان)</p></div>
        </div>
        <div className="clay-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted/50 text-amber-500"><Star className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{stats.totalPoints.toLocaleString("fa-IR")}</p><p className="text-[11px] text-muted-foreground">کل امتیازات</p></div>
        </div>
        <div className="clay-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted/50 text-emerald-500"><Wallet className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-[11px] text-muted-foreground">تعداد کیف پول</p></div>
        </div>
      </div>

      {/* ── جستجو ── */}
      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس نام یا ایمیل کاربر..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
      </div>

      {/* ── فرم افزایش/کاهش موجودی ── */}
      {showForm && (
        <div className="clay-card p-6 space-y-4 relative z-20">
          <h3 className="font-bold text-sm">افزایش / کاهش موجودی کیف پول</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">انتخاب کاربر *</label>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
                <option value="">انتخاب کاربر...</option>
                {users?.map((u: any) => <option key={u._id} value={u._id}>{u.name || u.email || u._id}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">مبلغ (تومان) * — منفی = کاهش</label>
              <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="مبلغ مثبت یا منفی" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">توضیحات</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیح تراکنش" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAddBalance} className="clay-button px-5 py-2 text-sm font-semibold">
              {amount >= 0 ? "افزایش موجودی" : "کاهش موجودی"}
            </button>
            <button onClick={() => { setShowForm(false); setSelectedUserId(""); setAmount(0); setDescription(""); }} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
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
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">کاربر</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">موجودی (تومان)</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">امتیازات</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground text-xs">کیف پولی یافت نشد.</td></tr>
              ) : paginated.map((w: any, i: number) => (
                <tr key={w._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="p-3 text-center text-xs font-medium">{getUserName(w.userId)}</td>
                  <td className="p-3 text-center text-xs font-bold text-emerald-600">{(w.balance || 0).toLocaleString("fa-IR")}</td>
                  <td className="p-3 text-center text-xs font-bold text-amber-600">{(w.points || 0).toLocaleString("fa-IR")}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditWallet(w); setSelectedUserId(w.userId); setAmount(0); setDescription(""); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="افزایش/کاهش">
                        <Edit3 className="h-3.5 w-3.5 text-primary" />
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
