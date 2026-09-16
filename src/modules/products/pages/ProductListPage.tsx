/**
 * 📦 صفحه مدیریت محصولات فروشگاه
 * — نمایش کارتی و جدولی (پیش‌فرض: جدولی)
 * — صفحه‌بندی سمت سرور با cursor (برای ۱۰,۰۰۰+ محصول بهینه)
 * — کپی و ایجاد جدید
 * — جستجو و مرتب‌سازی
 */
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Edit3, Trash2, Copy, Eye, LayoutGrid, Table2, Search,
  ChevronLeft, ChevronRight, Package, Loader2,
} from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";

const ProductImport = lazy(() =>
  import("@/modules/products/components/ProductImport").then((m) => ({ default: m.ProductImport }))
);

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
] as const;

type ViewMode = "table" | "card";

export default function ProductListPage() {
  const removeProduct = useMutation(api.products.remove);
  const duplicateProduct = useMutation(api.products.duplicate);
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const {
    items: products,
    hasMore,
    isLoading,
    totalEstimate,
    page,
    nextPage,
    prevPage,
    reset,
  } = useCursorPagination(
    api.products.listPaginated,
    { sortBy, search: appliedSearch || undefined, activeOnly: false },
    { pageSize }
  );

  const confirmDialog = useConfirm();

  const handleSearch = () => { reset(); setAppliedSearch(search); };
  const handleSearchKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  const handleDelete = async (productId: string, productName: string) => {
    if (!await confirmDialog({ title: "حذف محصول", message: `آیا از حذف محصول «${productName}» اطمینان دارید؟`, variant: "danger" })) return;
    try {
      await removeProduct({ productId: productId as any });
      toast.success("محصول حذف شد.");
    } catch (e: any) { toast.error(e.message || "خطا در حذف."); }
  };

  const handleDuplicate = async (productId: string, productName: string) => {
    try {
      await duplicateProduct({ productId: productId as any });
      toast.success(`کپی «${productName}» ایجاد شد.`);
    } catch (e: any) { toast.error(e.message || "خطا در کپی."); }
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">محصولات فروشگاه</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "در حال شمارش..." : `${totalEstimate.toLocaleString("fa-IR")} محصول`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="clay-button px-4 py-2 text-sm font-semibold bg-muted text-foreground">
            📥 وارد کردن از اکسل
          </button>
          <Link to="/dashboard/products/new" className="clay-button px-4 py-2 text-sm font-semibold">
            + افزودن محصول
          </Link>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="clay-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="جستجو و اینتر بزنید..."
            className="clay-input h-9 w-full pr-9 pl-14 text-sm outline-none"
          />
          <button onClick={handleSearch} className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-lg font-medium hover:opacity-90">
            جستجو
          </button>
        </div>
        <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); reset(); }} className="clay-input h-9 px-3 text-sm outline-none min-w-[140px]">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); reset(); }} className="clay-input h-9 px-2 text-xs outline-none w-auto">
          <option value={10}>۱۰ ردیف</option>
          <option value={20}>۲۰ ردیف</option>
          <option value={50}>۵۰ ردیف</option>
        </select>
        <div className="flex items-center gap-1 border rounded-xl p-0.5">
          <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`} title="جدولی">
            <Table2 className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-lg transition-all ${viewMode === "card" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`} title="کارتی">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="clay-card p-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">در حال بارگذاری محصولات...</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && products.length === 0 && (
        <div className="clay-card p-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{appliedSearch ? "محصولی یافت نشد." : "هنوز محصولی اضافه نشده."}</p>
        </div>
      )}

      {/* ── Table View ── */}
      {!isLoading && products.length > 0 && viewMode === "table" && (
        <div className="clay-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground w-12">#</th>
                  <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground">تصویر</th>
                  <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground">نام محصول</th>
                  <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground">قیمت</th>
                  <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground">موجودی</th>
                  <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground">وضعیت</th>
                  <th className="text-center px-4 py-3 font-medium text-xs text-muted-foreground">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any, idx: number) => {
                  const hasDiscount = product.salePrice && product.salePrice < product.price;
                  return (
                    <tr key={product._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50">
                          {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg text-muted-foreground/40">📦</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/dashboard/products/edit/${product.slug}`} className="font-medium hover:text-primary transition-colors line-clamp-1">{product.name}</Link>
                        {product.brand && <span className="text-[10px] text-muted-foreground mt-0.5 block">{product.brand}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {hasDiscount ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-primary text-xs">{product.salePrice!.toLocaleString("fa-IR")} ت</span>
                            <span className="text-[10px] text-muted-foreground line-through">{product.price.toLocaleString("fa-IR")} ت</span>
                          </div>
                        ) : (
                          <span className="font-bold text-xs">{product.price.toLocaleString("fa-IR")} ت</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${product.stock > 0 ? (product.stock <= (product.stockAlert ?? 5) ? "text-amber-600" : "text-emerald-600") : "text-rose-500"}`}>
                          {product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.isFeatured ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">⭐ ویژه</span>
                          : product.isActive ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">فعال</span>
                          : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">غیرفعال</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/dashboard/products/view/${product.slug}`} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="مشاهده"><Eye className="h-3.5 w-3.5 text-blue-500" /></Link>
                          <Link to={`/dashboard/products/edit/${product.slug}`} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="ویرایش"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></Link>
                          <button onClick={() => handleDuplicate(product._id, product.name)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="کپی"><Copy className="h-3.5 w-3.5 text-blue-500" /></button>
                          <button onClick={() => handleDelete(product._id, product.name)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="حذف"><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Card View ── */}
      {!isLoading && products.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product: any) => {
            const hasDiscount = product.salePrice && product.salePrice < product.price;
            const pct = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;
            return (
              <div key={product._id} className="clay-card overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative">
                <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/dashboard/products/view/${product.slug}`} className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-blue-50 transition-colors"><Eye className="h-3 w-3 text-blue-500" /></Link>
                  <Link to={`/dashboard/products/edit/${product.slug}`} className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"><Edit3 className="h-3 w-3 text-muted-foreground" /></Link>
                  <button onClick={() => handleDuplicate(product._id, product.name)} className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-blue-50 transition-colors"><Copy className="h-3 w-3 text-blue-500" /></button>
                  <button onClick={() => handleDelete(product._id, product.name)} className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-rose-50 transition-colors"><Trash2 className="h-3 w-3 text-rose-500" /></button>
                </div>
                <Link to={`/dashboard/products/edit/${product.slug}`}>
                  <div className="relative aspect-square bg-muted/50 overflow-hidden">
                    {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">📦</div>}
                    {hasDiscount && <span className="absolute top-2 right-2 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">{pct}%-</span>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-xs mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1">
                      {hasDiscount ? (<><span className="text-sm font-bold text-primary">{product.salePrice!.toLocaleString("fa-IR")} ت</span><span className="text-[10px] text-muted-foreground line-through">{product.price.toLocaleString("fa-IR")} ت</span></>) : <span className="text-sm font-bold">{product.price.toLocaleString("fa-IR")} ت</span>}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-[10px] font-medium ${product.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}>{product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}</span>
                      <span className="text-[10px] text-muted-foreground">👁 {product.views || 0}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!isLoading && products.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">صفحه {page.toLocaleString("fa-IR")} — {products.length} محصول</p>
          <div className="flex items-center gap-2">
            <button onClick={prevPage} disabled={page === 1} className="clay-button px-3 py-1.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" /> قبلی
            </button>
            <span className="text-xs text-muted-foreground font-mono">{page}</span>
            <button onClick={nextPage} disabled={!hasMore} className="clay-button px-3 py-1.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
              بعدی <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {showImport && (
        <Suspense fallback={<div className="text-center p-4 text-muted-foreground text-sm">در حال بارگذاری...</div>}>
          <ProductImport onClose={() => setShowImport(false)} />
        </Suspense>
      )}
    </div>
  );
}
