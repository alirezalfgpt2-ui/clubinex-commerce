import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ArrowLeft } from "lucide-react";

interface MegaMenuProps {
  isOpen: boolean;
  categoryId: string | null;
  categoryName: string;
  onClose: () => void;
}

/** مگامنوی حرفه‌ای با پیش‌نمایش محصولات */
export function MegaMenu({ isOpen, categoryId, categoryName, onClose }: MegaMenuProps) {
  const products = useQuery(
    api.products.listActive,
    isOpen && categoryId ? {} : "skip"
  );
  const categories = useQuery(api.categories.list);
  const [subcats, setSubcats] = useState<any[]>([]);
  const [catProducts, setCatProducts] = useState<any[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!products || !categories || !categoryId) {
      setSubcats([]);
      setCatProducts([]);
      return;
    }
    // زیردسته‌ها
    const children = categories.filter((c: any) => c.parentId === categoryId);
    setSubcats(children.slice(0, 6));
    // محصولات دسته
    const items = products.filter((p: any) => p.categoryId === categoryId).slice(0, 5);
    setCatProducts(items);
  }, [categoryId, products, categories]);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(onClose, 200);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  if (!isOpen || !categoryId) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-top-1 duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* زیردسته‌ها */}
          <div className="col-span-3">
            <h4 className="text-sm font-bold text-gray-900 mb-3">{categoryName}</h4>
            <div className="space-y-1">
              {subcats.length > 0 ? (
                subcats.map((sub: any) => (
                  <Link
                    key={sub._id}
                    to={`/products?category=${sub.slug || sub._id}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors group"
                  >
                    <span>{sub.name}</span>
                    <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))
              ) : (
                <Link
                  to={`/products?category=${categoryId}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  مشاهده همه محصولات
                  <ArrowLeft className="h-3 w-3" />
                </Link>
              )}
            </div>
            <Link
              to={`/products?category=${categoryId}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              مشاهده همه
              <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>

          {/* محصولات پیشنهادی */}
          <div className="col-span-9">
            <h4 className="text-sm font-bold text-gray-900 mb-3">محصولات پیشنهادی</h4>
            <div className="grid grid-cols-5 gap-3">
              {catProducts.length > 0 ? (
                catProducts.map((p: any) => (
                  <Link
                    key={p._id}
                    to={`/products/${p.slug || p._id}`}
                    onClick={onClose}
                    className="group block rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-50 overflow-hidden">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {p.salePrice ? (
                          <>
                            <span className="text-[11px] font-bold text-primary">{p.salePrice.toLocaleString("fa-IR")}</span>
                            <span className="text-[9px] text-gray-400 line-through">{p.price?.toLocaleString("fa-IR")}</span>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-700">{p.price?.toLocaleString("fa-IR")} <span className="text-[9px] font-normal">تومان</span></span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-5 flex items-center justify-center py-8 text-gray-400 text-sm">
                  محصولی در این دسته یافت نشد
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
