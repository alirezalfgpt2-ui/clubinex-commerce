import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, Link } from "react-router";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useQuery(api.products.getBySlug, slug ? { slug } : "skip");
  const categories = useQuery(api.categories.listActive);
  const addToCart = useMutation(api.cart.addItem);
  const trackView = useMutation(api.products.trackView);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div></div>;
  }

  const category = categories?.find((c: any) => c._id === product.categoryId);
  const features = product.features ? Object.entries(product.features as Record<string, string>) : [];

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("برای افزودن به سبد خرید وارد شوید");
      navigate("/auth?returnTo=" + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      await addToCart({ productId: product._id as any, quantity: 1 });
      toast.success("به سبد خرید اضافه شد!");
    } catch {
      toast.error("خطا در افزودن به سبد");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">خانه</Link><span>/</span>
        {category && <><Link to="/products" className="hover:text-primary">{category.name}</Link><span>/</span></>}
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="clay-card overflow-hidden aspect-square">
            {product.images[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? "border-primary" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
              ))}
              <span className="text-sm text-muted-foreground mr-1">({product.reviewCount || 0} نظر)</span>
            </div>
          )}

          <div className="clay-card p-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{product.price.toLocaleString("fa-IR")}</span>
              <span className="text-sm text-muted-foreground">تومان</span>
            </div>
            {product.salePrice && (
              <div className="flex items-center gap-2">
                <span className="text-lg line-through text-muted-foreground">{product.price.toLocaleString("fa-IR")}</span>
                <span className="text-sm font-semibold text-rose-500">%{Math.round((1 - product.salePrice / product.price) * 100)} تخفیف</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {product.views} بازدید</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {product.stock > 0 ? `${product.stock} موجود` : "ناموجود"}
            </span>
          </div>

          {features.length > 0 && (
            <div className="clay-card p-4 space-y-2">
              <h3 className="font-semibold text-sm">ویژگی‌ها</h3>
              {features.map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm"><span className="text-muted-foreground">{key}</span><span className="font-medium">{value}</span></div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleAddToCart} className="clay-button flex-1 flex items-center justify-center gap-2 py-3 font-semibold">
              <ShoppingCart className="h-5 w-5" /> افزودن به سبد خرید
            </button>
            <button className="clay-button px-4 py-3"><Heart className="h-5 w-5" /></button>
          </div>

          {product.description && (
            <div className="clay-card p-4">
              <h3 className="font-semibold text-sm mb-2">توضیحات</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
