import { Link } from "react-router";
import { motion } from "framer-motion";
import { Clock, User, Search } from "lucide-react";
import { formatJalaliDate } from "@/lib/jalali";
import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";

const SAMPLE_ARTICLES = [
  {
    id: "1",
    title: "راهنمای جامع خرید گوشی هوشمند در سال ۱۴۰۵",
    excerpt: "در این مقاله به بررسی نکات مهم هنگام خرید گوشی هوشمند می‌پردازیم: پردازنده، دوربین، باتری و نمایشگر.",
    category: "راهنما",
    author: "تیم فنی Clubinex",
    date: Date.now() - 2 * 86400000,
    readTime: "۵ دقیقه",
    image: "https://picsum.photos/seed/blog-phone/800/400",
    tags: ["موبایل", "راهنمای خرید", "تکنولوژی"],
  },
  {
    id: "2",
    title: "۱۰ نکته برای بهبود عمر باتری لپتاپ",
    excerpt: "با رعایت این نکات ساده می‌توانید عمر باتری لپتاپ خود را تا ۳۰٪ افزایش دهید و کمتر به شارژر وابسته باشید.",
    category: "فنی",
    author: "علی محمدی",
    date: Date.now() - 5 * 86400000,
    readTime: "۳ دقیقه",
    image: "https://picsum.photos/seed/blog-laptop/800/400",
    tags: ["لپتاپ", "نکته فنی", "باتری"],
  },
  {
    id: "3",
    title: "ترندهای مد پاییز ۱۴۰۵: رنگ‌ها و استایل‌های محبوب",
    excerpt: "آشنایی با ترندهای روز دنیای مد و پوشاک برای فصل پاییز. از رنگ‌های خاکی تا استایل‌های مینیمال.",
    category: "مد و استایل",
    author: "سارا احمدی",
    date: Date.now() - 10 * 86400000,
    readTime: "۴ دقیقه",
    image: "https://picsum.photos/seed/blog-fashion/800/400",
    tags: ["مد", "استایل", "پاییز"],
  },
  {
    id: "4",
    title: "مقایسه کامل Samsung Galaxy S24 Ultra و iPhone 15 Pro Max",
    excerpt: "مقایسه دو پرچم‌دار بازار موبایل: دوربین، عملکرد، باتری و نمایشگر. کدام برای شما مناسب‌تر است؟",
    category: "مقایسه",
    author: "تیم فنی Clubinex",
    date: Date.now() - 15 * 86400000,
    readTime: "۸ دقیقه",
    image: "https://picsum.photos/seed/blog-compare/800/400",
    tags: ["مقایسه", "سامسونگ", "اپل"],
  },
  {
    id: "5",
    title: "نکات مهم برای مراقبت از لوازم آشپزخانه",
    excerpt: "با رعایت این نکات می‌توانید عمر لوازم آشپزخانه خود را افزایش دهید و هزینه‌های تعمیر و تعویض را کاهش دهید.",
    category: "خانه و آشپزخانه",
    author: "مریم رضایی",
    date: Date.now() - 20 * 86400000,
    readTime: "۳ دقیقه",
    image: "https://picsum.photos/seed/blog-home/800/400",
    tags: ["خانه", "آشپزخانه", "نگهداری"],
  },
  {
    id: "6",
    title: "معرفی بهترین لپتاپ‌های گیمینگ زیر ۱۰۰ میلیون تومان",
    excerpt: "بررسی و معرفی ۵ لپتاپ گیمینگ برتر بازار ایران در محدوده قیمتی زیر ۱۰۰ میلیون تومان.",
    category: "محصول",
    author: "تیم فنی Clubinex",
    date: Date.now() - 25 * 86400000,
    readTime: "۶ دقیقه",
    image: "https://picsum.photos/seed/blog-gaming/800/400",
    tags: ["لپتاپ", "گیمینگ", "معرفی محصول"],
  },
];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(SAMPLE_ARTICLES.map((a) => a.category));
    return Array.from(cats);
  }, []);

  const filteredArticles = useMemo(() => {
    return SAMPLE_ARTICLES.filter((a) => {
      if (search) {
        const q = search.toLowerCase();
        if (!a.title.toLowerCase().includes(q) && !a.excerpt.toLowerCase().includes(q) && !a.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (selectedCategory && a.category !== selectedCategory) return false;
      return true;
    });
  }, [search, selectedCategory]);

  return (
    <>
      <SEO title="بلاگ و اخبار | فروشگاه" description="آخرین اخبار و مقالات فروشگاه" keywords="بلاگ, اخبار, مقاله" />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="text-sm text-gray-400 hover:text-primary transition-colors">← بازگشت به خانه</Link>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">بلاگ و اخبار</h1>
          <p className="text-sm text-gray-400">مقالات آموزشی، اخبار و راهنماهای خرید</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی مقالات..." className="w-full h-11 rounded-xl bg-white border border-gray-200 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setSelectedCategory("")} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${!selectedCategory ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary/30"}`}>
              همه
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedCategory === cat ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary/30"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-4">📝</p>
            <h3 className="text-lg font-bold text-gray-700 mb-2">مقاله‌ای یافت نشد</h3>
            <p className="text-sm text-gray-400">عبارت جستجو یا دسته‌بندی را تغییر دهید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group cursor-pointer"
              >
                <div className="aspect-[2/1] bg-gray-50 overflow-hidden">
                  <img src={article.image} alt={article.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{article.category}</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock className="h-3 w-3" /> {article.readTime}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-relaxed">{article.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-[11px] text-gray-500">{article.author}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatJalaliDate(article.date)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">#{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
