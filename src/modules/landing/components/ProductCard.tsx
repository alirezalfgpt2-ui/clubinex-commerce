import { motion } from "framer-motion";
import { Link } from "react-router";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";

/** کارت محصول با طراحی مدرن */
interface ProductCardProps {
  product: any;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={`/products/${product.slug}`}>
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 relative">
          {/* تصویر */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <div className="aspect-square">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
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
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">({product.reviewCount || 0})</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                {hasDiscount ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-gray-900">{product.salePrice!.toLocaleString("fa-IR")}</span>
                    <span className="text-xs text-gray-400 line-through">{product.price.toLocaleString("fa-IR")}</span>
                  </div>
                ) : (
                  <span className="text-lg font-extrabold text-gray-900">{product.price.toLocaleString("fa-IR")}</span>
                )}
                <span className="text-[10px] text-gray-400 mr-1">تومان</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-[10px] text-gray-500">
                <ShoppingCart className="h-3 w-3" />
                {product.soldCount || 0}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
