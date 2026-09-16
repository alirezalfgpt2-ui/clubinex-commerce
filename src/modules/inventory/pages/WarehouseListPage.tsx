/**
 * 🏭 صفحه مدیریت انبارها
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Plus, Edit3, Trash2, Warehouse, MapPin, Phone, Shield } from "lucide-react";

export default function WarehouseListPage() {
  const warehouses = useQuery(api.warehouses.list);
  const createWarehouse = useMutation(api.warehouses.create);
  const updateWarehouse = useMutation(api.warehouses.update);
  const removeWarehouse = useMutation(api.warehouses.remove);
  const confirmDialog = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [editWh, setEditWh] = useState<any>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const resetForm = () => { setName(""); setCode(""); setAddress(""); setPhone(""); };

  const handleCreate = async () => {
    if (!name.trim() || !code.trim()) { toast.error("نام و کد انبار الزامی است."); return; }
    try {
      await createWarehouse({ name, code, address: address || undefined, phone: phone || undefined });
      toast.success("انبار ایجاد شد."); setShowForm(false); resetForm();
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleUpdate = async () => {
    if (!editWh || !editName.trim()) return;
    try {
      await updateWarehouse({ warehouseId: editWh._id, name: editName, address: editAddress || undefined, phone: editPhone || undefined });
      toast.success("انبار بروزرسانی شد."); setEditWh(null);
    } catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف انبار", message: "آیا از حذف این انبار اطمینان دارید؟", variant: "danger" })) return;
    try { await removeWarehouse({ warehouseId: id as any }); toast.success("انبار حذف شد."); }
    catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try { await updateWarehouse({ warehouseId: id as any, isActive: !active }); toast.success(active ? "انبار غیرفعال شد." : "انبار فعال شد."); }
    catch (e: any) { toast.error(e?.message || "خطا."); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مدیریت انبارها</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{(warehouses || []).length} انبار</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> انبار جدید
        </button>
      </div>

      {showForm && (
        <div className="clay-card p-5 space-y-4">
          <h3 className="font-bold text-sm">ایجاد انبار جدید</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-muted-foreground mb-1 block">نام انبار *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلا: انبار مرکزی" className="clay-input w-full p-3 text-sm outline-none" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">کد انبار *</label><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="مثلا: WH-001" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">آدرس</label><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس انبار" className="clay-input w-full p-3 text-sm outline-none" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">تلفن</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="تلفن تماس" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="clay-button px-4 py-2 text-sm font-semibold">ایجاد</button>
            <button onClick={() => setShowForm(false)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        </div>
      )}

      {!warehouses ? (
        <div className="clay-card p-12 text-center text-muted-foreground text-xs">در حال بارگذاری...</div>
      ) : warehouses.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <Warehouse className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">هنوز انباری تعریف نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((w: any) => (
            <div key={w._id} className="clay-card p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Warehouse className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{w.name}</p>
                    <p className="text-[10px] text-muted-foreground" dir="ltr">{w.code}</p>
                  </div>
                </div>
                <button onClick={() => handleToggleActive(w._id, w.isActive)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${w.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {w.isActive ? "فعال" : "غیرفعال"}
                </button>
              </div>
              {w.address && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span className="line-clamp-2">{w.address}</span>
                </div>
              )}
              {w.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" /><span dir="ltr">{w.phone}</span>
                </div>
              )}
              <div className="flex gap-1 pt-1 border-t border-border/50">
                <button onClick={() => { setEditWh(w); setEditName(w.name); setEditCode(w.code); setEditAddress(w.address || ""); setEditPhone(w.phone || ""); }} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg hover:bg-muted transition-colors"><Edit3 className="h-3 w-3" /> ویرایش</button>
                <button onClick={() => handleDelete(w._id)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"><Trash2 className="h-3 w-3" /> حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editWh && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditWh(null)}>
          <div className="bg-background rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-sm">ویرایش انبار</h3>
            <div><label className="text-xs text-muted-foreground mb-1 block">نام</label><input value={editName} onChange={(e) => setEditName(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">کد</label><input value={editCode} onChange={(e) => setEditCode(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" dir="ltr" disabled /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">آدرس</label><input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">تلفن</label><input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" dir="ltr" /></div>
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="clay-button px-4 py-2 text-sm font-semibold">ذخیره</button>
              <button onClick={() => setEditWh(null)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
