import { Link, useNavigate, useLocation } from "react-router";
import * as LucideIcons from "lucide-react";
import { ShoppingCart, Search, X, Menu, User, Heart } from "lucide-react";
import { useAppName } from "@/hooks/use-app-name";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MegaMenu } from "./MegaMenu";
import { MobileBottomBar } from "./MobileBottomBar";
import { useLandingNav } from "@/hooks/use-landing-nav";

/**
 * ناوبری حرفه‌ای صفحه فروشگاه
 * — ۳ ردیف: نوار ابزار بالا + لوگو/جستجو/آیکون‌ها + منوی دسته‌بندی با مگامنو
 */
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const appName = useAppName();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<{ id: string; name: string } | null>(null);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const products = useQuery(api.products.listActive);
  const categories = useQuery(api.categories.list);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const catNavRef = useRef<HTMLDivElement>(null);
  const navConfig = useLandingNav();

  /** تبدیل نام آیکون به کامپوننت */
  const getIcon = (iconName?: string) => {
    if (!iconName || !(iconName in LucideIcons)) return null;
    const IconComp = (LucideIcons as any)[iconName];
    return IconComp ? <IconComp className="h-3.5 w-3.5" /> : null;
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || !products) { setSuggestions([]); return; }
    const q = searchQuery.toLowerCase();
    const results = products
      .filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.some((t: string) => t.toLowerCase().includes(q)))
      .slice(0, 6);
    setSuggestions(results);
  }, [searchQuery, products]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q: string) => {
    const query = q.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setSearchQuery("");
      setMobileSearchOpen(false);
    }
  };

  const handleCatEnter = (cat: { _id: string; name: string }) => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setHoveredCat({ id: cat._id, name: cat.name });
    setMegaMenuOpen(true);
  };

  const handleCatLeave = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setMegaMenuOpen(false);
      setHoveredCat(null);
    }, 150);
  };

  const handleMegaEnter = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
  };

  return (
    <>
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg shadow-black/5" : ""}`}>
      {/* ── ردیف ۱: نوار ابزار بالا (داینامیک — راست / مرکز / چپ) ── */}
      {(() => {
        const r1Visible = [
          ...navConfig.row1.rightItems,
          ...navConfig.row1.centerItems,
          ...navConfig.row1.leftItems,
        ].filter((i) => i.visible);
        if (r1Visible.length === 0) return null;
        return (
          <div className="hidden md:block" style={{ backgroundColor: navConfig.row1.bgColor, color: navConfig.row1.textColor }}>
            <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-1.5 text-[11px]">
              {/* سمت راست */}
              <div className="flex items-center gap-5">
                {navConfig.row1.rightItems.filter((i) => i.visible).map((item) => (
                  item.url.startsWith("/") ? (
                    <Link key={item.id} to={item.url} className="flex items-center gap-1.5 hover:text-white transition-colors">
                      {getIcon(item.icon)} <span>{item.label}</span>
                    </Link>
                  ) : (
                    <a key={item.id} href={item.url} target={item.openInNewTab ? "_blank" : undefined} rel={item.openInNewTab ? "noopener noreferrer" : undefined} className="flex items-center gap-1.5 hover:text-white transition-colors">
                      {getIcon(item.icon)} <span>{item.label}</span>
                    </a>
                  )
                ))}
              </div>

              {/* مرکز */}
              <div className="flex items-center gap-4">
                {navConfig.row1.centerItems.filter((i) => i.visible).map((item) => (
                  item.url.startsWith("/") ? (
                    <Link key={item.id} to={item.url} className="flex items-center gap-1.5 hover:text-white transition-colors font-semibold">
                      {getIcon(item.icon)} <span>{item.label}</span>
                    </Link>
                  ) : (
                    <a key={item.id} href={item.url} target={item.openInNewTab ? "_blank" : undefined} rel={item.openInNewTab ? "noopener noreferrer" : undefined} className="flex items-center gap-1.5 hover:text-white transition-colors font-semibold">
                      {getIcon(item.icon)} <span>{item.label}</span>
                    </a>
                  )
                ))}
              </div>

              {/* سمت چپ */}
              <div className="flex items-center gap-5">
                {navConfig.row1.leftItems.filter((i) => i.visible).map((item) => (
                  item.url.startsWith("/") ? (
                    <Link key={item.id} to={item.url} className="flex items-center gap-1.5 hover:text-white transition-colors">
                      {getIcon(item.icon)} <span>{item.label}</span>
                    </Link>
                  ) : (
                    <a key={item.id} href={item.url} target={item.openInNewTab ? "_blank" : undefined} rel={item.openInNewTab ? "noopener noreferrer" : undefined} className="flex items-center gap-1.5 hover:text-white transition-colors">
                      {getIcon(item.icon)} <span>{item.label}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── ردیف ۲: لوگو + جستجو + آیکون‌ها (داینامیک) ── */}
      <div style={{ backgroundColor: navConfig.row2.bgColor, borderBottomColor: navConfig.row2.borderColor }} className="border-b">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-white text-sm font-extrabold shadow-md shadow-primary/20">
              {appName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-extrabold tracking-tight text-gray-900 block leading-tight">{appName.split(" ")[0]}</span>
              {navConfig.row2.logoLabel && <span className="text-[10px] text-gray-400 font-medium leading-none">{navConfig.row2.logoLabel}</span>}
            </div>
          </Link>

          {/* جستجوی دسکتاپ */}
          {navConfig.row2.showSearch && (<div className="flex-1 max-w-2xl hidden md:block relative" ref={suggestionsRef}>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchQuery); }}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="چی میخوای پیدا کنی؟"
                className="w-full h-11 rounded-2xl bg-gray-50 border border-gray-200 pl-12 pr-12 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all duration-200"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSuggestions([]); }} className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => handleSearch(searchQuery)} className="absolute left-2 top-1/2 -translate-y-1/2 h-7 px-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1">
                <Search className="h-3 w-3" />
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-black/10 overflow-hidden z-50">
                <div className="p-2">
                  {suggestions.map((p) => (
                    <button key={p._id} onClick={() => { navigate(`/products/${p.slug || p._id}`); setShowSuggestions(false); setSearchQuery(""); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-right">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="h-11 w-11 rounded-xl object-cover ring-1 ring-gray-100" /> : <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">ندارد</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.salePrice ? (
                            <><span className="text-xs font-bold text-primary">{p.salePrice.toLocaleString("fa-IR")} <span className="text-[10px] font-normal">تومان</span></span><span className="text-[10px] text-gray-400 line-through">{p.price?.toLocaleString("fa-IR")}</span></>
                          ) : (
                            <span className="text-xs font-bold text-gray-700">{p.price?.toLocaleString("fa-IR")} <span className="text-[10px] font-normal">تومان</span></span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => handleSearch(searchQuery)} className="w-full px-4 py-3 text-sm text-primary font-semibold hover:bg-primary/5 transition-colors border-t border-gray-100 flex items-center justify-center gap-2">
                  <Search className="h-3.5 w-3.5" /> مشاهده همه نتایج «{searchQuery}»
                </button>
              </div>
            )}
          </div>
          )}

          {/* آیکون‌ها (داینامیک) */}
          <div className="flex items-center gap-1">
            <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="md:hidden p-2.5 rounded-2xl hover:bg-gray-100 text-gray-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            {navConfig.row2.showWishlist && (
              <Link to="/dashboard/profile" className="p-2.5 rounded-2xl hover:bg-gray-100 text-gray-600 transition-colors hidden sm:flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </Link>
            )}
            {navConfig.row2.showCart && (
              <Link to="/dashboard/cart" className="p-2.5 rounded-2xl hover:bg-gray-100 text-gray-600 transition-colors relative flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-0.5 -left-0.5 h-4 min-w-[16px] flex items-center justify-center bg-primary text-white text-[9px] font-bold rounded-full px-1">۰</span>
              </Link>
            )}
            {navConfig.row2.showWishlist && navConfig.row2.showCart && (
              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
            )}
            {navConfig.row2.showAuth && (
              isAuthenticated ? (
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                  <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center"><User className="h-4 w-4" /></div>
                  <span className="text-sm font-semibold hidden sm:block">پنل کاربری</span>
                </Link>
              ) : (
                <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                  <User className="h-4 w-4" /><span className="text-sm font-bold hidden sm:block">{navConfig.row2.authLabel}</span>
                </Link>
              )
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2.5 rounded-2xl hover:bg-gray-100 text-gray-600 transition-colors">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── ردیف ۳: منوی دسته‌بندی با مگامنو (داینامیک) ── */}
      <div className="hidden lg:block relative" style={{ backgroundColor: navConfig.row3.bgColor, color: navConfig.row3.textColor, borderBottom: "1px solid #f3f4f6" }}>
        <div className="mx-auto max-w-7xl flex items-center gap-1 px-4 overflow-x-auto scrollbar-none" ref={catNavRef}>
          {/* آیتم‌های سمت راست */}
          {navConfig.row3.rightItems.filter((i) => i.visible).map((item) => (
            item.url.startsWith("/") ? (
              <Link key={item.id} to={item.url} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold rounded-xl transition-all hover:bg-gray-50">
                <span className="flex items-center gap-1.5">{getIcon(item.icon)} {item.label}</span>
              </Link>
            ) : (
              <a key={item.id} href={item.url} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold rounded-xl transition-all hover:bg-gray-50">
                <span className="flex items-center gap-1.5">{getIcon(item.icon)} {item.label}</span>
              </a>
            )
          ))}
          {navConfig.row3.rightItems.filter((i) => i.visible).length > 0 && <div className="w-px h-4 bg-gray-200 mx-1" />}

          {/* آیتم مرکز — فروشگاه */}
          <Link to={navConfig.row3.centerUrl} className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold rounded-xl transition-all`} style={{ color: location.pathname === navConfig.row3.centerUrl ? navConfig.row3.activeColor : undefined, backgroundColor: location.pathname === navConfig.row3.centerUrl ? navConfig.row3.activeColor + "15" : undefined }}>
            {navConfig.row3.centerLabel}
          </Link>
          <div className="w-px h-4 bg-gray-200 mx-1" />

          {/* دسته‌بندی‌های داینامیک از دیتابیس (مخفی‌شده‌ها نمایش داده نمی‌شوند) */}
          {categories && categories.filter((c: any) => !c.parentId && !navConfig.row3.hiddenCategoryIds.includes(c._id)).slice(0, 10).map((cat: any) => (
            <button
              key={cat._id}
              onMouseEnter={() => handleCatEnter(cat)}
              onMouseLeave={handleCatLeave}
              className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold rounded-xl transition-all"
              style={{ color: megaMenuOpen && hoveredCat?.id === cat._id ? navConfig.row3.activeColor : undefined, backgroundColor: megaMenuOpen && hoveredCat?.id === cat._id ? navConfig.row3.activeColor + "15" : undefined }}
            >
              {cat.name}
            </button>
          ))}

          <div className="w-px h-4 bg-gray-200 mx-1" />

          {/* آیتم‌های سمت چپ */}
          {navConfig.row3.leftItems.filter((i) => i.visible).map((item) => (
            item.url.startsWith("/") ? (
              <Link key={item.id} to={item.url} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold rounded-xl transition-all hover:bg-gray-50">
                <span className="flex items-center gap-1.5">{getIcon(item.icon)} {item.label}</span>
              </Link>
            ) : (
              <a key={item.id} href={item.url} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold rounded-xl transition-all hover:bg-gray-50">
                <span className="flex items-center gap-1.5">{getIcon(item.icon)} {item.label}</span>
              </a>
            )
          ))}
        </div>

        {/* مگامنو */}
        <div onMouseEnter={handleMegaEnter} onMouseLeave={handleCatLeave}>
          <MegaMenu isOpen={megaMenuOpen} categoryId={hoveredCat?.id || null} categoryName={hoveredCat?.name || ""} onClose={() => { setMegaMenuOpen(false); setHoveredCat(null); }} />
        </div>
      </div>

      {/* جستجوی موبایل */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 bg-white border-b border-gray-100">
          <div className="relative mt-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchQuery); }} placeholder="جستجوی محصولات..." autoFocus className="w-full h-11 rounded-2xl bg-gray-50 border border-gray-200 pl-4 pr-10 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="h-4 w-4" /></button>}
          </div>
        </div>
      )}

      {/* منوی موبایل */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-lg max-h-[70vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {[
              { to: "/products", label: "فروشگاه" },
              { to: "/about", label: "درباره ما" },
              { to: "/contact", label: "تماس با ما" },
              { to: "/track-order", label: "پیگیری سفارش" },
              { to: "/blog", label: "بلاگ" },
              { to: "/compare", label: "مقایسه محصولات" },
            ].map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">{item.label}</Link>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"} onClick={() => setMobileMenuOpen(false)} className="block w-full text-center rounded-2xl bg-primary text-white px-4 py-3 text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                {isAuthenticated ? "پنل کاربری" : "ورود / ثبت‌نام"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>

    {/* نوار پایین موبایل */}
    <MobileBottomBar />
    </>
  );
}
