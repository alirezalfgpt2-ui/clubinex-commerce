import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PERMISSIONS, PERMISSION_GROUPS, ROLES_FA } from "@/config/constants";
import { Shield, Plus, Trash2, ChevronLeft, ChevronRight, Check, X, Edit3 } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 15;

export default function RoleListPage() {
  const roles = useQuery(api.roles.list);
  const createRole = useMutation(api.roles.create);
  const updateRole = useMutation(api.roles.update);
  const removeRole = useMutation(api.roles.remove);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const resetForm = () => {
    setName(""); setNameFa(""); setSelectedPermissions([]); setEditId(null); setExpandedGroup(null);
  };

  const startEdit = (role: any) => {
    setEditId(role._id);
    setName(role.name);
    setNameFa(role.nameFa);
    setSelectedPermissions(role.permissions || []);
    setShowForm(true);
  };

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const toggleGroup = (group: string) => {
    const groupPerms = PERMISSIONS.filter((p) => p.group === group).map((p) => p.key);
    const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPerms.includes(p)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...groupPerms])]);
    }
  };

  const selectAll = () => setSelectedPermissions(PERMISSIONS.map((p) => p.key));
  const clearAll = () => setSelectedPermissions([]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("نام انگلیسی نقش را وارد کنید."); return; }
    if (!nameFa.trim()) { toast.error("نام فارسی نقش را وارد کنید."); return; }
    if (selectedPermissions.length === 0) { toast.error("حداقل یک دسترسی انتخاب کنید."); return; }

    try {
      if (editId) {
        await updateRole({ roleId: editId as any, name: name.trim(), nameFa: nameFa.trim(), permissions: selectedPermissions });
        toast.success("نقش با موفقیت ویرایش شد.");
      } else {
        // Check for duplicate name
        const existing = roles?.find((r: any) => r.name === name.trim());
        if (existing) { toast.error("نقشی با این نام وجود دارد."); return; }

        await createRole({ name: name.trim(), nameFa: nameFa.trim(), permissions: selectedPermissions });
        toast.success("نقش جدید ایجاد شد.");
      }
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "خطا در ذخیره‌سازی.");
    }
  };

  const confirmDialog = useConfirm();
  const handleDelete = async (roleId: string, isSystem: boolean) => {
    if (isSystem) { toast.error("نقش‌های سیستمی قابل حذف نیستند."); return; }
    if (!await confirmDialog({ title: "حذف نقش", message: "آیا از حذف این نقش اطمینان دارید؟", variant: "danger" })) return;
    try {
      await removeRole({ roleId: roleId as any });
      toast.success("نقش حذف شد.");
    } catch (e: any) {
      toast.error(e?.message || "خطا در حذف.");
    }
  };

  const toggleActive = async (roleId: string, currentStatus: boolean) => {
    try {
      await updateRole({ roleId: roleId as any, isActive: !currentStatus });
      toast.success(currentStatus ? "نقش غیرفعال شد." : "نقش فعال شد.");
    } catch (e: any) {
      toast.error(e?.message || "خطا در تغییر وضعیت.");
    }
  };

  const filtered = useMemo(() => {
    if (!roles) return [];
    if (!search) return roles;
    const s = search.toLowerCase();
    return roles.filter((r: any) =>
      r.name.toLowerCase().includes(s) || r.nameFa.includes(s)
    );
  }, [roles, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Permission groups data
  const permissionGroups = useMemo(() => {
    return PERMISSION_GROUPS.map((group) => {
      const perms = PERMISSIONS.filter((p) => p.group === group);
      const selectedCount = perms.filter((p) => selectedPermissions.includes(p.key)).length;
      return { group, perms, selectedCount, allSelected: perms.every((p) => selectedPermissions.includes(p.key)) };
    });
  }, [selectedPermissions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">نقش‌ها و دسترسی‌ها</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} نقش تعریف شده</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="جستجوی نقش..."
            className="clay-input px-3 py-2 text-sm w-48"
          />
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> نقش جدید
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="clay-card p-6 space-y-5 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editId ? "ویرایش نقش" : "ایجاد نقش جدید"}</h3>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 rounded-lg hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نام انگلیسی (کلید)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="مثلاً: editor"
                className="clay-input w-full p-3 text-sm outline-none font-mono"
                disabled={!!editId}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">نام فارسی</label>
              <input
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder="مثلاً: ویرایشگر"
                className="clay-input w-full p-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">دسترسی‌ها ({selectedPermissions.length} از {PERMISSIONS.length})</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[11px] text-primary hover:underline">انتخاب همه</button>
                <span className="text-muted-foreground">|</span>
                <button onClick={clearAll} className="text-[11px] text-rose-500 hover:underline">حذف همه</button>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {permissionGroups.map(({ group, perms, selectedCount, allSelected }) => (
                <div key={group} className="clay-card overflow-hidden">
                  {/* Group header */}
                  <div
                    onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                    className="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleGroup(group); }}
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          allSelected ? "bg-primary border-primary text-white" : "border-border"
                        }`}
                      >
                        {allSelected && <Check className="h-3 w-3" />}
                      </button>
                      <span className="font-medium">{group}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {selectedCount}/{perms.length}
                      </span>
                    </div>
                    <ChevronLeft className={`h-4 w-4 text-muted-foreground transition-transform ${expandedGroup === group ? "rotate-90" : ""}`} />
                  </div>

                  {/* Permissions list */}
                  {expandedGroup === group && (
                    <div className="border-t border-border/50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <label
                          key={perm.key}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedPermissions.includes(perm.key)
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted/50 border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.key)}
                            onChange={() => togglePermission(perm.key)}
                            className="sr-only"
                          />
                          <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            selectedPermissions.includes(perm.key) ? "bg-primary border-primary text-white" : "border-border"
                          }`}>
                            {selectedPermissions.includes(perm.key) && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium">{perm.label}</span>
                            <span className="text-[10px] text-muted-foreground block font-mono">{perm.key}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <button onClick={handleSubmit} className="clay-button px-5 py-2 text-sm font-semibold">
              {editId ? "ذخیره تغییرات" : "ایجاد نقش"}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">نقش</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">نام سیستمی</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">دسترسی‌ها</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">نوع</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">نقشی یافت نشد.</td></tr>
              ) : paginated.map((role: any) => {
                const permCount = role.permissions?.length || 0;
                const groupCount = new Set((role.permissions || []).map((p: string) => PERMISSIONS.find((pp) => pp.key === p)?.group)).size;
                return (
                  <tr key={role._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-sm">{role.nameFa}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{role.name}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(role.permissions || []).slice(0, 4).map((p: string) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                            {PERMISSIONS.find((pp) => pp.key === p)?.label || p}
                          </span>
                        ))}
                        {permCount > 4 && (
                          <span className="text-[10px] text-muted-foreground">+{permCount - 4}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        {permCount} دسترسی در {groupCount} گروه
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleActive(role._id, role.isActive)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                          role.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {role.isActive ? "فعال" : "غیرفعال"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        role.isSystem ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {role.isSystem ? "سیستمی" : "سفارشی"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => startEdit(role)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="ویرایش"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDelete(role._id, role.isSystem)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          </button>
                        )}
                      </div>
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
          <span>صفحه {page} از {totalPages}</span>
          <div className="flex items-center gap-1">
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
          </div>
        </div>
      )}

      {/* Info */}
      <div className="clay-surface p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">💡 راهنمای دسترسی‌ها</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group} className="text-[11px] text-muted-foreground">
              <span className="font-medium">{group}:</span>{" "}
              {PERMISSIONS.filter((p) => p.group === group).map((p) => p.label).join("، ")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
