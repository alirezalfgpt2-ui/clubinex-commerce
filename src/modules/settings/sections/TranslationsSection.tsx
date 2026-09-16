/**
 * بخش ویرایشگر جدولی ترجمه‌ها
 * کلید با دراپ‌داون جستجو + پیشنهاد خودکار از دیتابیس
 */
import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Search, Languages, ChevronDown, X, Key } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { SectionHeader } from "../components/SettingsUI";

const CATEGORIES = [
  { id: "app", label: "برنامه" },
  { id: "nav", label: "ناوبری" },
  { id: "topbar", label: "تاپ‌بار" },
  { id: "toolbar", label: "تول‌بار" },
  { id: "sidebar", label: "سایدبار" },
  { id: "product", label: "محصولات" },
  { id: "cart", label: "سبد خرید" },
  { id: "order", label: "سفارشات" },
  { id: "payment", label: "پرداخت" },
  { id: "settings", label: "تنظیمات" },
  { id: "auth", label: "احراز هویت" },
  { id: "common", label: "مشترک" },
];

/** کلیدهای پیشنهادی بر اساس دسته */
const SUGGESTED_KEYS: Record<string, string[]> = {
  nav: ["nav.home", "nav.products", "nav.cart", "nav.orders", "nav.profile", "nav.settings", "nav.blog", "nav.about", "nav.contact", "nav.faq"],
  product: ["product.name", "product.price", "product.description", "product.category", "product.brand", "product.stock", "product.discount", "product.rating", "product.reviews", "product.addToCart"],
  cart: ["cart.title", "cart.empty", "cart.total", "cart.checkout", "cart.remove", "cart.quantity", "cart.subtotal", "cart.shipping", "cart.tax", "cart.discount"],
  order: ["order.title", "order.status", "order.pending", "order.shipped", "order.delivered", "order.cancelled", "order.tracking", "order.history", "order.detail", "order.invoice"],
  payment: ["payment.title", "payment.success", "payment.failed", "payment.pending", "payment.method", "payment.receipt", "payment.refund", "payment.installment", "payment.gateway", "payment.verify"],
  settings: ["settings.title", "settings.general", "settings.seo", "settings.appearance", "settings.email", "settings.sms", "settings.payment", "settings.shipping", "settings.tax", "settings.backup"],
  auth: ["auth.login", "auth.register", "auth.logout", "auth.forgotPassword", "auth.resetPassword", "auth.verify", "auth.welcome", "auth.email", "auth.password", "auth.confirm"],
  common: ["common.save", "common.cancel", "common.delete", "common.edit", "common.add", "common.search", "common.filter", "common.export", "common.import", "common.loading"],
  topbar: ["topbar.search", "topbar.notifications", "topbar.profile", "topbar.settings", "topbar.darkMode", "topbar.lightMode", "topbar.cart", "topbar.wishlist", "topbar.messages", "topbar.language"],
  toolbar: ["toolbar.home", "toolbar.products", "toolbar.orders", "toolbar.users", "toolbar.settings", "toolbar.reports", "toolbar.chat", "toolbar.blog", "toolbar.brands", "toolbar.categories"],
  sidebar: ["sidebar.dashboard", "sidebar.products", "sidebar.categories", "sidebar.orders", "sidebar.customers", "sidebar.discounts", "sidebar.reports", "sidebar.settings", "sidebar.blog", "sidebar.chat"],
  app: ["app.name", "app.description", "app.footer", "app.copyright", "app.version", "app.support", "app.contact", "app.about", "app.terms", "app.privacy"],
};

