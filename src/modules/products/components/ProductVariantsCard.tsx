import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Tag, Box, DollarSign } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export function ProductVariantsCard({ productId }: { productId: Id<"products"> }) {
  const variants = useQuery((api as any).variants.getByProduct, { productId });
  const createVariant = useMutation((api as any).variants.create);
  const updateVariant = useMutation((api as any).variants.update);
  const removeVariant = useMutation((api as any).variants.remove);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: "color",
    name: "",
    value: "",
    additionalPrice: 0,
    stock: 10,
  });

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("نام تنوع الزامی است.");
      return;
    }
    try {
      await createVariant({
        productId,
        type: formData.type,
        name: formData.name,
        value: formData.value || undefined,
        additionalPrice: formData.additionalPrice || undefined,
        stock: formData.stock,
      });
      toast.success("تنوع جدید اضافه شد.");
      setIsAdding(false);
      setFormData({ type: "color", name: "", value: "", additionalPrice: 0, stock: 10 });
    } catch (e) {
      toast.error("خطا در ثبت تنوع.");
    }
  };

  const handleRemove = async (variantId: Id<"productVariants">) => {
    if (!window.confirm("حذف شود؟")) return;
    try {
      await removeVariant({ variantId });
      toast.success("حذف شد.");
    } catch (e) {
      toast.error("خطا در حذف.");
    }
  };

  const handleStockUpdate = async (variantId: Id<"productVariants">, stock: number) => {
    await updateVariant({ variantId, stock });
    toast.success("موجودی بروزرسانی شد");
  };

  return (
    <div className="clay-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">تنوع‌های محصول (Variant)</h2>
          <p className="text-sm text-gray-500">رنگ‌ها، سایزها و مدل‌های مختلف محصول</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> افزودن تنوع
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">نوع تنوع</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="clay-input w-full p-2.5 text-sm">
                <option value="color">رنگ</option>
                <option value="size">سایز</option>
                <option value="material">جنس</option>
                <option value="other">سایر</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">نام (مثال: قرمز)</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="clay-input w-full p-2.5 text-sm" placeholder="نام" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">مقدار (مثال: #FF0000)</label>
              <input value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="clay-input w-full p-2.5 text-sm" placeholder="کد رنگ یا مخفف سایز" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">قیمت مازاد (تومان)</label>
              <input type="number" value={formData.additionalPrice} onChange={e => setFormData({...formData, additionalPrice: parseInt(e.target.value) || 0})} className="clay-input w-full p-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">موجودی انبار</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="clay-input w-full p-2.5 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-bold text-gray-500">انصراف</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20">ثبت</button>
          </div>
        </div>
      )}

      {variants === undefined ? (
        <div className="flex justify-center p-4"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : variants.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
          تنوعی ثبت نشده است
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {variants.map((v: any) => (
            <div key={v._id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {v.type === 'color' && v.value ? (
                  <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: v.value }} />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{v.type === 'size' ? 'SZ' : 'VR'}</div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{v.value}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">{v.type}</span>
                  </div>
                  {v.priceAdjustment ? <div className="text-xs text-emerald-600 mt-0.5">+{v.priceAdjustment.toLocaleString("fa-IR")} تومان</div> : <div className="text-xs text-gray-400 mt-0.5">بدون قیمت مازاد</div>}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <span className="text-xs text-gray-500 px-2">موجودی:</span>
                  <input 
                    type="number" 
                    value={v.stock} 
                    onChange={(e) => handleStockUpdate(v._id, parseInt(e.target.value) || 0)}
                    className="w-16 bg-white border border-gray-200 rounded-md text-sm text-center py-1 outline-none"
                  />
                </div>
                <button onClick={() => handleRemove(v._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
