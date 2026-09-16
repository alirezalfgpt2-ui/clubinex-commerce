import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useRef, useEffect } from "react";
import { Star, X, Scale, ArrowLeft, Package, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";

/**
 * صفحه مقایسه محصولات — ۳ دراپ‌داون جستجویی با طراحی حرفه‌ای
 */
export default function AdminComparePage() {
  const products = useQuery(api.products.listActive);
  const categories = useQuery(api.categories.listActive);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedProducts = useMemo(() => {
    if (!products || selectedIds.length === 0) return [];
    return selectedIds.map((id) => products.find((p: any) => p._id === id)).filter(Boolean);
  }, [products, selectedIds]);

  const allFeatureKeys = useMemo(() => {
    const keys = new Map<string, string>();
    for (const p of selectedProducts) {
      if (p?.features) {
        const catFeatures = categories?.find((c: any) => c._id === p.categoryId)?.features || [];
        for (const feat of catFeatures) {
          if ((p.features as any)[feat.key]) keys.set(feat.key, feat.label);
        }
      }
    }
    return keys;
  }, [selectedProducts, categories]);

  const addProduct = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 3) {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مقایسه محصولات</h1>
          <p className="text-sm text-muted-foreground mt-1">حداکثر ۳ محصول برای مقایسه انتخاب کنید</p>
        </div>
        <Link to="/dashboard/products" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> بازگشت به محصولات
        </Link>
      </div>

      {/* ۳ دراپ‌داون جستجویی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((idx) => (
          <CompareDropdown
            key={idx}
            index={idx}
            products={products || []}
            selectedIds={selectedIds}
            onSelect={addProduct}
            onRemove={removeProduct}
            disabled={idx >= selectedIds.length}
          />
        ))}
      </div>

      {/* محصولات انتخاب شده */}
      {selectedProducts.length > 0 && (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          {/* هدر جدول */}
          <div className={`grid gap-4 p-4 border-b bg-muted/30`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Scale className="h-4 w-4" /> ویژگی
            </div>
            {selectedProducts.map((p: any) => (
              <div key={p._id} className="text-center relative">
                <button onClick={() => removeProduct(p._id)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 z-10 hover:bg-destructive/80 transition-colors">
                  <X className="h-3 w-3" />
                </button>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted overflow-hidden mb-2 border">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/40" /></div>
                  )}
                </div>
                <p className="text-xs font-semibold line-clamp-2">{p.name}</p>
              </div>
            ))}
          </div>

          {/* ردیف‌های مقایسه */}
          <div className="divide-y">
            {/* نام */}
            <div className={`grid gap-4 p-3 text-sm`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
              <span className="text-muted-foreground font-medium">نام محصول</span>
              {selectedProducts.map((p: any) => <span key={p._id} className="text-center font-semibold">{p.name}</span>)}
            </div>

            {/* قیمت */}
            <div className={`grid gap-4 p-3 text-sm`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
              <span className="text-muted-foreground font-medium">قیمت</span>
              {selectedProducts.map((p: any) => (
                <div key={p._id} className="text-center">
                  {p.salePrice ? (
                    <div>
                      <span className="text-destructive font-bold">{p.salePrice.toLocaleString("fa-IR")} تومان</span>
                      <span className="text-xs text-muted-foreground line-through mr-1">{p.price.toLocaleString("fa-IR")}</span>
                    </div>
                  ) : <span className="font-bold">{p.price.toLocaleString("fa-IR")} تومان</span>}
                </div>
              ))}
            </div>

            {/* موجودی */}
            <div className={`grid gap-4 p-3 text-sm`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
              <span className="text-muted-foreground font-medium">موجودی</span>
              {selectedProducts.map((p: any) => (
                <span key={p._id} className={`text-center ${p.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                  {p.stock > 0 ? `${p.stock} عدد` : "ناموجود"}
                </span>
              ))}
            </div>

            {/* امتیاز */}
            <div className={`grid gap-4 p-3 text-sm`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
              <span className="text-muted-foreground font-medium">امتیاز</span>
              {selectedProducts.map((p: any) => (
                <span key={p._id} className="text-center flex items-center justify-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> {p.rating?.toFixed(1) || "—"}/۵
                </span>
              ))}
            </div>

            {/* برند */}
            <div className={`grid gap-4 p-3 text-sm`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
              <span className="text-muted-foreground font-medium">برند</span>
              {selectedProducts.map((p: any) => (
                <span key={p._id} className="text-center text-xs">{p.brand || "—"}</span>
              ))}
            </div>

            {/* توضیحات کوتاه */}
            <div className={`grid gap-4 p-3 text-sm`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
              <span className="text-muted-foreground font-medium">توضیحات</span>
              {selectedProducts.map((p: any) => (
                <span key={p._id} className="text-center text-xs text-muted-foreground line-clamp-3">{p.shortDescription || "—"}</span>
              ))}
            </div>

            {/* ویژگی‌های داینامیک */}
            {Array.from(allFeatureKeys.entries()).map(([key, label]) => (
              <div key={key} className={`grid gap-4 p-3 text-sm`} style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
                <span className="text-muted-foreground font-medium">{label}</span>
                {selectedProducts.map((p: any) => (
                  <span key={p._id} className="text-center text-xs">{(p.features as any)?.[key] || "—"}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* حالت خالی */}
      {selectedProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
            <Scale className="h-10 w-10 text-primary/50" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">از بالا ۳ محصول را برای مقایسه انتخاب کنید</p>
          <p className="text-xs text-muted-foreground/60 mt-1">حداکثر ۳ محصول قابل مقایسه است</p>
        </div>
      )}
    </div>
  );
}

/**
 * کامپوننت دراپ‌داون جستجویی محصول
 */
function CompareDropdown({
  index, products, selectedIds, onSelect, onRemove, disabled,
}: {
  index: number;
  products: any[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedId = selectedIds[index];
  const selected = selectedId ? products.find((p: any) => p._id === selectedId) : null;

  const filtered = useMemo(() => {
    const used = new Set(selectedIds);
    let list = products.filter((p: any) => !used.has(p._id));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q));
    }
    return list.slice(0, 30);
  }, [products, selectedIds, search]);

  // بستن با کلیک بیرون
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const placeholderTexts = ["محصول اول", "محصول دوم", "محصول سوم"];

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">انتخاب {placeholderTexts[index]}</label>

      {selected ? (
        <div className="flex items-center gap-2 p-2 rounded-xl border bg-card shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
            {selected.images?.[0] ? (
              <img src={selected.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{selected.name}</p>
            <p className="text-[10px] text-muted-foreground">{selected.price?.toLocaleString("fa-IR")} تومان</p>
          </div>
          <button
            onClick={() => { onRemove(selected._id); setSearch(""); }}
            className="p-1 rounded-lg hover:bg-destructive/10 text-destructive transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={`جستجوی ${placeholderTexts[index]}...`}
            className="w-full pl-8 pr-9 py-2.5 text-xs rounded-xl border bg-card outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      )}

      {/* لیست نتایج */}
      <AnimatePresence>
        {open && !selected && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-xl shadow-xl max-h-64 overflow-y-auto z-50"
          >
            {!search && (
              <button onClick={() => setOpen(false)} className="w-full px-3 py-2 text-[10px] text-muted-foreground hover:bg-muted text-right">
                بستن
              </button>
            )}
            {filtered.map((p: any) => (
              <button
                key={p._id}
                onClick={() => { onSelect(p._id); setSearch(""); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-right transition-colors border-b border-border/30 last:border-0"
              >
                <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden shrink-0">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="h-3 w-3 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.price?.toLocaleString("fa-IR")} تومان</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
