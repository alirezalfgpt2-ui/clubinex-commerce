import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Star, Eye, Clock, Flame, ShoppingCart, ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";

/** تایمر شمارش معکوس با طراحی مدرن */
function CountdownTimer() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const diff = Math.max(0, endOfDay.getTime() - now);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: hours, label: "ساعت" },
        { value: minutes, label: "دقیقه" },
        { value: seconds, label: "ثانیه" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <motion.div
            key={item.value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-center min-w-[36px]"
          >
            <span className="text-lg font-extrabold text-white">
              {String(item.value).padStart(2, "0")}
            </span>
          </motion.div>
          {i < 2 && <span className="text-white/60 text-xs font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

/** کارت محصول مدرن */
function ProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
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
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
              )}
            </div>
            {hasDiscount && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg">
                {discountPercent}٪-
              </div>
            )}
            {/* دکمه سبد خرید هاور */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <motion.div
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                className="bg-primary text-white rounded-xl p-2.5 shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" />
              </motion.div>
            </div>
          </div>

          {/* اطلاعات */}
          <div className="p-4">
            <h3 className="font-semibold text-sm text-gray-800 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-400">
                {product.rating ?? 0} ({product.reviewCount ?? 0})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold text-primary">
                    {product.salePrice.toLocaleString("fa-IR")} ت
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {product.price.toLocaleString("fa-IR")} ت
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-primary">
                  {product.price.toLocaleString("fa-IR")} ت
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <Eye className="h-3 w-3" /> {product.views} بازدید
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedProducts() {
  const featured = useQuery(api.products.getFeatured, { limit: 8 });

  if (!featured || featured.length === 0) return null;

  const discounted = featured.filter((p) => p.salePrice && p.salePrice < p.price);

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl">
        {/* بنر فروش ویژه با تایمر */}
        {discounted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden"
          >
            {/* اشکال تزئینی */}
            <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-xl" />
            <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3 blur-xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20"
                >
                  <Flame className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">فروش ویژه امروز</h2>
                  <p className="text-xs text-white/70">فرصت محدود — تا ۵۰٪ تخفیف</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-xs font-bold flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  پایان فروش ویژه:
                </div>
                <CountdownTimer />
              </div>
            </div>
          </motion.div>
        )}

        {/* هدر محصولات ویژه */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <Star className="h-5 w-5" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">محصولات ویژه</h2>
              <p className="text-sm text-gray-400">انتخاب‌های برتر ما برای شما</p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline group"
          >
            مشاهده همه
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* گرید محصولات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
