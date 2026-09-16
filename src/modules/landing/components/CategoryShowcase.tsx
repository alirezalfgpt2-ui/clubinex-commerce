import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

/** آیکون‌های پیش‌فرض */
const CATEGORY_ICONS: Record<string, string> = {
  mobile: "📱",
  laptop: "💻",
  clothes: "👕",
  home: "🏠",
  "phone-accessories": "🎧",
  "gaming-laptop": "🎮",
  electronics: "⚡",
  books: "📚",
  sports: "⚽",
  beauty: "💄",
  food: "🍕",
  cars: "🚗",
};

/** رنگ‌های گرادیانت برای هر دسته */
const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

export function CategoryShowcase() {
  const categories = useQuery(api.categories.listActive);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">دسته‌بندی‌های اصلی</h2>
            <p className="text-sm text-gray-400 mt-1">مرور سریع دسته‌بندی‌های فروشگاه</p>
          </div>
          <Link
            to="/products"
            className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline group"
          >
            مشاهده همه
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat: any, i: number) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={`/products?category=${cat.slug}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* بک‌گراند گرادیانت */}
                  <div className={`h-32 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} relative overflow-hidden`}>
                    {/* آیکون */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        className="text-5xl group-hover:scale-125 transition-transform duration-500"
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                      >
                        {CATEGORY_ICONS[cat.slug] || "📂"}
                      </motion.span>
                    </div>
                    {/* اشکال تزئینی */}
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute bottom-0 right-0 h-12 w-12 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3 group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  {/* نام دسته */}
                  <div className="p-4 text-center">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
