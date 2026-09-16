import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { SEO } from "@/components/SEO";
import { Star, ArrowLeft, X, Plus, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function ComparePage() {
  const products = useQuery(api.products.listActive);
  const categories = useQuery(api.categories.listActive);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedProducts = useMemo(() => {
    if (!products || selectedIds.length === 0) return [];
    return selectedIds.map((id) => products.find((p: any) => p._id === id)).filter(Boolean);
  }, [products, selectedIds]);

  // Collect all unique feature keys from selected products
  const allFeatureKeys = useMemo(() => {
    const keys = new Map<string, string>();
    for (const p of selectedProducts) {
      if (p?.features) {
        const catFeatures = categories?.find((c: any) => c._id === p.categoryId)?.features || [];
        for (const feat of catFeatures) {
          if ((p.features as any)[feat.key]) {
            keys.set(feat.key, feat.label);
          }
        }
      }
    }
    return Array.from(keys.entries());
  }, [selectedProducts, categories]);

  const handleAddProduct = (productId: string) => {
    if (selectedIds.length >= 4) return;
    if (!selectedIds.includes(productId)) {
      setSelectedIds([...selectedIds, productId]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== productId));
  };

  return (
    <>
      <SEO title="مقایسه محصولات | فروشگاه" description="مقایسه مشخصات و قیمت محصولات" />
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">مقایسه محصولات</h1>
              <p className="text-sm text-gray-400">حداکثر ۴ محصول را مقایسه کنید</p>
            </div>
          </div>
          <Link to="/products" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            بازگشت به فروشگاه <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Product Selector */}
        {selectedIds.length < 4 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">محصول مورد نظر را انتخاب کنید:</h3>
            <div className="flex flex-wrap gap-2">
              {products?.filter((p: any) => !selectedIds.includes(p._id)).slice(0, 20).map((p: any) => (
                <button
                  key={p._id}
                  onClick={() => handleAddProduct(p._id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Plus className="h-3 w-3 text-primary" />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Scale className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">محصولی انتخاب نشده</h3>
            <p className="text-sm text-gray-400">از بالا محصولاتی که می‌خواهید مقایسه کنید را انتخاب نمایید.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 text-right text-xs font-semibold text-gray-400 w-40">ویژگی</th>
                  {selectedProducts.map((p: any) => (
                    <th key={p._id} className="p-4 text-center min-w-[200px]">
                      <div className="relative">
                        <button onClick={() => handleRemoveProduct(p._id)} className="absolute -top-1 -right-1 p-1 rounded-full bg-gray-100 hover:bg-rose-100 transition-colors">
                          <X className="h-3 w-3 text-gray-400 hover:text-rose-500" />
                        </button>
                        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 mx-auto w-24">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full flex items-center justify-center text-3xl">📦</div>
                          )}
                        </div>
                        <Link to={`/products/${p.slug}`} className="text-sm font-bold text-gray-800 hover:text-primary transition-colors line-clamp-2">{p.name}</Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-xs font-semibold text-gray-500">قیمت</td>
                  {selectedProducts.map((p: any) => (
                    <td key={p._id} className="p-4 text-center">
                      <span className="text-lg font-extrabold text-gray-900">{(p.salePrice || p.price).toLocaleString("fa-IR")}</span>
                      <span className="text-[10px] text-gray-400 mr-1">تومان</span>
                      {p.salePrice && <p className="text-xs text-gray-400 line-through">{p.price.toLocaleString("fa-IR")}</p>}
                    </td>
                  ))}
                </tr>
                {/* Stock Row */}
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <td className="p-4 text-xs font-semibold text-gray-500">موجودی</td>
                  {selectedProducts.map((p: any) => (
                    <td key={p._id} className="p-4 text-center">
                      <span className={`text-xs font-semibold ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {p.stock > 0 ? `${p.stock} عدد` : "ناموجود"}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Rating Row */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-xs font-semibold text-gray-500">امتیاز</td>
                  {selectedProducts.map((p: any) => (
                    <td key={p._id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.round(p.rating || 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                        <span className="text-[10px] text-gray-400 mr-1">({p.reviewCount || 0})</span>
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Views Row */}
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <td className="p-4 text-xs font-semibold text-gray-500">بازدید</td>
                  {selectedProducts.map((p: any) => (
                    <td key={p._id} className="p-4 text-center text-xs text-gray-600">{(p.views || 0).toLocaleString("fa-IR")}</td>
                  ))}
                </tr>
                {/* Brand Row */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-xs font-semibold text-gray-500">برند</td>
                  {selectedProducts.map((p: any) => (
                    <td key={p._id} className="p-4 text-center text-xs text-gray-700 font-medium">{p.brand || "—"}</td>
                  ))}
                </tr>
                {/* Feature Rows */}
                {allFeatureKeys.map(([key, label]) => (
                  <tr key={key} className="border-b border-gray-50">
                    <td className="p-4 text-xs font-semibold text-gray-500">{label}</td>
                    {selectedProducts.map((p: any) => (
                      <td key={p._id} className="p-4 text-center text-xs text-gray-700">
                        {(p.features as any)?.[key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Action Row */}
                <tr>
                  <td className="p-4"></td>
                  {selectedProducts.map((p: any) => (
                    <td key={p._id} className="p-4 text-center">
                      <Link to={`/products/${p.slug}`} className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-colors">
                        مشاهده محصول <ArrowLeft className="h-3 w-3" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
