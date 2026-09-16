/**
 * 🛒 صفحه مدیریت سفارشات — نسخه حرفه‌ای
 * — خلاصه وضعیت‌ها در بالا
 * — فیلتر دپارتمان
 * — طراحی مدرن با clay-card
 * — مودال جزئیات کامل
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, Package, Printer, RotateCcw, ShoppingCart, CreditCard, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatJalaliDate } from "@/lib/jalali";
import { ORDER_STATUSES } from "@/config/constants";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 15;

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: "در انتظار", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock className="h-4 w-4" /> },
  paid: { label: "پرداخت شده", color: "text-sky-700", bg: "bg-sky-50 border-sky-200", icon: <CreditCard className="h-4 w-4" /> },
  processing: { label: "در حال پردازش", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", icon: <Package className="h-4 w-4" /> },
  shipped: { label: "ارسال شده", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: <Truck className="h-4 w-4" /> },
  delivered: { label: "تحویل شده", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: "لغو شده", color: "text-rose-700", bg: "bg-rose-50 border-rose-200", icon: <XCircle className="h-4 w-4" /> },
};

type SortKey = "orderNumber" | "total" | "createdAt" | "status";

export default function OrderListPage() {
  const orders = useQuery(api.orders.list);
  const updateStatus = useMutation(api.orders.updateStatus);
  const departments = useQuery(api.settings.get, { key: "departments" });
  const deptList = (departments?.value as { id: string; name: string; color: string }[]) || [];

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const confirmDialog = useConfirm();

  // ── خلاصه وضعیت‌ها ──
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (orders || []).forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return (orders || []).filter((o: any) => o.status !== "cancelled").reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  }, [orders]);

  // ── فیلتر و مرتب‌سازی ──
  const filtered = useMemo(() => {
    let list = orders || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o: any) => o.orderNumber.toLowerCase().includes(q) || o.address?.toLowerCase().includes(q));
    }
    if (statusFilter) list = list.filter((o: any) => o.status === statusFilter);
    if (deptFilter) list = list.filter((o: any) => o.department === deptFilter);
    list.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case "orderNumber": cmp = a.orderNumber.localeCompare(b.orderNumber); break;
        case "total": cmp = a.total - b.total; break;
        case "createdAt": cmp = a.createdAt - b.createdAt; break;
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [orders, search, sortKey, sortAsc, statusFilter, deptFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus({ orderId: orderId as any, status: status as any });
      toast.success("وضعیت سفارش تغییر کرد.");
    } catch { toast.error("خطا در تغییر وضعیت."); }
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">سفارشات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} سفارش · درآمد کل: {totalRevenue.toLocaleString("fa-IR")} تومان</p>
      </div>

      {/* ── خلاصه وضعیت‌ها ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_MAP).map(([key, meta]) => (
          <button key={key} onClick={() => { setStatusFilter(statusFilter === key ? "" : key); setPage(1); }} className={`clay-card p-3 text-center transition-all hover:-translate-y-0.5 ${statusFilter === key ? meta.bg + " border-2" : "hover:bg-muted/30"}`}>
            <div className={`flex justify-center mb-1 ${meta.color}`}>{meta.icon}</div>
            <p className="text-lg font-bold">{statusCounts[key] || 0}</p>
            <p className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</p>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="clay-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجوی شماره سفارش یا آدرس..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="clay-input h-9 px-3 text-sm outline-none min-w-[130px]">
          <option value="">همه وضعیت‌ها</option>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="clay-input h-9 px-3 text-sm outline-none min-w-[130px]">
          <option value="">همه دپارتمان‌ها</option>
          {deptList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* ── جدول ── */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {[
                  { key: "orderNumber" as SortKey, label: "شماره", w: "" },
                  { key: "total" as SortKey, label: "مبلغ", w: "" },
                  { key: "createdAt" as SortKey, label: "تاریخ", w: "" },
                  { key: "status" as SortKey, label: "وضعیت", w: "" },
                  { key: null, label: "دپارتمان", w: "" },
                  { key: null, label: "تغییر وضعیت", w: "" },
                  { key: null, label: "عملیات", w: "w-20" },
                ].map((col) => (
                  <th key={col.label} className={`p-3 text-right text-xs font-medium text-muted-foreground ${col.key ? "cursor-pointer hover:text-foreground select-none" : ""} ${col.w}`} onClick={() => col.key && handleSort(col.key)}>
                    <span className="inline-flex items-center gap-1">{col.label}{col.key && (sortKey === col.key ? (sortAsc ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">سفارشی یافت نشد.</td></tr>
              ) : paginated.map((o: any) => {
                const meta = STATUS_MAP[o.status];
                return (
                  <tr key={o._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-xs font-medium">{o.orderNumber}</td>
                    <td className="p-3 text-xs font-bold">{o.total.toLocaleString("fa-IR")} ت</td>
                    <td className="p-3 text-xs text-muted-foreground">{formatJalaliDate(o.createdAt)}</td>
                    <td className="p-3"><span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${meta?.color || ""} ${meta?.bg || ""}`}>{meta?.label || o.status}</span></td>
                    <td className="p-3 text-xs text-muted-foreground">{deptList.find((d) => d.id === o.department)?.name || "—"}</td>
                    <td className="p-3 text-center">
                      <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)} className="clay-input px-2 py-1 text-[10px] outline-none">
                        {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedOrder(o)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="جزئیات"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <Link to={`/dashboard/orders/${o._id}/invoice`} target="_blank" className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="فاکتور"><Printer className="h-3.5 w-3.5 text-muted-foreground" /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── صفحه‌بندی ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>صفحه {page} از {totalPages} — {filtered.length} رکورد</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page <= 1} className="px-2 py-1 rounded-lg hover:bg-muted disabled:opacity-30">اول</button>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>;
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="px-2 py-1 rounded-lg hover:bg-muted disabled:opacity-30">آخر</button>
          </div>
        </div>
      )}

      {/* ── مودال جزئیات ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">جزئیات سفارش {selectedOrder.orderNumber}</h3>
              <div className="flex items-center gap-2">
                <Link to={`/dashboard/orders/${selectedOrder._id}/invoice`} target="_blank" className="clay-button px-3 py-1.5 text-xs flex items-center gap-1"><Printer className="h-3 w-3" /> چاپ فاکتور</Link>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground text-xs">بستن ✕</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-muted-foreground">شماره:</span><p className="font-mono font-bold">{selectedOrder.orderNumber}</p></div>
              <div><span className="text-muted-foreground">تاریخ:</span><p>{formatJalaliDate(selectedOrder.createdAt)}</p></div>
              <div><span className="text-muted-foreground">وضعیت:</span><p><span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_MAP[selectedOrder.status]?.color || ""}`}>{STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}</span></p></div>
              <div><span className="text-muted-foreground">مبلغ:</span><p className="font-bold">{selectedOrder.total.toLocaleString("fa-IR")} تومان</p></div>
              <div className="col-span-2"><span className="text-muted-foreground">آدرس:</span><p>{selectedOrder.address}</p></div>
              {selectedOrder.postalCode && <div><span className="text-muted-foreground">کد پستی:</span><p dir="ltr">{selectedOrder.postalCode}</p></div>}
              {selectedOrder.notes && <div className="col-span-2"><span className="text-muted-foreground">یادداشت:</span><p>{selectedOrder.notes}</p></div>}
            </div>
            <div>
              <h4 className="font-semibold text-xs mb-2">اقلام سفارش</h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl text-xs">
                    <div className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{item.name}</span><span className="text-muted-foreground">× {item.quantity}</span></div>
                    <span className="font-bold">{(item.total || item.price * item.quantity).toLocaleString("fa-IR")} ت</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">جمع:</span><span>{selectedOrder.subtotal?.toLocaleString("fa-IR")} تومان</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">مالیات:</span><span>{selectedOrder.tax?.toLocaleString("fa-IR")} تومان</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ارسال:</span><span>{selectedOrder.shippingCost?.toLocaleString("fa-IR") || "رایگان"} تومان</span></div>
              {selectedOrder.discount > 0 && <div className="flex justify-between text-rose-600"><span>تخفیف:</span><span>-{selectedOrder.discount.toLocaleString("fa-IR")} تومان</span></div>}
              <div className="flex justify-between font-bold border-t pt-1"><span>نهایی:</span><span>{selectedOrder.total.toLocaleString("fa-IR")} تومان</span></div>
            </div>
            {selectedOrder.paymentStatus === "paid" && selectedOrder.status !== "cancelled" && (
              <div className="border-t pt-3">
                <button onClick={async () => {
                  if (!await confirmDialog({ title: "بازپرداخت", message: `آیا از بازپرداخت سفارش ${selectedOrder.orderNumber} اطمینان دارید؟`, variant: "danger" })) return;
                  try { await updateStatus({ orderId: selectedOrder._id, status: "cancelled" }); toast.success("بازپرداخت ثبت شد."); setSelectedOrder(null); } catch (err: any) { toast.error(err.message || "خطا."); }
                }} className="clay-button w-full py-2 text-xs font-semibold flex items-center justify-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">
                  <RotateCcw className="h-3.5 w-3.5" /> بازپرداخت
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