export default function TranslationsSection() {
  const translations = useQuery(api.contentPages.listTranslations);
  const upsertTranslation = useMutation(api.contentPages.upsertTranslation);
  const deleteTranslation = useMutation(api.contentPages.deleteTranslation);

  const confirmDialog = useConfirm();
  const [category, setCategory] = useState("app");
  const [searchQuery, setSearchQuery] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newFa, setNewFa] = useState("");
  const [newEn, setNewEn] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // state برای دراپ‌داون کلید
  const [keyDropdownOpen, setKeyDropdownOpen] = useState(false);
  const [keySearch, setKeySearch] = useState("");
  const keyRef = useRef<HTMLDivElement>(null);

  // کلیدهای موجود در دیتابیس
  const existingKeys = useMemo(() => {
    return [...new Set((translations || []).map((t: any) => t.key))].sort();
  }, [translations]);

  // کلیدهای پیشنهادی (ترکیب از دیتابیس + پیشنهادها)
  const suggestedKeys = useMemo(() => {
    const fromDB = existingKeys.filter((k) => !keySearch || k.toLowerCase().includes(keySearch.toLowerCase()));
    const fromSuggestions = (SUGGESTED_KEYS[category] || []).filter((k) =>
      !existingKeys.includes(k) && (!keySearch || k.toLowerCase().includes(keySearch.toLowerCase()))
    );
    return [...fromDB, ...fromSuggestions].slice(0, 20);
  }, [existingKeys, category, keySearch]);

  // بستن دراپ‌داون با کلیک بیرون
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (keyRef.current && !keyRef.current.contains(e.target as Node)) setKeyDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // فیلتر ترجمه‌ها
  const filtered = (translations || []).filter((t: any) => {
    const matchCategory = !category || t.category === category;
    const matchSearch = !searchQuery || t.key.toLowerCase().includes(searchQuery.toLowerCase()) || t.fa.includes(searchQuery) || t.en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAdd = async () => {
    if (!newKey.trim() || !newFa.trim()) return toast.error("کلید و متن فارسی الزامی است.");
    setIsSaving(true);
    try {
      await upsertTranslation({ key: newKey.trim(), fa: newFa.trim(), en: newEn.trim() || newFa.trim(), category });
      toast.success("ترجمه ذخیره شد.");
      setNewKey(""); setNewFa(""); setNewEn("");
    } catch (e: any) { toast.error(e.message || "خطا"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف ترجمه", message: "آیا از حذف این ترجمه اطمینان دارید?", variant: "danger" })) return;
    try { await deleteTranslation({ id: id as any }); toast.success("حذف شد."); }
    catch { toast.error("خطا در حذف."); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="ترجمه‌ها (چندزبانه)"
        description="مدیریت کلمات متقابل فارسی و انگلیسی. کلید را از لیست انتخاب کنید یا جستجو کنید."
        gradient="from-blue-50 to-indigo-50 border-blue-200/50"
      />

      {/* فیلتر دسته */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">دسته:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border bg-card px-2.5 py-1.5 text-xs outline-none border-border">
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      {/* فرم افزودن */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" /> افزودن ترجمه جدید</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* کلید — دراپ‌داون جستجو */}
          <div ref={keyRef} className="relative">
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">کلید</label>
            <div className="relative">
              <Key className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={keyDropdownOpen ? keySearch : newKey}
                onChange={(e) => { setNewKey(e.target.value); setKeySearch(e.target.value); }}
                onFocus={() => { setKeyDropdownOpen(true); setKeySearch(newKey); }}
                placeholder="nav.home"
                className="w-full rounded-lg border bg-background pr-8 pl-8 py-2 text-[12px] outline-none border-border font-mono focus:border-primary/40"
              />
              <button type="button" onClick={() => setKeyDropdownOpen(!keyDropdownOpen)} className="absolute left-2 top-1/2 -translate-y-1/2">
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${keyDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* دراپ‌داون پیشنهادات */}
            {keyDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-[99999] max-h-[200px] overflow-y-auto">
                {/* جستجو در دراپ‌داون */}
                <div className="sticky top-0 bg-card border-b border-border/50 p-2">
                  <div className="relative">
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <input
                      type="text"
                      value={keySearch}
                      onChange={(e) => setKeySearch(e.target.value)}
                      placeholder="جستجوی کلید..."
                      className="w-full rounded-lg bg-muted/50 pr-7 pl-2 py-1.5 text-[11px] outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                {/* لیست پیشنهادات */}
                {suggestedKeys.length > 0 ? (
                  suggestedKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setNewKey(key); setKeySearch(""); setKeyDropdownOpen(false); }}
                      className={`w-full text-right px-3 py-2 text-[11px] font-mono hover:bg-primary/5 transition-colors flex items-center justify-between ${
                        newKey === key ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      <span>{key}</span>
                      {existingKeys.includes(key) && <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">موجود</span>}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-[11px] text-muted-foreground">کلیدی یافت نشد</div>
                )}
                {/* دکمه کلید جدید */}
                {keySearch && !suggestedKeys.includes(keySearch) && (
                  <button
                    type="button"
                    onClick={() => { setNewKey(keySearch); setKeyDropdownOpen(false); }}
                    className="w-full text-right px-3 py-2 text-[11px] font-mono text-primary hover:bg-primary/5 border-t border-border/50 flex items-center gap-2"
                  >
                    <Plus className="h-3 w-3" /> استفاده از «{keySearch}»
                  </button>
                )}
              </div>
            )}
          </div>

          {/* فارسی */}
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">فارسی</label>
            <input
              type="text"
              value={newFa}
              onChange={(e) => {
                setNewFa(e.target.value);
                // پیشنهاد خودکار کلید بر اساس متن فارسی
                if (!newKey && e.target.value) {
                  const transliterate = (s: string) => s.replace(/[\u0600-\u06FF]/g, "").replace(/\s+/g, ".").toLowerCase().replace(/[^a-z0-9.]/g, "");
                  const autoKey = transliterate(e.target.value);
                  if (autoKey) setNewKey(`${category}.${autoKey}`);
                }
              }}
              placeholder="خانه"
              className="w-full rounded-lg border bg-background px-2.5 py-2 text-[12px] outline-none border-border"
            />
          </div>

          {/* English */}
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">English</label>
            <input
              type="text"
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              placeholder="Home"
              className="w-full rounded-lg border bg-background px-2.5 py-2 text-[12px] outline-none border-border"
            />
          </div>

          <div className="flex items-end">
            <button onClick={handleAdd} disabled={isSaving || !newKey.trim() || !newFa.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} افزودن
            </button>
          </div>
        </div>
      </div>

      {/* جدول ترجمه‌ها */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{filtered.length} ترجمه</p>
          <div className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">جدول ترجمه‌ها</span></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="p-2.5 text-right font-medium text-muted-foreground w-40">کلید</th>
                <th className="p-2.5 text-right font-medium text-muted-foreground">فارسی</th>
                <th className="p-2.5 text-right font-medium text-muted-foreground">English</th>
                <th className="p-2.5 text-right font-medium text-muted-foreground w-20">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">ترجمه‌ای یافت نشد.</td></tr>
              ) : filtered.map((t: any) => (
                <tr key={t._id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-2.5 font-mono text-primary text-[11px]">{t.key}</td>
                  <td className="p-2.5">{t.fa}</td>
                  <td className="p-2.5 text-muted-foreground">{t.en}</td>
                  <td className="p-2.5">
                    <button onClick={() => handleDelete(t._id)} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
