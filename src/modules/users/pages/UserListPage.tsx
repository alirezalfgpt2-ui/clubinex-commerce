/**
 * 👥 صفحه مدیریت کاربران — نسخه حرفه‌ای
 * — خلاصه آمار در بالا
 * — جدول حرفه‌ای با آواتار
 * — ویرایش کامل، تغییر نقش، بلاک/فعال
 * — ریست رمز عبور
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Search, Edit3, Key, Shield, ShieldOff, UserPlus, Users, UserCheck, UserX, Crown, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 15;

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  admin: { label: "مدیر کل", color: "bg-purple-100 text-purple-700" },
  manager: { label: "مدیر فروش", color: "bg-blue-100 text-blue-700" },
  operator: { label: "اپراتور", color: "bg-sky-100 text-sky-700" },
  representative: { label: "نماینده فروش", color: "bg-amber-100 text-amber-700" },
  user: { label: "کاربر عادی", color: "bg-gray-100 text-gray-600" },
  member: { label: "عضو", color: "bg-emerald-100 text-emerald-700" },
};

export default function UserListPage() {
  const users = useQuery(api.users.list);
  const updateRole = useMutation(api.users.updateRole);
  const toggleActive = useMutation(api.users.toggleActive);
  const resetUserPassword = useMutation(api.users.resetUserPassword);
  const adminUpdateUser = useMutation(api.users.adminUpdateUser);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const confirmDialog = useConfirm();

  // ── آمار ──
  const stats = useMemo(() => {
    const list = users || [];
    return {
      total: list.length,
      active: list.filter((u: any) => u.isActive !== false).length,
      blocked: list.filter((u: any) => u.isActive === false).length,
      admins: list.filter((u: any) => ["admin", "manager"].includes(u.role)).length,
    };
  }, [users]);

  // ── فیلتر ──
  const filtered = useMemo(() => {
    let list = users || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u: any) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q) ||
        (u.nationalCode || "").includes(q)
      );
    }
    return list;
  }, [users, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // ── عملیات ──
  const handleRoleChange = async (userId: string, role: string) => {
    try { await updateRole({ userId: userId as any, role }); toast.success("نقش تغییر کرد."); }
    catch { toast.error("خطا."); }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const action = currentActive !== false ? "بلاک" : "فعال‌سازی";
    if (!await confirmDialog({ title: `${action} کاربر`, message: `آیا از ${action} این کاربر اطمینان دارید؟`, variant: currentActive !== false ? "danger" : "warning" })) return;
    try { await toggleActive({ userId: userId as any }); toast.success(`کاربر ${action} شد.`); }
    catch { toast.error("خطا."); }
  };

  const handleEditSave = async () => {
    if (!editUser || !editName.trim()) { toast.error("نام الزامی است."); return; }
    try {
      await adminUpdateUser({ userId: editUser._id, name: editName, role: editRole || undefined });
      toast.success("کاربر ویرایش شد.");
      setEditUser(null);
    } catch { toast.error("خطا در ویرایش."); }
  };

  const handlePasswordReset = async () => {
    if (!resetUserId) return;
    try { await resetUserPassword({ userId: resetUserId as any }); toast.success("بازنشانی رمز ارسال شد."); setResetUserId(null); }
    catch { toast.error("خطا."); }
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مدیریت کاربران</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} کاربر</p>
        </div>
      </div>

      {/* ── آمار ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="کل کاربران" value={stats.total} color="text-primary" />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="فعال" value={stats.active} color="text-emerald-500" />
        <StatCard icon={<UserX className="h-5 w-5" />} label="بلاک شده" value={stats.blocked} color="text-rose-500" />
        <StatCard icon={<Crown className="h-5 w-5" />} label="مدیران" value={stats.admins} color="text-purple-500" />
      </div>

      {/* ── جستجو ── */}
      <div className="clay-card p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس نام، ایمیل، تلفن یا کد ملی..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
      </div>

      {/* ── جدول ── */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-center text-xs font-medium text-muted-foreground w-8">#</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">کاربر</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">ایمیل</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">تلفن</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">نقش</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">کاربری یافت نشد.</td></tr>
              ) : paginated.map((u: any, i: number) => {
                const roleMeta = ROLE_MAP[u.role] || ROLE_MAP.user;
                return (
                  <tr key={u._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5 justify-center">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-background" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                            {(u.name || "ک")[0]}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-xs block">{u.name || "—"}</span>
                          {u.nationalCode && <span className="text-[10px] text-muted-foreground" dir="ltr">{u.nationalCode}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center text-xs" dir="ltr">{u.email || "—"}</td>
                    <td className="p-3 text-center text-xs" dir="ltr">{u.phone || "—"}</td>
                    <td className="p-3 text-center">
                      <select value={u.role || "user"} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="clay-input px-2 py-1 text-[10px] outline-none">
                        {Object.entries(ROLE_MAP).map(([val, meta]) => <option key={val} value={val}>{meta.label}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleActive(u._id, u.isActive)} className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${u.isActive !== false ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`}>
                        {u.isActive !== false ? "فعال" : "بلاک"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditUser(u); setEditName(u.name || ""); setEditRole(u.role || "user"); setEditPhone(u.phone || ""); setEditEmail(u.email || ""); }} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="پروفایل و ویرایش"><Eye className="h-3.5 w-3.5 text-primary" /></button>
                        <button onClick={() => { setResetUserId(u._id); }} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors" title="تغییر رمز"><Key className="h-3.5 w-3.5 text-amber-600" /></button>
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

      {/* ── مودال جزئیات کاربر ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditUser(null)}>
          <div className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* هدر پروفایل */}
            <div className="flex items-center gap-4">
              {editUser.avatar ? <img src={editUser.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20" /> : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl font-bold text-primary">{(editUser.name || "ک")[0]}</div>}
              <div>
                <h3 className="font-bold text-lg">{editUser.name || "بدون نام"}</h3>
                <p className="text-xs text-muted-foreground" dir="ltr">{editUser.email || "—"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${editUser.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{editUser.isActive !== false ? "فعال" : "بلاک"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${(ROLE_MAP[editUser.role] || ROLE_MAP.user).color}`}>{(ROLE_MAP[editUser.role] || ROLE_MAP.user).label}</span>
                </div>
              </div>
            </div>

            {/* اطلاعات شخصی */}
            <div className="clay-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground">اطلاعات شخصی</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">نام:</span><p className="font-medium mt-0.5">{editUser.name || "—"}</p></div>
                <div><span className="text-muted-foreground">ایمیل:</span><p className="font-medium mt-0.5" dir="ltr">{editUser.email || "—"}</p></div>
                <div><span className="text-muted-foreground">تلفن:</span><p className="font-medium mt-0.5" dir="ltr">{editUser.phone || "—"}</p></div>
                <div><span className="text-muted-foreground">کد ملی:</span><p className="font-medium mt-0.5" dir="ltr">{editUser.nationalCode || "—"}</p></div>
                <div><span className="text-muted-foreground">کد پستی:</span><p className="font-medium mt-0.5" dir="ltr">{editUser.postalCode || "—"}</p></div>
                <div><span className="text-muted-foreground">جنسیت:</span><p className="font-medium mt-0.5">{editUser.gender === "male" ? "مرد" : editUser.gender === "female" ? "زن" : "—"}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">آدرس:</span><p className="font-medium mt-0.5">{editUser.address || "—"}</p></div>
              </div>
            </div>

            {/* ویرایش سریع */}
            <div className="clay-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground">ویرایش سریع</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] text-muted-foreground mb-1 block">نام</label><input value={editName} onChange={(e) => setEditName(e.target.value)} className="clay-input w-full px-3 py-2 text-xs outline-none" /></div>
                <div><label className="text-[11px] text-muted-foreground mb-1 block">نقش</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="clay-input w-full px-3 py-2 text-xs outline-none">
                    {Object.entries(ROLE_MAP).map(([val, meta]) => <option key={val} value={val}>{meta.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* اقدامات */}
            <div className="flex gap-2">
              <button onClick={handleEditSave} className="clay-button px-4 py-2 text-sm font-semibold flex-1">ذخیره تغییرات</button>
              <button onClick={() => { setResetUserId(editUser._id); setEditUser(null); }} className="clay-button px-4 py-2 text-sm bg-amber-50 text-amber-700">ریست رمز</button>
              <button onClick={() => handleToggleActive(editUser._id, editUser.isActive)} className={`clay-button px-4 py-2 text-sm ${editUser.isActive !== false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{editUser.isActive !== false ? "بلاک" : "فعال‌سازی"}</button>
              <button onClick={() => setEditUser(null)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">بستن</button>
            </div>
          </div>
        </div>
      )}

      {/* ── مودال ریست رمز ── */}
      {resetUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setResetUserId(null)}>
          <div className="bg-background rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-sm">بازنشانی رمز عبور</h3>
            <p className="text-xs text-muted-foreground">لینک بازنشانی به ایمیل کاربر ارسال می‌شود.</p>
            <div className="flex gap-2">
              <button onClick={handlePasswordReset} className="clay-button px-4 py-2 text-sm font-semibold">ارسال لینک</button>
              <button onClick={() => setResetUserId(null)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
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
