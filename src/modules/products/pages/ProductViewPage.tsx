/**
 * 👁 صفحه مشاهده جزئیات محصول (ادمین)
 * — گالری تصاویر با قابلیت زوم
 * — اطلاعات کامل محصول
 * — لینک ویرایش سریع
 */
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, Link, useNavigate } from "react-router";
import { Loader2, Edit3, ArrowRight, Star, Eye, Tag, Package, ShoppingCart, BarChart3, Clock } from "lucide-react";
import { useState } from "react";

export default function ProductViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useQuery(api.products.getBySlug, slug ? { slug } : "skip");
  const categories = useQuery(api.categories.listActive);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const category = categories?.find((c: any) => c._id === product.categoryId);
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;
  const features = product.features ? Object.entries(product.features as Record<string, string>) : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {category?.name} {product.brand && `· ${product.brand}`}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/products/${product.slug}`} target="_blank" className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-accent text-accent-foreground">
            <Eye className="h-4 w-4" /> پیش‌نمایش
          </a>
          <Link to={`/dashboard/products/edit/${product.slug}`} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            <Edit3 className="h-4 w-4" /> ویرایش
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── گالری تصاویر ── */}
        <div className="space-y-3">
          {/* تصویر اصلی */}
          <div
            className="clay-card overflow-hidden aspect-square cursor-pointer relative group"
            onClick={() => setZoomed(!zoomed)}
            onMouseMove={(e) => {
              if (!zoomed) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setZoomPos({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
            }}
          >
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-200 ${zoomed ? "scale-[2.5]" : "group-hover:scale-105"}`}
                style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl text-muted-foreground/20">📦</div>
            )}
            {/* آیکون زوم */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-destructive text-white text-sm font-bold px-3 py-1 rounded-xl">
                {discountPercent}% تخفیف
              </span>
            )}
          </div>

          {/* تصاویر کوچک */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => { setSelectedImage(i); setZoomed(false); }}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── اطلاعات محصول ── */}
        <div className="space-y-4">
          {/* قیمت */}
          <div className="clay-card p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{product.price.toLocaleString("fa-IR")}</span>
              <span className="text-sm text-muted-foreground">تومان</span>
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg line-through text-muted-foreground">{product.price.toLocaleString("fa-IR")}</span>
                <span className="text-sm font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">%{discountPercent} تخفیف</span>
              </div>
            )}
          </div>

          {/* آمار */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Package className="h-4 w-4" />} label="موجودی" value={`${product.stock} عدد`} color={product.stock > 0 ? "text-emerald-600" : "text-rose-500"} />
            <StatCard icon={<Eye className="h-4 w-4" />} label="بازدید" value={String(product.views || 0)} color="text-blue-600" />
            <StatCard icon={<Star className="h-4 w-4" />} label="امتیاز" value={`${product.rating ?? 0} (${product.reviewCount ?? 0})`} color="text-amber-500" />
          </div>

          {/* توضیح کوتاه */}
          {product.shortDescription && (
            <div className="clay-card p-4">
              <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
            </div>
          )}

          {/* تگ‌ها */}
          {product.tags && product.tags.length > 0 && (
            <div className="clay-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> برچسب‌ها</h3>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* ویژگی‌ها */}
          {features.length > 0 && (
            <div className="clay-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground">ویژگی‌ها</h3>
              <div className="grid grid-cols-2 gap-2">
                {features.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نشان‌های اعتماد */}
          {product.trustBadges && product.trustBadges.length > 0 && (
            <div className="clay-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground">نشان‌های اعتماد (مزایا)</h3>
              <div className="flex flex-col gap-2">
                {product.trustBadges.map((badge: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{badge.label}</span>
                    <span className="font-medium text-[10px] text-muted-foreground">{badge.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* وضعیت */}
          <div className="clay-card p-4 flex flex-wrap gap-3">
            <StatusBadge label="وضعیت" active={product.isActive !== false} />
            <StatusBadge label="ویژه" active={!!product.isFeatured} />
            {category && <span className="text-xs bg-muted px-2.5 py-1 rounded-lg">📁 {category.name}</span>}
          </div>
        </div>
      </div>

      {/* توضیحات کامل */}
      {product.description && (
        <div className="clay-card p-6">
          <h3 className="font-semibold text-sm mb-3">توضیحات کامل</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="clay-card p-3 text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      {active ? `✅ ${label}` : `❌ ${label}`}
    </span>
  );
}
