import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, ShoppingBag, Percent, Truck, Zap } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/** اسلایدهای پیش‌فرض — اگر دیتابیس خالی باشد */
const DEFAULT_SLIDES = [
  {
    badge: "فروش ویژه تا ۵۰٪ تخفیف",
    title: "خرید هوشمند،",
    highlight: "زندگی آسان‌تر",
    desc: "هزاران محصول متنوع با بهترین قیمت‌ها، ارسال سریع به سراسر کشور و ضمانت اصالت کالا.",
    btnPrimary: "شروع خرید",
    btnSecondary: "مشاهده تخفیف‌ها",
    gradient: "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]",
  },
  {
    badge: "ارسال رایگان بالای ۵۰۰ هزار تومان",
    title: "کیفیت تضمینی،",
    highlight: "ارسال سریع",
    desc: "محصولات اورجینال با ضمانت بازگشت ۷ روزه. خریدی مطمئن و لذت‌بخش.",
    btnPrimary: "مشاهده محصولات",
    btnSecondary: "درباره ما",
    gradient: "from-[#0ea5e9] via-[#06b6d4] to-[#14b8a6]",
  },
  {
    badge: "تا ۵۰٪ تخفیف روی محصولات منتخب",
    title: "فروش ویژه،",
    highlight: "فرصت محدود",
    desc: "فرصت استثنایی خرید محصولات پرفروش با قیمت‌های باورنکردنی.",
    btnPrimary: "مشاهده فروش ویژه",
    btnSecondary: "مشاهده همه",
    gradient: "from-[#f43f5e] via-[#e11d48] to-[#be123c]",
  },
];

export function HeroSlider() {
  const featured = useQuery(api.products.getFeatured, { limit: 4 });
  const activeBanners = useQuery((api as any).banners.listActive, { position: "main_slider" });
  const heroSlidesData = useQuery(api.settings.get, { key: "heroSlides" });
  const [current, setCurrent] = useState(0);

  /** خواندن اسلایدها از دیتابیس یا استفاده از پیش‌فرض */
  const SLIDES = useMemo(() => {
    if (activeBanners && activeBanners.length > 0) {
      return activeBanners.map((b: any) => ({
        badge: b.badge || "پیشنهاد ویژه",
        title: b.title,
        highlight: "",
        desc: b.desc || "",
        btnPrimary: "مشاهده",
        btnSecondary: "بیشتر",
        gradient: "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]",
        imageUrl: b.imageUrl,
        link: b.link,
        mesh: "radial-gradient(ellipse_at_20%_50%, oklch(1_0_0_/_0.18)_0%, transparent_60%)"
      }));
    }
    if (Array.isArray(heroSlidesData) && heroSlidesData.length > 0) {
      return heroSlidesData.map((s: any) => ({ ...s, mesh: "radial-gradient(ellipse_at_20%_50%, oklch(1_0_0_/_0.18)_0%, transparent_60%)" }));
    }
    return DEFAULT_SLIDES;
  }, [activeBanners, heroSlidesData]);
  const [direction, setDirection] = useState(1);

  /** رفتن به اسلاید بعدی */
  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  /** رفتن به اسلاید قبلی */
  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  /** اتوپلی */
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  /** انیمیشن‌های اسلاید */
  const textVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <section className="relative overflow-hidden">
      {/* اسلاید اصلی */}
      <div className="relative min-h-[560px] md:min-h-[620px] flex items-center bg-gray-900">
        <AnimatePresence custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {slide.imageUrl ? (
              <>
                <img src={slide.imageUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              </>
            ) : (
              <>
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
                <div className="absolute inset-0" style={{ background: slide.mesh }} />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* اشکال تزئینی متحرک */}
        {!slide.imageUrl && (
          <>
            <motion.div
              className="absolute top-16 right-[12%] h-72 w-72 rounded-full bg-white/8 blur-3xl"
              animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-8 left-[8%] h-56 w-56 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/3 left-1/2 h-40 w-40 rounded-full bg-white/5 blur-2xl"
              animate={{ y: [-20, 20, -20] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {/* محتوا */}
        <div className="relative mx-auto max-w-7xl px-4 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* متن */}
            <div className="h-[380px] lg:h-[420px] flex flex-col justify-center relative"><AnimatePresence custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2"
              >
                {/* بج */}
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span className="text-xs font-semibold text-white/90">{slide.badge}</span>
                </motion.div>

                {/* عنوان */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
                  {slide.title}
                  <br />
                  <span className="text-amber-300">{slide.highlight}</span>
                </h1>

                {/* توضیح */}
                <p className="text-lg text-white/75 max-w-lg mb-8 leading-relaxed">
                  {slide.desc}
                </p>

                {/* دکمه‌ها */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-white text-gray-900 px-8 py-3.5 text-sm font-bold shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 hover:-translate-y-0.5 transition-all"
                  >
                    <ShoppingBag className="h-4.5 w-4.5" />
                    {slide.btnPrimary}
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm text-white px-6 py-3.5 text-sm font-semibold border border-white/20 hover:bg-white/20 transition-all"
                  >
                    {slide.btnSecondary}
                  </Link>
                </div>

                {/* نشان‌های اعتماد */}
                <div className="flex items-center gap-6 mt-10">
                  {[
                    { icon: Truck, text: "ارسال رایگان بالای ۵۰۰ هزار تومان" },
                    { icon: Percent, text: "تا ۵۰٪ تخفیف روی محصولات" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <b.icon className="h-4 w-4 text-amber-300" />
                      <span className="text-xs text-white/70">{b.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence></div>

            {/* کارت‌های محصولات */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {featured?.slice(0, 4).map((product, i) => {
                const hasDiscount = product.salePrice && product.salePrice < product.price;
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.12 }}
                    className={`${i === 0 ? "col-span-2" : ""}`}
                  >
                    <Link to={`/products/${product.slug}`}>
                      <div className="rounded-3xl bg-white/95 backdrop-blur-sm p-4 shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`rounded-2xl bg-muted/50 overflow-hidden mb-3 ${i === 0 ? "aspect-[2/1]" : "aspect-square"}`}>
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          {hasDiscount ? (
                            <>
                              <span className="text-base font-extrabold text-primary">{product.salePrice!.toLocaleString("fa-IR")} ت</span>
                              <span className="text-xs text-gray-400 line-through">{product.price.toLocaleString("fa-IR")} ت</span>
                              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-md">
                                {Math.round(((product.price - product.salePrice!) / product.price) * 100)}٪
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-extrabold text-primary">{product.price.toLocaleString("fa-IR")} ت</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ناوبری اسلاید */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {SLIDES.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* دکمه‌های قبل/بعد */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 rotate-180" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* نوار پیام‌های پایین */}
      <div className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-center gap-8 overflow-hidden">
          {["📦 ارسال رایگان", "✅ ضمانت اصالت", "🔒 پرداخت امن", "⚡ ارسال سریع", "💰 بهترین قیمت"].map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-xs text-white/60 whitespace-nowrap font-medium"
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
