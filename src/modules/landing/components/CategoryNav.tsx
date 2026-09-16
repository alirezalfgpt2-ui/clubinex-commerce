/**
 * CategoryNav — نوار دسته‌بندی افقی زیر ناوبری
 * آیکون‌ها بالا و نام زیرش — طراحی مدرن و زیبا
 */
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/** آیکون‌های پیش‌فرض برای دسته‌بندی‌ها */
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

export function CategoryNav() {
  const categories = useQuery(api.categories.listActive);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const absScroll = Math.abs(el.scrollLeft);
    // In RTL, scrollLeft starts at 0 and becomes negative (or positive in some old browsers) as you scroll left
    // We can scroll right (back to start) if we are not at 0
    setCanScrollRight(absScroll > 5);
    // We can scroll left (towards end) if we haven't reached the max scroll
    setCanScrollLeft(absScroll < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      // Scroll horizontally instead of vertically
      // In RTL, deltaY > 0 (scrolling down) usually means scrolling left (towards end)
      const isRTL = window.getComputedStyle(el).direction === "rtl";
      const scrollAmount = e.deltaY;
      el.scrollBy({ left: isRTL ? -scrollAmount : scrollAmount });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const isRTL = window.getComputedStyle(el).direction === "rtl";
    // In RTL, to go left we need negative scroll (usually). 
    const scrollAmount = dir === "left" ? -250 : 250;
    el.scrollBy({ left: isRTL ? scrollAmount : (dir === "left" ? -250 : 250), behavior: "smooth" });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="sticky top-[52px] z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-7xl relative">
        {/* فلش راست (برگشت به ابتدا) */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent text-gray-400 hover:text-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* لیست دسته‌بندی‌ها */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-end gap-0.5 px-6 py-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* همه محصولات */}
          <Link
            to="/products"
            className="shrink-0 flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl text-center hover:bg-primary/5 transition-all group min-w-[72px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all group-hover:scale-110 group-hover:shadow-md shadow-sm">
              <span className="text-xl">🛒</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-primary transition-colors leading-tight">
              همه محصولات
            </span>
          </Link>

          {categories.map((cat: any) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="shrink-0 flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl text-center hover:bg-primary/5 transition-all group min-w-[72px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/80 group-hover:from-primary/10 group-hover:to-primary/5 transition-all group-hover:scale-110 group-hover:shadow-md shadow-sm overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {CATEGORY_ICONS[cat.slug] || "📂"}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-gray-600 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* فلش چپ (اسکرول به انتها) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent text-gray-400 hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
