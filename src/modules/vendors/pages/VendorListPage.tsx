/**
 * 🏪 صفحه مدیریت فروشندگان — نسخه کامل CRUD
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Store, Star, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 15;

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "فعال", color: "bg-emerald-100 text-emerald-700" },
  suspended: { label: "معلق", color: "bg-rose-100 text-rose-700" },
  pending: { label: "در انتظار تایید", color: "bg-amber-100 text-amber-700" },
};

export default function VendorListPage() {
  const vendors = useQuery(api.vendors.listAll, {});
  const createVendor = useMutation(api.vendors.register);
  const updateVendor = useMutation(api.vendors.update);
  const updateStatus = useMutation(api.vendors.updateStatus);
  const updateCommission = useMutation(api.vendors.updateCommission);
  const removeVendor = useMutation(api.vendors.remove);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editVendor, setEditVendor] = useState<any>(null);
  const confirmDialog = useConfirm();

  // Form state
  const [storeName, setStoreName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [commissionRate, setCommissionRate] = useState(10);

  const resetForm = () => {
    setStoreName(""); setContactName(""); setPhone(""); setAddress(""); setCommissionRate(10);
  };

  // ── آمار ──
  const stats = useMemo(() => {
    const list = vendors || [];
    return {
      total: list.length,
      active: list.filter((v: any) => v.status === "active").length,
      pending: list.filter((v: any) => v.status === "pending").length,
      suspended: list.filter((v: any) => v.status === "suspended").length,
    };
  }, [vendors]);

  // ── فیلتر ──
  const filtered = useMemo(() => {
    let list = vendors || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((v: any) =>
        (v.storeName || "").toLowerCase().includes(q) ||
        (v.contactName || "").toLowerCase().includes(q) ||
        (v.phone || "").includes(q)
      );
    }
    return list;
  }, [vendors, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // ── عملیات ──
  const handleCreate = async () => {
    if (!storeName.trim()) { toast.error("نام فروشگاه الزامی است."); return; }
    try {
      await createVendor({
        storeName: storeName.trim(),
        contactName: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        commissionRate,
      });
      toast.success("فروشنده ثبت شد.");
      setShowForm(false);
      resetForm();
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleStatusUpdate = async (vendorId: string, status: "active" | "suspended" | "pending") => {
    try {
      await updateStatus({ vendorId: vendorId as any, status });
      toast.success(`وضعیت فروشنده به «${statusConfig[status]?.label}» تغییر کرد.`);
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleCommissionUpdate = async (vendorId: string, rate: number) => {
    try {
      await updateCommission({ vendorId: vendorId as any, commissionRate: rate });
      toast.success("کمیسیون بروزرسانی شد.");
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleDelete = async (vendorId: string, name: string) => {
    if (!await confirmDialog({ title: "حذف فروشنده", message: `آیا از حذف فروشنده «${name}» اطمینان دارید؟`, variant: "danger" })) return;
    try {
      await removeVendor({ vendorId: vendorId as any });
      toast.success("فروشنده حذف شد.");
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  return (
    <div className="space-y-5">
      {/* ── هدر ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مدیریت فروشندگان</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} فروشنده</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> فروشنده جدید
        </button>
      </div>

      {/* ── آمار ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Store className="h-5 w-5" />} label="کل فروشندگان" value={stats.total} color="text-primary" />
        <StatCard icon={<Star className="h-5 w-5" />} label="فعال" value={stats.active} color="text-emerald-500" />
        <StatCard icon={<Shield className="h-5 w-5" />} label="در انتظار" value={stats.pending} color="text-amber-500" />
        <StatCard icon={<X className="h-5 w-5" />} label="معلق" value={stats.suspended} color="text-rose-500" />
      </div>

      {/* ── جستجو ── */}
      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس نام فروشگاه، تماس‌گیرنده یا تلفن..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
      </div>

      {/* ── فرم ایجاد/ویرایش ── */}
      {showForm && (
        <div className="clay-card p-6 space-y-4 relative z-20">
          <h3 className="font-bold text-sm">افزودن فروشنده جدید</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نام فروشگاه *</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="نام فروشگاه" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نام تماس</label>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="نام شخص تماس" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">تلفن</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره تلفن" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">آدرس</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس فروشگاه" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">کمیسیون (٪)</label>
              <input type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} min={0} max={50} className="clay-input w-full p-3 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleCreate} className="clay-button px-5 py-2 text-sm font-semibold">ثبت فروشنده</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
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
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">فروشگاه</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تماس</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تلفن</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">کمیسیون</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تاریخ ثبت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-muted-foreground text-xs">فروشنده‌ای یافت نشد.</td></tr>
              ) : paginated.map((v: any, i: number) => {
                const cfg = statusConfig[v.status] ?? statusConfig.pending;
                return (
                  <tr key={v._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5 justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Store className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-xs">{v.storeName || "—"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-xs">{v.contactName || "—"}</td>
                    <td className="p-3 text-center text-xs" dir="ltr">{v.phone || "—"}</td>
                    <td className="p-3 text-center text-xs font-medium">{v.commissionRate || 0}٪</td>
                    <td className="p-3 text-center">
                      <select value={v.status} onChange={(e) => handleStatusUpdate(v._id, e.target.value as any)} className="clay-input px-2 py-1 text-[10px] outline-none">
                        <option value="active">فعال</option>
                        <option value="pending">در انتظار</option>
                        <option value="suspended">معلق</option>
                      </select>
                    </td>
                    <td className="p-3 text-center text-xs">{new Date(v.createdAt).toLocaleDateString("fa-IR")}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditVendor(v); setStoreName(v.storeName || ""); setContactName(v.contactName || ""); setPhone(v.phone || ""); setAddress(v.address || ""); setCommissionRate(v.commissionRate || 10); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="ویرایش">
                          <Edit3 className="h-3.5 w-3.5 text-primary" />
                        </button>
                        <button onClick={() => handleCommissionUpdate(v._id, v.commissionRate || 10)} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors" title="کمیسیون">
                          <Shield className="h-3.5 w-3.5 text-amber-600" />
                        </button>
                        <button onClick={() => handleDelete(v._id, v.storeName)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="حذف">
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </button>
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
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>;
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* ── مودال ویرایش ── */}
      {editVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditVendor(null)}>
          <div className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">ویرایش فروشنده</h3>
              <button onClick={() => setEditVendor(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">نام فروشگاه</label>
                <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="clay-input w-full px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">نام تماس</label>
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="clay-input w-full px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">تلفن</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="clay-input w-full px-3 py-2 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">آدرس</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="clay-input w-full px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">کمیسیون (٪)</label>
                <input type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} min={0} max={50} className="clay-input w-full px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={async () => {
                if (!storeName.trim()) { toast.error("نام فروشگاه الزامی است."); return; }
                try {
                  await updateVendor({
                    vendorId: editVendor._id,
                    storeName: storeName.trim(),
                    contactName: contactName.trim() || undefined,
                    phone: phone.trim() || undefined,
                    address: address.trim() || undefined,
                    commissionRate,
                  });
                  toast.success("فروشنده بروزرسانی شد.");
                  setEditVendor(null);
                  resetForm();
                } catch (e: any) { toast.error(e?.message || "خطا."); }
              }} className="clay-button px-4 py-2 text-sm font-semibold flex-1">ذخیره تغییرات</button>
              <button onClick={() => { setEditVendor(null); resetForm(); }} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">بستن</button>
            </div>
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
