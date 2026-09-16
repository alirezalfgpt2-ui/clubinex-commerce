import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Plus, Calendar, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Clock, Info } from "lucide-react";
import { toast } from "sonner";
import { JalaliDatePicker } from "@/modules/shared/ui/JalaliDatePicker";
import { formatJalaliDate, parseJalaliString } from "@/lib/jalali";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 15;

type SortKey = "date" | "time" | "customerName" | "service" | "status";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "در انتظار", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "تأیید شده", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "انجام شده", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "لغو شده", color: "bg-rose-100 text-rose-700" },
};

const SERVICE_MAP: Record<string, string> = {
  consultation: "مشاوره",
  meeting: "ملاقات حضوری",
  phone: "مشاوره تلفنی",
  service: "خدمات فنی",
};

export default function BookingListPage() {
  const bookings = useQuery(api.bookings.list);
  const createBooking = useMutation(api.bookings.create);
  const updateStatus = useMutation(api.bookings.updateStatus);
  const removeBooking = useMutation(api.bookings.remove);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [service, setService] = useState("consultation");

  const resetForm = () => {
    setDate(""); setTime(""); setDescription(""); setName(""); setService("consultation");
  };

  const handleCreate = async () => {
    if (!date || !time) { toast.error("لطفاً تاریخ و ساعت را انتخاب کنید."); return; }
    try {
      const dateTs = date ? (parseJalaliString(date)?.getTime() ?? Date.now()) : Date.now();
      await createBooking({ service, date: dateTs, time, description, customerName: name });
      toast.success("نوبت با موفقیت ثبت شد.");
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "خطا در رزرو.");
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateStatus({ bookingId: bookingId as any, status: newStatus as any });
      const statusLabel = STATUS_MAP[newStatus]?.label || newStatus;
      toast.success(`وضعیت به «${statusLabel}» تغییر کرد.`);
    } catch (e: any) {
      toast.error(e?.message || "خطا در تغییر وضعیت.");
    }
  };

  const confirmDialog = useConfirm();
  const handleDelete = async (bookingId: string) => {
    if (!await confirmDialog({ title: "حذف نوبت", message: "آیا از حذف این نوبت اطمینان دارید؟", variant: "danger" })) return;
    try {
      await removeBooking({ bookingId: bookingId as any });
      toast.success("نوبت حذف شد.");
    } catch (e: any) {
      toast.error(e?.message || "خطا در حذف.");
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortAsc ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  const filtered = useMemo(() => {
    const list = (bookings || []).filter((b: any) => {
      const matchSearch = !search || 
        (b.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.service || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.description || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || b.status === filterStatus;
      return matchSearch && matchStatus;
    });
    list.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case "date": cmp = (a.date || 0) - (b.date || 0); break;
        case "time": cmp = (a.time || "").localeCompare(b.time || ""); break;
        case "customerName": cmp = (a.customerName || "").localeCompare(b.customerName || ""); break;
        case "service": cmp = (a.service || "").localeCompare(b.service || ""); break;
        case "status": cmp = (a.status || "").localeCompare(b.status || ""); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [bookings, search, filterStatus, sortKey, sortAsc]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">نوبت‌دهی و رزرو</h1>
        <p className="text-sm text-muted-foreground mt-0.5">رزرو زمان برای ملاقات، مشاوره یا خدمات</p>
        <div className="clay-surface p-3 mt-2 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            از طریق این بخش می‌توانید برای ملاقات حضوری، مشاوره تلفنی یا هر نوع خدمات زمان‌بندی‌شده، نوبت رزرو کنید.
            وضعیت هر نوبت را می‌توانید تغییر دهید و در صورت نیاز، یادآوری خودکار در تاریخ و ساعت رزرو ارسال می‌شود.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="جستجو..."
              className="clay-input pl-3 pr-8 py-2 text-sm w-48"
            />
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="clay-input px-3 py-2 text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="confirmed">تأیید شده</option>
            <option value="completed">انجام شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
          <span className="text-xs text-muted-foreground">{filtered.length} نوبت</span>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> {showForm ? "بستن" : "رزرو جدید"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="clay-card p-6 space-y-4 relative z-10">
          <h3 className="font-bold text-sm">ثبت رزرو جدید</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نام مراجعه‌کننده</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام کامل" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نوع خدمت</label>
              <select value={service} onChange={(e) => setService(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
                {Object.entries(SERVICE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="relative z-30">
              <JalaliDatePicker label="تاریخ رزرو" value={date} onChange={setDate} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ساعت رزرو</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" />
              {time && <p className="text-[11px] text-muted-foreground mt-1">⏰ ساعت انتخابی: {time}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">توضیحات (اختیاری)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="موضوع ملاقات..." className="clay-input w-full p-3 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="clay-button px-4 py-2 text-sm font-semibold">ثبت رزرو</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("date")}>
                  <span className="inline-flex items-center gap-1">تاریخ <SortIcon col="date" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("time")}>
                  <span className="inline-flex items-center gap-1">ساعت <SortIcon col="time" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("customerName")}>
                  <span className="inline-flex items-center gap-1">نام <SortIcon col="customerName" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("service")}>
                  <span className="inline-flex items-center gap-1">خدمت <SortIcon col="service" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">توضیحات</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("status")}>
                  <span className="inline-flex items-center gap-1 justify-center">وضعیت <SortIcon col="status" /></span>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">نوبتی یافت نشد.</td></tr>
              ) : paginated.map((b: any) => {
                const status = STATUS_MAP[b.status] || STATUS_MAP.pending;
                const nextStatuses = ["pending", "confirmed", "completed", "cancelled"].filter(s => s !== b.status);
                return (
                  <tr key={b._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-xs">{b.date ? formatJalaliDate(b.date) : "—"}</td>
                    <td className="p-3 text-xs font-mono font-medium">{b.time || "—"}</td>
                    <td className="p-3 text-xs font-medium">{b.customerName || "—"}</td>
                    <td className="p-3 text-xs">{SERVICE_MAP[b.service] || b.service}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">{b.description || b.notes || "—"}</td>
                    <td className="p-3 text-center">
                      <div className="relative group inline-block">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium cursor-pointer ${status.color}`}>
                          {status.label}
                        </span>
                        {/* Dropdown on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block z-40">
                          <div className="bg-card border border-border rounded-xl shadow-xl py-1 min-w-[140px]">
                            {nextStatuses.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(b._id, s)}
                                className="w-full px-3 py-2 text-xs text-right hover:bg-muted transition-colors flex items-center gap-2"
                              >
                                <span className={`h-2 w-2 rounded-full ${STATUS_MAP[s].color.split(" ")[0]}`} />
                                {STATUS_MAP[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="حذف">
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground py-2">
          <span>صفحه {page} از {totalPages} — مجموع {filtered.length} ردیف</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page <= 1} className="px-2 py-1 rounded-lg hover:bg-muted disabled:opacity-30 text-xs">اول</button>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)} className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${page === pageNum ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="px-2 py-1 rounded-lg hover:bg-muted disabled:opacity-30 text-xs">آخر</button>
          </div>
        </div>
      )}
    </div>
  );
}
