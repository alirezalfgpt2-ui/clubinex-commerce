import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, Settings, Search, ChevronDown, ChevronRight } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Feature {
  key: string;
  label: string;
}

export default function FeaturesPage() {
  const categories = useQuery(api.categories.list) || [];
  const addFeature = useMutation(api.categories.addFeature);
  const removeFeature = useMutation(api.categories.removeFeature);

  const [selectedCat, setSelectedCat] = useState("");
  const [featureKey, setFeatureKey] = useState("");
  const [featureLabel, setFeatureLabel] = useState("");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c: any) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddFeature = async () => {
    if (!selectedCat || !featureKey.trim() || !featureLabel.trim()) return;
    try {
      await addFeature({
        categoryId: selectedCat as any,
        key: featureKey.trim(),
        label: featureLabel.trim(),
      });
      setFeatureKey("");
      setFeatureLabel("");
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDialog = useConfirm();
  const handleRemoveFeature = async (categoryId: string, key: string) => {
    if (!await confirmDialog({ title: "حذف ویژگی", message: "آیا از حذف این ویژگی اطمینان دارید؟", variant: "danger" })) return;
    try {
      await removeFeature({ categoryId: categoryId as any, key });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ویژگی محصولات</h1>
          <p className="text-muted-foreground mt-1">
            ویژگی‌های هر دسته‌بندی را تعریف کنید تا هنگام افزودن محصول قابل مقداردهی باشند.
          </p>
        </div>
        <Settings className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Add Feature Form */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">افزودن ویژگی جدید</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">دسته‌بندی</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="clay-input w-full p-3 text-sm outline-none"
            >
              <option value="">انتخاب دسته‌بندی...</option>
              {(categories as any[]).map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">کلید ویژگی (انگلیسی)</label>
            <input
              value={featureKey}
              onChange={(e) => setFeatureKey(e.target.value)}
              placeholder="مثال: ram, camera, color"
              className="clay-input w-full p-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">عنوان ویژگی (فارسی)</label>
            <input
              value={featureLabel}
              onChange={(e) => setFeatureLabel(e.target.value)}
              placeholder="مثال: حافظه رم، دوربین، رنگ"
              className="clay-input w-full p-3 text-sm outline-none"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleAddFeature} className="clay-button flex items-center gap-2 px-4 py-2.5 text-sm font-semibold w-full">
              <Plus className="h-4 w-4" /> افزودن ویژگی
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">ویژگی‌های تعریف شده</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="جستجوی دسته‌بندی..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="clay-input pr-9 w-64 p-2 text-sm outline-none"
            />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">دسته‌بندی یافت نشد</p>
        ) : (
          <div className="space-y-2">
            {(filteredCategories as any[]).map((cat) => {
              const features: Feature[] = (cat as any).features || [];
              const isExpanded = expandedCats.has(cat._id);
              return (
                <div key={cat._id} className="border rounded-lg overflow-hidden transition-all">
                  <button
                    onClick={() => toggleExpand(cat._id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="font-medium text-sm">{cat.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat.slug}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {features.length} ویژگی
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t">
                      {features.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3">هنوز ویژگی تعریف نشده</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                          {features.map((f) => (
                            <div key={f.key} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">{f.key}</span>
                                <span className="text-sm">{f.label}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveFeature(cat._id, f.key)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}