import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Star, ArrowLeft, Zap, Shield, Truck, Headphones,
  Clock, Flame, TrendingUp, Gift, ChevronLeft,
  ShoppingCart, Sparkles, Heart, CheckCircle, Award, Lock,
} from "lucide-react";
import { ProductCard } from "./ProductCard";

/** نقشه آیکون‌ها */
const ICON_MAP: Record<string, any> = { Truck, Shield, Headphones, Zap, Gift, TrendingUp, Star, Heart, Clock, Flame, ShoppingCart, Sparkles, CheckCircle, Award, Lock };

const DEFAULT_FEATURES = [
  { icon: "Truck", title: "ارسال رایگان", desc: "بالای ۵۰۰ هزار تومان", color: "bg-blue-50 text-blue-600" },
  { icon: "Shield", title: "ضمانت اصالت", desc: "۱۰۰٪ اورجینال", color: "bg-green-50 text-green-600" },
  { icon: "Headphones", title: "پشتیبانی ۲۴/۷", desc: "همیشه در دسترس", color: "bg-purple-50 text-purple-600" },
  { icon: "Zap", title: "ارسال سریع", desc: "۱-۳ روز کاری", color: "bg-amber-50 text-amber-600" },
];

const DEFAULT_BANNERS = [
  { gradient: "from-indigo-600 to-purple-700", title: "کد تخفیف ۱۰٪", desc: "برای خرید اول — کد: WELCOME10", badge: "WELCOME10" },
  { gradient: "from-emerald-500 to-teal-600", title: "ارسال رایگان", desc: "برای سفارش‌های بالای ۵۰۰ هزار تومان", badge: null },
  { gradient: "from-amber-500 to-orange-500", title: "فروش ویژه", desc: "تا ۵۰٪ تخفیف روی محصولات منتخب", badge: null },
];

/** نوار ویژگی‌ها با انیمیشن */
export function FeaturesStrip() {
  const featuresData = useQuery(api.settings.get, { key: "landingFeatures" });
  const features = useMemo(() => {
    if (Array.isArray(featuresData) && featuresData.length > 0) {
      return featuresData.map((f: any) => ({
        ...f,
        IconComp: ICON_MAP[f.icon] || Truck,
      }));
    }
    return DEFAULT_FEATURES.map((f) => ({ ...f, IconComp: ICON_MAP[f.icon] || Truck }));
  }, [featuresData]);

  return (
    <section className="py-6 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow group"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color} group-hover:scale-110 transition-transform`}>
                <f.IconComp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{f.title}</p>
                <p className="text-[11px] text-gray-400">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** بخش فروش ویژه با تایمر شمارش معکوس */
export function FlashSaleSection() {
  const products = useQuery(api.products.getFeatured, { limit: 6 });
  if (!products || products.length === 0) return null;

  const discounted = products.filter((p) => p.salePrice && p.salePrice < p.price);
  if (discounted.length === 0) return null;

  return (
    <section className="py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 rounded-3xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3 blur-xl" />

          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Flame className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-extrabold text-white">پیشنهاد ویژه و شگفت‌انگیز</h2>
                <p className="text-xs text-white/70">فرصت محدود — تا ۵۰٪ تخفیف</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-xs font-bold">
              <Clock className="h-3 w-3 inline ml-1" /> مهلت خرید محدود
            </div>
          </div>

          <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {discounted.slice(0, 6).map((product) => (
              <Link key={product._id} to={`/products/${product.slug}`}>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white rounded-2xl p-3 hover:shadow-lg transition-all">
                  <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden mb-2">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-gray-700 line-clamp-2">{product.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-extrabold text-red-600">{product.salePrice!.toLocaleString("fa-IR")}</span>
                    <span className="text-[9px] text-gray-400">ت</span>
                  </div>
                  <span className="text-[10px] text-gray-400 line-through">{product.price.toLocaleString("fa-IR")} ت</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** بخش بنرهای تبلیغاتی */
export function BannerSection({ position = "middle_banners" }: { position?: string }) {
  const activeBanners = useQuery((api as any).banners.listActive, { position });
  
  const bannersData = useQuery(api.settings.get, { key: "landingBanners" });
  const banners = useMemo(() => {
    // If we have actual database banners for this position, use them
    if (activeBanners && activeBanners.length > 0) {
      return activeBanners.map((b: any) => ({
        ...b,
        IconComp: Gift,
      }));
    }
    
    if (Array.isArray(bannersData) && bannersData.length > 0) {
      return bannersData.map((b: any) => ({
        ...b,
        IconComp: Gift,
        badge: b.badge || null,
      }));
    }
    return DEFAULT_BANNERS.map((b) => ({ ...b, IconComp: Gift }));
  }, [activeBanners, bannersData]);

  return (
    <section className="py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-3 gap-4">
          {banners.map((b: any, i: number) => (
            <Link key={i} to={b.link || "/products"}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`${b.imageUrl ? 'bg-gray-100' : `bg-gradient-to-br ${b.gradient}`} rounded-3xl p-6 text-white relative overflow-hidden cursor-pointer group min-h-[160px]`}
              >
                {b.imageUrl ? (
                  <>
                    <img src={b.imageUrl} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </>
                ) : (
                  <>
                    <div className="absolute top-0 left-0 h-24 w-24 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute bottom-0 right-0 h-16 w-16 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3 group-hover:scale-125 transition-transform duration-500" />
                  </>
                )}
                
                <div className="relative z-10 h-full flex flex-col justify-end">
                  {!b.imageUrl && <b.IconComp className="h-8 w-8 mb-3 text-white/80" />}
                  <h3 className="text-lg font-bold mb-1 drop-shadow-md">{b.title}</h3>
                  {b.desc && <p className="text-xs text-white/90 mb-3 drop-shadow-md">{b.desc}</p>}
                  {b.badge && <span className="text-xs font-mono bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg self-start">{b.badge}</span>}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** بخش محصولات با عنوان */
export function ProductSection({ title, subtitle, products, icon: Icon }: {
  title: string;
  subtitle: string;
  products: any[] | undefined;
  icon: any;
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </motion.div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
          </div>
          <Link to="/products" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline group">
            مشاهده همه
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, 5).map((product: any, i: number) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** بخش CTA نهایی */
export function CTASection() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-12 text-center"
        >
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -5, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />

          <div className="relative">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-extrabold text-white mb-3">آماده‌اید شروع کنید؟</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">همین الان به فروشگاه بپیوندید و از تخفیف‌ها و محصولات ویژه بهره‌مند شوید.</p>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-2xl bg-white text-gray-900 px-8 py-3.5 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                ساخت حساب رایگان
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
