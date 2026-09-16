/**
 * 🚚 صفحه مدیریت روش‌های ارسال — با آیکون و تصویر
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const PRESET_ICONS = [
  { emoji: "🚗", label: "خودرو/پیک" },
  { emoji: "📦", label: "بسته‌پستی" },
  { emoji: "✈️", label: "هوایی" },
  { emoji: "🚚", label: "کامیون/باربری" },
  { emoji: "🏍️", label: "موتور" },
  { emoji: "🏠", label: "حضوری" },
  { emoji: "⚡", label: "فوری" },
  { emoji: "🚂", label: "قطار" },
  { emoji: "🏬", label: "فروشگاه" },
  { emoji: "🌐", label: "بین‌المللی" },
];

const SHIPPING_TYPES = [
  { value: "pickup", label: "حضوری" },
  { value: "post", label: "پست پیشتاز" },
  { value: "courier", label: "پیک موتوری" },
  { value: "express", label: "تیپاکس/چاپار/اسنپ‌باکس" },
];

export default function ShippingListPage() {
  const methods = useQuery(api.shipping.list);
  const createMethod = useMutation(api.shipping.create);
  const updateMethod = useMutation(api.shipping.update);
  const removeMethod = useMutation(api.shipping.remove);
  const confirmDialog = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [type, setType] = useState("post");
  const [cost, setCost] = useState(0);
  const [freeShippingMin, setFreeShippingMin] = useState(0);
  const [regions, setRegions] = useState("");
  const [weightBased, setWeightBased] = useState(false);
  const [baseWeightCost, setBaseWeightCost] = useState(0);
  const [perKgCost, setPerKgCost] = useState(0);
  const [icon, setIcon] = useState("📦");
  const [image, setImage] = useState("");

  const resetForm = () => {
    setName(""); setNameFa(""); setType("post"); setCost(0); setFreeShippingMin(0);
    setRegions(""); setWeightBased(false); setBaseWeightCost(0); setPerKgCost(0);
    setIcon("📦"); setImage(""); setEditId(null); setShowForm(false);
  };

  const handleEdit = (m: any) => {
    setEditId(m._id);
    setName(m.name); setNameFa(m.nameFa); setType(m.type); setCost(m.cost);
    setFreeShippingMin(m.freeShippingMinAmount || 0);
    setRegions((m.regions || []).join(", "));
    setIcon(m.icon || "📦"); setImage(m.image || "");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("نام را وارد کنید."); return; }
    try {
      const payload: any = {
        name, nameFa: nameFa || name, type,
        icon: icon || undefined, image: image || undefined,
        cost: weightBased ? baseWeightCost : cost,
        freeShippingMinAmount: freeShippingMin || undefined,
        regions: regions ? regions.split(",").map(r => r.trim()).filter(Boolean) : undefined,
      };
      if (editId) { await updateMethod({ shippingId: editId as any, ...payload }); toast.success("ویرایش شد."); }
      else { await createMethod(payload); toast.success("روش ارسال اضافه شد."); }
      resetForm();
    } catch { toast.error("خطا."); }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف روش ارسال", message: "آیا مطمئن هستید؟", variant: "danger" })) return;
    try { await removeMethod({ shippingId: id as any }); toast.success("حذف شد."); }
    catch { toast.error("خطا."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">روش‌های ارسال</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> روش جدید
        </button>
      </div>

      {showForm && (
        <div className="clay-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">نام انگلیسی <span className="text-destructive">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً post" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">نام فارسی <span className="text-destructive">*</span></label>
              <input value={nameFa} onChange={e => setNameFa(e.target.value)} placeholder="مثلاً پست پیشتاز" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">نوع ارسال</label>
              <select value={type} onChange={e => setType(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
                {SHIPPING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">آیکون ارسال</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ICONS.map(ic => (
                  <button key={ic.emoji} type="button" onClick={() => setIcon(ic.emoji)} title={ic.label}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 transition-all ${icon === ic.emoji ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-primary/50 bg-muted/30"}`}>
                    {ic.emoji}
                  </button>
                ))}
              </div>
              <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="ایموجی سفارشی" className="clay-input p-2 text-sm outline-none w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">تصویر اختصاصی (URL)</label>
              <input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." className="clay-input p-2 text-sm outline-none w-full" dir="ltr" />
              {image && <img src={image} alt="" className="h-12 w-12 rounded-lg object-cover border" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
            </div>
            {!weightBased ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">هزینه ثابت (تومان)</label>
                <input type="number" value={cost || undefined} onChange={e => setCost(Number(e.target.value))} placeholder="مثلاً ۳۰,۰۰۰" className="clay-input w-full p-3 text-sm outline-none" min={0} />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">هزینه پایه (تومان)</label>
                  <input type="number" value={baseWeightCost || undefined} onChange={e => setBaseWeightCost(Number(e.target.value))} placeholder="مثلاً ۲۰,۰۰۰" className="clay-input w-full p-3 text-sm outline-none" min={0} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">هزینه هر کیلوگرم (تومان)</label>
                  <input type="number" value={perKgCost || undefined} onChange={e => setPerKgCost(Number(e.target.value))} placeholder="مثلاً ۵,۰۰۰" className="clay-input w-full p-3 text-sm outline-none" min={0} />
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ارسال رایگان از (تومان)</label>
              <input type="number" value={freeShippingMin || undefined} onChange={e => setFreeShippingMin(Number(e.target.value))} placeholder="مثلاً ۵۰۰,۰۰۰" className="clay-input w-full p-3 text-sm outline-none" min={0} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">مناطق تحت پوشش (با کاما)</label>
              <input value={regions} onChange={e => setRegions(e.target.value)} placeholder="تهران, اصفهان, شیراز" className="clay-input w-full p-3 text-sm outline-none" />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <input type="checkbox" id="weightBased" checked={weightBased} onChange={e => setWeightBased(e.target.checked)} className="rounded accent-primary" />
              <label htmlFor="weightBased" className="text-sm font-medium cursor-pointer">محاسبه بر اساس وزن</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="clay-button px-6 py-2 text-sm font-semibold">{editId ? "ذخیره" : "افزودن"}</button>
            <button onClick={resetForm} className="clay-button px-6 py-2 text-sm bg-muted text-foreground">لغو</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(methods || []).map((m: any) => (
          <div key={m._id} className="clay-card p-4 flex flex-col h-full">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                  {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : (m.icon || "📦")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{m.nameFa}</p>
                  <p className="text-xs text-muted-foreground truncate" dir="ltr">{m.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{SHIPPING_TYPES.find(t => t.value === m.type)?.label || m.type}</span>
                <span className="font-medium">{m.cost.toLocaleString("fa-IR")} تومان</span>
              </div>
              {m.freeShippingMinAmount && <p className="text-[10px] text-emerald-600">ارسال رایگان از {m.freeShippingMinAmount.toLocaleString("fa-IR")} تومان</p>}
              {m.regions && m.regions.length > 0 && <p className="text-[10px] text-muted-foreground truncate">مناطق: {m.regions.join(", ")}</p>}
            </div>
            <div className="flex gap-1.5 pt-3 mt-auto border-t border-border/50">
              <button onClick={() => handleEdit(m)} className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-xs text-primary">
                <Edit3 className="h-3.5 w-3.5" /> ویرایش
              </button>
              <button onClick={() => handleDelete(m._id)} className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-xs text-rose-500">
                <Trash2 className="h-3.5 w-3.5" /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>
      {(!methods || methods.length === 0) && (
        <div className="clay-card p-12 text-center text-muted-foreground text-sm">روش ارسالی تعریف نشده است.</div>
      )}
    </div>
  );
}
