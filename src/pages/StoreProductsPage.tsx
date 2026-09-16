import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Star, Home, ShoppingCart, Eye,
  Heart, ArrowUpDown
} from "lucide-react";

/** کارت محصول با طراحی مدرن */
function ProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link to={`/products/${product.slug}`}>
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 relative">
          {/* تصویر */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <div className="aspect-square">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
              )}
            </div>
            {/* بج تخفیف */}
            {hasDiscount && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg">
                {discountPercent}٪-
              </div>
            )}
            {/* آیکون‌های هاور */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-lg text-gray-700 hover:text-primary transition-colors cursor-pointer">
                  <Eye className="h-4 w-4" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-lg text-gray-700 hover:text-red-500 transition-colors cursor-pointer">
                  <Heart className="h-4 w-4" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-lg text-gray-700 hover:text-primary transition-colors cursor-pointer">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* اطلاعات */}
          <div className="p-4">
            <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2 leading-relaxed group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {/* امتیاز */}
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(product.rating || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">({product.reviewCount || 0})</span>
            </div>
            {/* قیمت */}
            <div className="flex items-end justify-between">
              <div>
                {hasDiscount ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-gray-900">
                      {product.salePrice!.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {product.price.toLocaleString("fa-IR")}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-extrabold text-gray-900">
                    {product.price.toLocaleString("fa-IR")}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 mr-1">تومان</span>
              </div>
              {hasDiscount && (
                <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-lg">
                  -{discountPercent}٪
                </span>
              )}
            </div>
            {/* موجودی */}
            {product.stock <= (product.stockAlert || 5) && product.stock > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] text-amber-600 font-medium">
                  فقط {product.stock} عدد باقی‌مانده
                </span>
              </div>
            )}
            {/* بازدید */}
            {product.views > 0 && (
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                <Eye className="h-3 w-3" />
                {product.views.toLocaleString("fa-IR")} بازدید
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function StoreProductsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const products = useQuery(api.products.listActive);
  const categories = useQuery(api.categories.listActive);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [products, search, sortBy, selectedCategory, priceRange]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setPriceRange([0, 100000000]);
    setSortBy("newest");
  };

  const hasFilters =
    search || selectedCategory || priceRange[0] > 0 || priceRange[1] < 100000000;

  return (
    <>
      <SEO
        title="فروشگاه | خرید آنلاین"
        description="مشاهده و خرید آنلاین محصولات با بهترین قیمت"
        keywords="فروشگاه, خرید آنلاین, محصول"
      />
      <div className="min-h-screen bg-gray-50">
        {/* هدر */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors group"
              >
                <Home className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                بازگشت به خانه
              </Link>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجوی محصولات..."
                  className="w-full h-11 rounded-xl bg-gray-100 border-0 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-medium transition-colors ${
                  showFilters
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">فیلترها</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {filtered.length} محصول یافت شد
              </span>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 rounded-lg bg-gray-100 border-0 px-3 text-xs font-medium text-gray-700 outline-none cursor-pointer"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="popular">پرطرفدارترین</option>
                  <option value="price-asc">ارزان‌ترین</option>
                  <option value="price-desc">گران‌ترین</option>
                  <option value="rating">بهترین امتیاز</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex gap-6">
            {/* سایدبار فیلترها */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 256 }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 hidden lg:block overflow-hidden"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5 sticky top-24">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-800">فیلترها</h3>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-red-500 hover:underline"
                        >
                          پاک کردن
                        </button>
                      )}
                    </div>

                    {/* دسته‌بندی‌ها */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">
                        دسته‌بندی
                      </h4>
                      <div className="space-y-1.5">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`w-full text-right text-sm px-3 py-2 rounded-lg transition-colors ${
                            !selectedCategory
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          همه دسته‌ها
                        </button>
                        {categories?.map((cat: any) => (
                          <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)}
                            className={`w-full text-right text-sm px-3 py-2 rounded-lg transition-colors ${
                              selectedCategory === cat._id
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* محدوده قیمت */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">
                        محدوده قیمت
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-8">از</span>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([Number(e.target.value), priceRange[1]])
                            }
                            className="flex-1 h-9 rounded-lg bg-gray-100 border-0 px-3 text-xs outline-none"
                          />
                          <span className="text-[10px] text-gray-400">ت</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-8">تا</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([priceRange[0], Number(e.target.value)])
                            }
                            className="flex-1 h-9 rounded-lg bg-gray-100 border-0 px-3 text-xs outline-none"
                          />
                          <span className="text-[10px] text-gray-400">ت</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* گرید محصولات */}
            <div className="flex-1">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    محصولی یافت نشد
                  </h3>
                  <p className="text-sm text-gray-400">
                    فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map((product: any, i: number) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
