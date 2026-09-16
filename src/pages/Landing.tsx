/**
 * 🏠 صفحه اصلی فروشگاه
 * — بخش‌های محصولات از تنظیمات داینامیک دیتابیس خوانده می‌شوند
 * — fallback به حالت پیش‌فرض اگر تنظیمات ذخیره نشده باشد
 */
import { SEO } from "@/components/SEO";
import { PageTransition } from "@/components/PageTransition";
import { HeroSlider } from "@/modules/landing/components/HeroSlider";
import { CategoryShowcase } from "@/modules/landing/components/CategoryShowcase";
import { FeaturedProducts } from "@/modules/landing/components/FeaturedProducts";
import { LandingFooter } from "@/modules/landing/components/Footer";
import { LiveChatWidget } from "@/modules/landing/components/LiveChatWidget";
import { Navbar } from "@/modules/landing/components/Navbar";
import { FeaturesStrip, FlashSaleSection, BannerSection, ProductSection, CTASection } from "@/modules/landing/components/LandingSections";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrendingUp, Zap, Star, Sparkles } from "lucide-react";

interface SectionConfig {
  title: string;
  subtitle: string;
  productIds: string[];
  limit: number;
  showTimer: boolean;
  isActive: boolean;
}

/** صفحه اصلی فروشگاه */
export default function Landing() {
  // ── queries ──
  const featured = useQuery(api.products.getFeatured, { limit: 8 });
  const newest = useQuery(api.products.getNewest, { limit: 8 });
  const mostViewed = useQuery(api.products.getMostViewed, { limit: 8 });
  const allProducts = useQuery(api.products.listActive);
  const sectionsConfig = useQuery(api.settings.get, { key: "productSections" });

  // ── Parse config ──
  const config = (sectionsConfig?.value as Record<string, SectionConfig>) || null;

  // Helper: get products by IDs (or fall back to query results)
  const getProducts = (ids: string[], fallback: typeof featured, limit: number) => {
    if (ids.length > 0 && allProducts) {
      const matched = ids.map((id) => allProducts.find((p) => p._id === id)).filter(Boolean);
      return matched.slice(0, limit);
    }
    return fallback?.slice(0, limit) || [];
  };

  // ── Build sections from config ──
  const dynamicSections: React.ReactNode[] = [];

  if (config) {
    // Flash Sale
    if (config.flashSale?.isActive) {
      dynamicSections.push(
        <FlashSaleSection key="flashSale" />
      );
    }
    // Featured
    if (config.featured?.isActive) {
      const products = getProducts(config.featured.productIds, featured, config.featured.limit);
      if (products.length > 0) {
        dynamicSections.push(
          <ProductSection key="featured" title={config.featured.title} subtitle={config.featured.subtitle} products={products} icon={Star} />
        );
      }
    }
    // Best Sellers
    if (config.bestSellers?.isActive) {
      const products = getProducts(config.bestSellers.productIds, featured, config.bestSellers.limit);
      if (products.length > 0) {
        dynamicSections.push(
          <ProductSection key="bestSellers" title={config.bestSellers.title} subtitle={config.bestSellers.subtitle} products={products} icon={TrendingUp} />
        );
      }
    }
    // Newest
    if (config.newest?.isActive) {
      const products = getProducts(config.newest.productIds, newest, config.newest.limit);
      if (products.length > 0) {
        dynamicSections.push(
          <ProductSection key="newest" title={config.newest.title} subtitle={config.newest.subtitle} products={products} icon={Zap} />
        );
      }
    }
    // Amazing Deals
    if (config.amazingDeals?.isActive) {
      const products = getProducts(config.amazingDeals.productIds, mostViewed, config.amazingDeals.limit);
      if (products.length > 0) {
        dynamicSections.push(
          <ProductSection key="amazingDeals" title={config.amazingDeals.title} subtitle={config.amazingDeals.subtitle} products={products} icon={Sparkles} />
        );
      }
    }
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-white">
      <SEO
        title="فروشگاه آنلاین | خرید آنلاین با بهترین قیمت"
        description="خرید آنلاین محصولات متنوع با بهترین قیمت، ارسال سریع و ضمانت اصالت"
        keywords="فروشگاه, خرید آنلاین, تخفیف, ارسال رایگان"
      />
      <Navbar />
      <HeroSlider />
      <FeaturesStrip />

      {/* ── بخش‌های داینامیک محصولات ── */}
      {config ? (
        dynamicSections
      ) : (
        <>
          <FlashSaleSection />
          <BannerSection />
          <CategoryShowcase />
          <ProductSection title="محصولات پرفروش" subtitle="محبوب‌ترین محصولات فروشگاه" products={featured} icon={TrendingUp} />
          <ProductSection title="جدیدترین محصولات" subtitle="تازه‌ترین کالاهای اضافه‌شده" products={newest} icon={Zap} />
          <FeaturedProducts />
          <ProductSection title="پربازدیدترین" subtitle="محصولات مورد توجه کاربران" products={mostViewed} icon={Star} />
        </>
      )}

      <BannerSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <CTASection />
      <LandingFooter />
      <LiveChatWidget />
    </div>
    </PageTransition>
  );
}
