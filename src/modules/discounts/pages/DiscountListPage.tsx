import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { JalaliDatePicker } from "@/modules/shared/ui/JalaliDatePicker";
import { jalaliToIso } from "@/lib/jalali";
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { formatJalaliDate } from "@/lib/jalali";

const PAGE_SIZE = 15;

type SortKey = "code" | "type" | "value" | "isActive" | "startDate" | "endDate" | "usedCount";

export default function DiscountListPage() {
  const discounts = useQuery(api.discounts.list);
  const products = useQuery(api.products.list);
  const categories = useQuery(api.categories.list);
  const createDiscount = useMutation(api.discounts.create);
  const updateDiscount = useMutation(api.discounts.update);
  const removeDiscount = useMutation(api.discounts.remove);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("startDate");
  const [sortAsc, setSortAsc] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [discountType, setDiscountType] = useState<string>("general");
  const [targetUserIds, setTargetUserIds] = useState<string[]>([]);
  const [volumeTiers, setVolumeTiers] = useState<{ minQuantity: number; discountPercent: number }[]>([]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCode(result);
  };

  const resetForm = () => {
    setCode(""); setType("percentage"); setValue(0); setMinOrder(0);
    setStartDate(""); setEndDate(""); setUsageLimit(0);
    setSelectedProductId(""); setSelectedCategoryId("");
    setProductSearch(""); setCategorySearch("");
    setDiscountType("general"); setTargetUserIds([]); setVolumeTiers([]);
  };

  const handleCreate = async () => {
    if (!code) { toast.error("کد تخفیف را وارد کنید."); return; }
    if (!startDate || !endDate) { toast.error("تاریخ شروع و پایان را انتخاب کنید."); return; }
    try {
      const startIso = startDate ? jalaliToIso(startDate) : "";
      const endIso = endDate ? jalaliToIso(endDate) : "";
      const startTs = startIso ? new Date(startIso).getTime() : 0;
      const endTs = endIso ? new Date(endIso).getTime() : 0;
      if (!startTs || !endTs) { toast.error("تاریخ نامعتبر است."); return; }
      if (endTs <= startTs) { toast.error("تاریخ پایان باید بعد از تاریخ شروع باشد."); return; }

      await createDiscount({
        code,
        type,
        value,
        minOrderAmount: minOrder || undefined,
        startDate: startTs,
        endDate: endTs,
        usageLimit: usageLimit || undefined,
        productId: (selectedProductId || undefined) as any,
        categoryId: (selectedCategoryId || undefined) as any,
        discountType: discountType as any,
        targetUserIds: targetUserIds.length > 0 ? targetUserIds as any : undefined,
        volumeDiscounts: volumeTiers.length > 0 ? volumeTiers : undefined,
      });
      toast.success("تخفیف ایجاد شد.");
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "خطا در ایجاد تخفیف.");
    }
  };

  const toggleActive = async (discountId: string, currentStatus: boolean) => {
    try {
      await updateDiscount({ discountId: discountId as any, isActive: !currentStatus });
      toast.success(currentStatus ? "تخفیف غیرفعال شد." : "تخفیف فعال شد.");
    } catch (e: any) {
      toast.error(e?.message || "خطا در تغییر وضعیت.");
    }
  };

  const confirmDialog = useConfirm();
  const handleDelete = async (discountId: string) => {
    if (!await confirmDialog({ title: "حذف تخفیف", message: "آیا از حذف این تخفیف اطمینان دارید؟", variant: "danger" })) return;
    try {
      await removeDiscount({ discountId: discountId as any });
      toast.success("تخفیف حذف شد.");
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
    const list = (discounts || []).filter((d: any) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return d.code.toLowerCase().includes(s);
    });
    list.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case "code": cmp = a.code.localeCompare(b.code); break;
        case "type": cmp = a.type.localeCompare(b.type); break;
        case "value": cmp = a.value - b.value; break;
        case "isActive": cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
        case "startDate": cmp = a.startDate - b.startDate; break;
        case "endDate": cmp = a.endDate - b.endDate; break;
        case "usedCount": cmp = (a.usedCount || 0) - (b.usedCount || 0); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [discounts, search, sortKey, sortAsc]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Filtered products and categories for dropdowns
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!productSearch) return products.slice(0, 20);
    const s = productSearch.toLowerCase();
    return products.filter((p: any) => p.name.toLowerCase().includes(s) || (p.slug && p.slug.toLowerCase().includes(s)));
  }, [products, productSearch]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!categorySearch) return categories.slice(0, 20);
    const s = categorySearch.toLowerCase();
    return categories.filter((c: any) => c.name.toLowerCase().includes(s));
  }, [categories, categorySearch]);

  const getProductName = (id: string) => {
    if (!products) return id;
    const p = products.find((p: any) => p._id === id);
    return p ? p.name : id;
  };

  const getCategoryName = (id: string) => {
    if (!categories) return id;
    const c = categories.find((c: any) => c._id === id);
    return c ? c.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">تخفیف‌ها</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} کد تخفیف</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="جستجوی کد تخفیف..."
              className="clay-input pr-10 pl-3 py-2 text-sm w-56"
            />
          </div>
          <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> تخفیف جدید
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="clay-card p-6 space-y-4 relative z-10">
          <h3 className="font-bold text-sm">ایجاد تخفیف جدید</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد تخفیف" className="clay-input flex-1 p-3 text-sm outline-none font-mono" />
              <button onClick={generateCode} className="clay-button px-3 text-lg" title="پیشنهاد کد">🔄</button>
            </div>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="clay-input p-3 text-sm outline-none">
              <option value="percentage">درصدی (%)</option>
              <option value="fixed">مبلغ ثابت (تومان)</option>
            </select>
            <input type="number" value={value || ""} onChange={(e) => setValue(Number(e.target.value))} placeholder="مقدار تخفیف" className="clay-input p-3 text-sm outline-none" />
            <input type="number" value={minOrder || ""} onChange={(e) => setMinOrder(Number(e.target.value))} placeholder="حداقل مبلغ سفارش (تومان)" className="clay-input p-3 text-sm outline-none" />
            <input type="number" value={usageLimit || ""} onChange={(e) => setUsageLimit(Number(e.target.value))} placeholder="حداکثر استفاده (اختیاری)" className="clay-input p-3 text-sm outline-none" />

            {/* Product selector */}
            <div className="relative z-30">
              <label className="text-xs text-muted-foreground mb-1 block">محصول (اختیاری)</label>
              <input
                value={productSearch || (selectedProductId ? getProductName(selectedProductId) : "")}
                onChange={(e) => { setProductSearch(e.target.value); setSelectedProductId(""); }}
                onFocus={() => setProductSearch(productSearch || " ")}
                placeholder="انتخاب محصول..."
                className="clay-input p-3 text-sm outline-none w-full"
              />
              {productSearch && filteredProducts.length > 0 && !selectedProductId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                  <button
                    onClick={() => { setSelectedProductId(""); setProductSearch(""); }}
                    className="w-full px-3 py-2 text-xs text-muted-foreground hover:bg-muted text-right"
                  >
                    بدون انتخاب
                  </button>
                  {filteredProducts.map((p: any) => (
                    <button
                      key={p._id}
                      onClick={() => { setSelectedProductId(p._id); setProductSearch(p.name); }}
                      className="w-full px-3 py-2 text-xs hover:bg-muted text-right border-b border-border/50 last:border-0"
                    >
                      {p.name} — {p.price?.toLocaleString("fa-IR")} تومان
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category selector */}
            <div className="relative z-30">
              <label className="text-xs text-muted-foreground mb-1 block">دسته‌بندی (اختیاری)</label>
              <input
                value={categorySearch || (selectedCategoryId ? getCategoryName(selectedCategoryId) : "")}
                onChange={(e) => { setCategorySearch(e.target.value); setSelectedCategoryId(""); }}
                onFocus={() => setCategorySearch(categorySearch || " ")}
                placeholder="انتخاب دسته‌بندی..."
                className="clay-input p-3 text-sm outline-none w-full"
              />
              {categorySearch && filteredCategories.length > 0 && !selectedCategoryId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                  <button
                    onClick={() => { setSelectedCategoryId(""); setCategorySearch(""); }}
                    className="w-full px-3 py-2 text-xs text-muted-foreground hover:bg-muted text-right"
                  >
                    بدون انتخاب
                  </button>
                  {filteredCategories.map((c: any) => (
                    <button
                      key={c._id}
                      onClick={() => { setSelectedCategoryId(c._id); setCategorySearch(c.name); }}
                      className="w-full px-3 py-2 text-xs hover:bg-muted text-right border-b border-border/50 last:border-0"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date pickers */}
            <div className="relative z-30">
              <JalaliDatePicker label="تاریخ شروع" value={startDate} onChange={setStartDate} />
            </div>
            <div className="relative z-30">
              <JalaliDatePicker label="تاریخ پایان" value={endDate} onChange={setEndDate} />
            </div>
          </div>

          {/* نوع تخفیف */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">نوع تخفیف:</span>
            {[
              { value: "general", label: "عمومی" },
              { value: "welcome", label: "🎉 خوش‌آمدگویی" },
              { value: "birthday", label: "🎂 تولد" },
              { value: "loyalty", label: "⭐ وفاداری" },
              { value: "volume", label: "📦 حجمی" },
            ].map((dt) => (
              <button key={dt.value} onClick={() => setDiscountType(dt.value)} className={`px-3 py-1.5 rounded-lg transition-all ${discountType === dt.value ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{dt.label}</button>
            ))}
          </div>

          {/* تخفیف حجمی */}
          {discountType === "volume" && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground">سطوح تخفیف حجمی</h4>
              {volumeTiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">از</span>
                  <input type="number" value={tier.minQuantity || ""} onChange={(e) => { const t = [...volumeTiers]; t[idx] = { ...t[idx], minQuantity: Number(e.target.value) }; setVolumeTiers(t); }} className="clay-input w-20 p-2 text-xs outline-none" placeholder="تعداد" />
                  <span className="text-xs text-muted-foreground">عدد →</span>
                  <input type="number" value={tier.discountPercent || ""} onChange={(e) => { const t = [...volumeTiers]; t[idx] = { ...t[idx], discountPercent: Number(e.target.value) }; setVolumeTiers(t); }} className="clay-input w-20 p-2 text-xs outline-none" placeholder="%" />
                  <span className="text-xs text-muted-foreground">%</span>
                  <button onClick={() => setVolumeTiers(volumeTiers.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700 text-xs">✕</button>
                </div>
              ))}
              <button onClick={() => setVolumeTiers([...volumeTiers, { minQuantity: 0, discountPercent: 0 }])} className="text-xs text-primary hover:underline">+ افزودن سطح</button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={handleCreate} className="clay-button px-5 py-2 text-sm font-semibold">ایجاد تخفیف</button>
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
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("code")}>
                  <span className="inline-flex items-center gap-1">کد <SortIcon col="code" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("type")}>
                  <span className="inline-flex items-center gap-1">نوع <SortIcon col="type" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("value")}>
                  <span className="inline-flex items-center gap-1">مقدار <SortIcon col="value" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">محصول/دسته</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("startDate")}>
                  <span className="inline-flex items-center gap-1">تاریخ شروع <SortIcon col="startDate" /></span>
                </th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("endDate")}>
                  <span className="inline-flex items-center gap-1">تاریخ پایان <SortIcon col="endDate" /></span>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("isActive")}>
                  <span className="inline-flex items-center gap-1 justify-center">وضعیت <SortIcon col="isActive" /></span>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => handleSort("usedCount")}>
                  <span className="inline-flex items-center gap-1 justify-center">استفاده <SortIcon col="usedCount" /></span>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-xs">تخفیفی یافت نشد.</td></tr>
              ) : paginated.map((d: any) => (
                <tr key={d._id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs font-medium">{d.code}</td>
                  <td className="p-3 text-xs">
                    <div>{d.type === "percentage" ? "درصدی" : "مبلغ ثابت"}</div>
                    {d.discountType && d.discountType !== "general" && (
                      <div className="text-[9px] text-muted-foreground mt-0.5">
                        {d.discountType === "welcome" ? "🎉 خوش‌آمد" : d.discountType === "birthday" ? "🎂 تولد" : d.discountType === "loyalty" ? "⭐ وفاداری" : "📦 حجمی"}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-xs font-medium">{d.type === "percentage" ? `${d.value}%` : `${d.value?.toLocaleString("fa-IR")} تومان`}</td>
                  <td className="p-3 text-xs">
                    {d.productId ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">📦 {getProductName(d.productId)}</span>
                    : d.categoryId ? <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">📂 {getCategoryName(d.categoryId)}</span>
                    : <span className="text-muted-foreground">همه</span>}
                  </td>
                  <td className="p-3 text-xs">{d.startDate ? formatJalaliDate(d.startDate) : "—"}</td>
                  <td className="p-3 text-xs">{d.endDate ? formatJalaliDate(d.endDate) : "—"}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleActive(d._id, d.isActive)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        d.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      title={d.isActive ? "کلیک برای غیرفعال کردن" : "کلیک برای فعال کردن"}
                    >
                      {d.isActive ? (
                        <><ToggleRight className="h-3.5 w-3.5" /> فعال</>
                      ) : (
                        <><ToggleLeft className="h-3.5 w-3.5" /> غیرفعال</>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-center text-xs">
                    <span className="text-muted-foreground">{d.usedCount || 0}</span>
                    {d.usageLimit ? <span className="text-muted-foreground"> / {d.usageLimit}</span> : null}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(d._id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="حذف">
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </button>
                  </td>
                </tr>
              ))}
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
