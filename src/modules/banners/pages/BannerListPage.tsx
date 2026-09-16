import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Image as ImageIcon, Link2, Monitor, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { formatJalaliDate } from "@/lib/jalali";

export default function BannerListPage() {
  const banners = useQuery((api as any).banners.listAll);
  const createBanner = useMutation((api as any).banners.create);
  const updateBanner = useMutation((api as any).banners.update);
  const removeBanner = useMutation((api as any).banners.remove);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    link: "",
    position: "main_slider",
    isActive: true,
  });

  const handleCreate = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast.error("عنوان و آدرس تصویر اجباری هستند.");
      return;
    }
    try {
      await createBanner(formData);
      toast.success("بنر با موفقیت اضافه شد.");
      setIsAdding(false);
      setFormData({ title: "", imageUrl: "", link: "", position: "main_slider", isActive: true });
    } catch (e) {
      toast.error("خطا در ایجاد بنر.");
    }
  };

  const handleToggle = async (bannerId: any, isActive: boolean) => {
    try {
      await updateBanner({ bannerId, isActive: !isActive });
      toast.success("وضعیت بنر تغییر کرد.");
    } catch {
      toast.error("خطا در تغییر وضعیت.");
    }
  };

  const handleRemove = async (bannerId: any) => {
    if (!window.confirm("آیا از حذف این بنر مطمئن هستید؟")) return;
    try {
      await removeBanner({ bannerId });
      toast.success("بنر حذف شد.");
    } catch {
      toast.error("خطا در حذف بنر.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">بنرها و کمپین‌ها</h1>
          <p className="text-sm text-gray-500 mt-1">مدیریت بنرهای تبلیغاتی و اسلایدرهای صفحه اصلی</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> افزودن بنر جدید
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4">بنر جدید</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">عنوان بنر</label>
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="مثال: جشنواره بهاره" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">موقعیت نمایش</label>
              <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="main_slider">اسلایدر اصلی</option>
                <option value="middle_banners">بنرهای میانی</option>
                <option value="sidebar">سایدبار</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">آدرس تصویر (URL)</label>
              <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" dir="ltr" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">لینک مقصد (اختیاری)</label>
              <input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" dir="ltr" placeholder="/products/sale" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setIsAdding(false)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold">انصراف</button>
            <button onClick={handleCreate} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20">ذخیره بنر</button>
          </div>
        </div>
      )}

      {banners === undefined ? (
        <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">هیچ بنری ثبت نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner: any) => (
            <div key={banner._id} className={`bg-white rounded-2xl border ${banner.isActive ? 'border-gray-200' : 'border-gray-100 opacity-75'} overflow-hidden shadow-sm hover:shadow-md transition-all`}>
              <div className="aspect-video bg-gray-100 relative">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white text-gray-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">غیرفعال</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 truncate pr-2">{banner.title}</h3>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                    {banner.position === 'main_slider' ? 'اسلایدر اصلی' : banner.position === 'middle_banners' ? 'بنر میانی' : 'سایدبار'}
                  </span>
                </div>
                {banner.link && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 truncate" dir="ltr">
                    <Link2 className="h-3 w-3 shrink-0" /> {banner.link}
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <button onClick={() => handleToggle(banner._id, banner.isActive)} className={`flex items-center gap-1.5 text-sm font-medium ${banner.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {banner.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    {banner.isActive ? 'فعال' : 'غیرفعال'}
                  </button>
                  <button onClick={() => handleRemove(banner._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
