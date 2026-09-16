/**
 * بخش تنظیمات نوار ناوبری صفحه اصلی
 * — ویرایش ۳ ردیف: نوار ابزار بالا + لوگو/جستجو + منوی دسته‌بندی
 * — قابلیت کشیدن و مرتب کردن آیتم‌ها (Drag & Drop)
 * — تقسیم ردیف ۱ به راست / مرکز / چپ
 * — مخفی‌سازی خودکار ردیف خالی
 * — بازگشت به پیش‌فرض
 * — فعال/غیرفعال کردن دسته‌بندی‌ها
 */
import { useState, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff, ExternalLink, ChevronDown, ChevronUp, RotateCcw, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSettings } from "../hooks/use-settings";
import { SaveButton, SectionHeader, ColorPicker, Toggle } from "../components/SettingsUI";
import { DragDropList, DndProvider, type DragDropItem } from "@/components/ui/DragDropList";
import type { NavItem } from "@/hooks/use-landing-nav";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const CATEGORY = "landingNav";

/** آیکون‌های قابل انتخاب */
const AVAILABLE_ICONS = [
  { value: "", label: "بدون آیکون" },
  { value: "Phone", label: "📞 تلفن" },
  { value: "Mail", label: "📧 ایمیل" },
  { value: "Instagram", label: "📸 اینستاگرام" },
  { value: "MessageCircle", label: "💬 تلگرام" },
  { value: "Package", label: "📦 بسته" },
  { value: "Info", label: "ℹ️ اطلاعات" },
  { value: "Newspaper", label: "📰 خبر" },
  { value: "ShoppingBag", label: "🛍️ فروشگاه" },
  { value: "MapPin", label: "📍 موقعیت" },
  { value: "Clock", label: "🕐 ساعت" },
  { value: "Star", label: "⭐ ستاره" },
  { value: "Heart", label: "❤️ علاقه" },
  { value: "Shield", label: "🛡️ امنیت" },
  { value: "Award", label: "🏆 جایزه" },
  { value: "Truck", label: "🚚 ارسال" },
  { value: "Headphones", label: "🎧 پشتیبانی" },
  { value: "Globe", label: "🌐 جهانی" },
  { value: "CreditCard", label: "💳 پرداخت" },
  { value: "Tag", label: "🏷️ برچسب" },
];

/** ایجاد آیتم خالی جدید */
const newItem = (): NavItem => ({
  id: Math.random().toString(36).slice(2, 10),
  label: "",
  url: "#",
  icon: "",
  visible: true,
});

/** ویرایشگر یک آیتم نوار با Drag Handle */
function NavItemEditor({
  item,
  onChange,
  onRemove,
  showIcon = true,
  dragHandle,
}: {
  item: NavItem;
  onChange: (item: NavItem) => void;
  onRemove: () => void;
  showIcon?: boolean;
  dragHandle?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/20 border border-border/40 group hover:border-primary/20 hover:bg-muted/40 transition-all">
      {/* Drag Handle */}
      <div className="mt-1.5 shrink-0">{dragHandle || <GripVertical className="h-4 w-4 text-muted-foreground/30" />}</div>

      <div className="flex-1 space-y-2">
        {/* ردیف اول: عنوان + لینک */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-muted-foreground mb-0.5">عنوان</label>
            <input
              value={item.label}
              onChange={(e) => onChange({ ...item, label: e.target.value })}
              placeholder="عنوان آیتم"
              className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-0.5">آدرس لینک</label>
            <input
              value={item.url}
              onChange={(e) => onChange({ ...item, url: e.target.value })}
              placeholder="https://... یا /page"
              dir="ltr"
              className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* ردیف دوم: آیکون + سوئیچ‌ها */}
        <div className="flex items-center gap-2 flex-wrap">
          {showIcon && (
            <select
              value={item.icon || ""}
              onChange={(e) => onChange({ ...item, icon: e.target.value })}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs outline-none focus:border-primary/40 shrink-0"
            >
              {AVAILABLE_ICONS.map((ic) => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
          )}

          {/* نمایش/مخفی */}
          <button
            onClick={() => onChange({ ...item, visible: !item.visible })}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
              item.visible
                ? "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                : "text-muted-foreground bg-muted border-border hover:bg-muted/80"
            }`}
            title={item.visible ? "نمایش در سایت" : "مخفی از سایت"}
          >
            {item.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {item.visible ? "نمایش" : "مخفی"}
          </button>

          {/* باز شدن در تب جدید */}
          <button
            onClick={() => onChange({ ...item, openInNewTab: !item.openInNewTab })}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
              item.openInNewTab
                ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
                : "text-muted-foreground bg-muted border-border hover:bg-muted/80"
            }`}
            title={item.openInNewTab ? "لینک در تب جدید مرورگر باز شود" : "لینک در همین صفحه باز شود"}
          >
            <ExternalLink className="h-3 w-3" />
            {item.openInNewTab ? "تب جدید" : "همین تب"}
          </button>

          {/* حذف */}
          <button onClick={onRemove} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-auto" title="حذف آیتم">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** لیست آیتم‌ها با قابلیت Drag & Drop بین بخش‌ها */
function NavItemsList({
  listId,
  items,
  onChange,
  showIcons = true,
  allListIds,
  onMoveItem,
}: {
  listId: string;
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  showIcons?: boolean;
  allListIds: string[];
  onMoveItem: (item: NavItem, fromListId: string, toListId: string, index: number) => void;
}) {
  return (
    <DragDropList<NavItem & DragDropItem>
      listId={listId}
      items={items as (NavItem & DragDropItem)[]}
      onReorder={(reordered) => onChange(reordered)}
      onDropFromOther={(item, index) => onMoveItem(item, "", listId, index)}
      targetListIds={allListIds}
      renderItem={(item, _index, handle) => (
        <NavItemEditor
          item={item}
          onChange={(updated) => {
            const next = items.map((it) => (it.id === item.id ? updated : it));
            onChange(next);
          }}
          onRemove={() => onChange(items.filter((it) => it.id !== item.id))}
          showIcon={showIcons}
          dragHandle={handle}
        />
      )}
    />
  );
}

/** کارت بخش قابل جمع شدن */
function CollapsibleCard({ number, title, subtitle, color, isOpen, onToggle, children }: {
  number: string; title: string; subtitle: string; color: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: color }}>{number}</div>
          <div className="text-right">
            <h4 className="text-sm font-semibold">{title}</h4>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {isOpen && <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">{children}</div>}
    </div>
  );
}

/** پیش‌فرض ردیف ۱ */
const DEFAULT_ROW1: { bgColor: string; textColor: string; rightItems: NavItem[]; centerItems: NavItem[]; leftItems: NavItem[] } = {
  bgColor: "#111827", textColor: "#d1d5db",
  rightItems: [
    { id: "phone", label: "۰۲۱-۱۲۳۴۵۶۷۸", url: "tel:02112345678", icon: "Phone", visible: true },
    { id: "email", label: "support@clubinex.com", url: "mailto:support@clubinex.com", icon: "Mail", visible: true },
  ],
  centerItems: [
    { id: "track-order", label: "پیگیری سفارش", url: "/track-order", icon: "Package", visible: true },
  ],
  leftItems: [
    { id: "instagram", label: "اینستاگرام", url: "https://instagram.com/clubinex", icon: "Instagram", visible: true },
    { id: "telegram", label: "تلگرام", url: "https://t.me/clubinex", icon: "MessageCircle", visible: true },
  ],
};

const DEFAULT_ROW2 = {
  bgColor: "#ffffff", borderColor: "#f3f4f6",
  showSearch: true, searchPlaceholder: "چی میخوای پیدا کنی؟",
  showWishlist: true, showCart: true, showAuth: true,
  authLabel: "ورود / ثبت‌نام", logoLabel: "فروشگاه آنلاین", logoSubLabel: "",
};

const DEFAULT_ROW3: { bgColor: string; textColor: string; activeColor: string; leftItems: NavItem[]; centerLabel: string; centerUrl: string; rightItems: NavItem[]; hiddenCategoryIds: string[] } = {
  bgColor: "#ffffff", textColor: "#4b5563", activeColor: "#6366f1",
  leftItems: [
    { id: "about", label: "درباره ما", url: "/about", icon: "Info", visible: true },
    { id: "contact", label: "تماس با ما", url: "/contact", icon: "Phone", visible: true },
    { id: "blog", label: "بلاگ", url: "/blog", icon: "Newspaper", visible: true },
  ],
  centerLabel: "فروشگاه", centerUrl: "/products",
  rightItems: [],
  hiddenCategoryIds: [],
};

/** بخش اصلی تنظیمات نوار ناوبری */
export default function LandingNavSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings(CATEGORY);
  const confirmDialog = useConfirm();
  const [openRow, setOpenRow] = useState<number | null>(1);
  const categories = useQuery(api.categories.list);

  const parseJSON = <T,>(key: string, fallback: T): T => {
    try { return JSON.parse(getVal(key) || "null") ?? fallback; } catch { return fallback; }
  };

  // ── ردیف ۱ ──
  const [row1, setRow1] = useState(() => parseJSON("navRow1", DEFAULT_ROW1));
  // ── ردیف ۲ ──
  const [row2, setRow2] = useState(() => parseJSON("navRow2", DEFAULT_ROW2));
  // ── ردیف ۳ ──
  const [row3, setRow3] = useState(() => parseJSON("navRow3", DEFAULT_ROW3));

  const countVisible = (items: NavItem[]) => items.filter((i) => i.visible).length;
  const hasRow1Content = countVisible(row1.rightItems) + countVisible(row1.centerItems) + countVisible(row1.leftItems) > 0;

  /** ذخیره همه */
  const handleSave = async () => {
    setVal("navRow1", JSON.stringify(row1));
    setVal("navRow2", JSON.stringify(row2));
    setVal("navRow3", JSON.stringify(row3));
    await handleSaveAll();
  };

  /** بازگشت به پیش‌فرض */
  const handleReset = async () => {
    if (!await confirmDialog({ title: "بازگشت به پیش‌فرض", message: "تنظیمات نوار ناوبری به حالت اولیه بازمی‌گردد.", variant: "warning" })) return;
    setRow1(DEFAULT_ROW1);
    setRow2(DEFAULT_ROW2);
    setRow3(DEFAULT_ROW3);
    toast.success("تنظیمات به پیش‌فرض بازگشت.");
  };

  /** جابجایی آیتم بین بخش‌های مختلف ردیف ۱ */
  const handleRow1MoveItem = (
    item: NavItem, fromListId: string, toListId: string, toIndex: number,
  ) => {
    setRow1((prev) => {
      const lists: Record<string, NavItem[]> = {
        right: [...prev.rightItems],
        center: [...prev.centerItems],
        left: [...prev.leftItems],
      };
      // حذف از مبدا
      if (fromListId && lists[fromListId]) {
        lists[fromListId] = lists[fromListId].filter((i) => i.id !== item.id);
      }
      // اضافه به مقصد
      if (lists[toListId]) {
        lists[toListId].splice(toIndex, 0, item);
      }
      return { ...prev, rightItems: lists.right, centerItems: lists.center, leftItems: lists.left };
    });
  };

  /** جابجایی آیتم بین بخش‌های مختلف ردیف ۳ */
  const handleRow3MoveItem = (
    item: NavItem, fromListId: string, toListId: string, toIndex: number,
  ) => {
    setRow3((prev) => {
      const lists: Record<string, NavItem[]> = {
        right: [...prev.rightItems],
        left: [...prev.leftItems],
      };
      if (fromListId && lists[fromListId]) {
        lists[fromListId] = lists[fromListId].filter((i) => i.id !== item.id);
      }
      if (lists[toListId]) {
        lists[toListId].splice(toIndex, 0, item);
      }
      return { ...prev, rightItems: lists.right, leftItems: lists.left };
    });
  };

  const row1ListIds = ["right", "center", "left"];
  const row3ListIds = ["right", "left"];

  return (
    <DndProvider>
    <div className="space-y-6">
      <SectionHeader
        title="ناوبری صفحه اصلی"
        description="سفارشی‌سازی ۳ ردیف نوار ناوبری: رنگ‌ها، آیتم‌ها، لینک‌ها و مرتب‌سازی با کشیدن."
        gradient="from-blue-50 to-indigo-50 border-blue-200/50"
      />

      {/* ══════ ردیف ۱: نوار ابزار بالا ══════ */}
      <CollapsibleCard
        number="۱" title="ردیف ۱ — نوار ابزار بالا" subtitle="سمت راست، مرکز و سمت چپ — آیکون، عنوان، لینک"
        color="#111827" isOpen={openRow === 1} onToggle={() => setOpenRow(openRow === 1 ? null : 1)}
      >
        {/* رنگ‌ها */}
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker label="رنگ پس‌زمینه" value={row1.bgColor} onChange={(v) => setRow1((p) => ({ ...p, bgColor: v }))} />
          <ColorPicker label="رنگ متن" value={row1.textColor} onChange={(v) => setRow1((p) => ({ ...p, textColor: v }))} />
        </div>

        {/* سمت راست */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-600 text-[10px] flex items-center justify-center font-bold">→</span>
              سمت راست
            </h5>
            <button onClick={() => setRow1((p) => ({ ...p, rightItems: [...p.rightItems, newItem()] }))} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="h-3 w-3" /> افزودن
            </button>
          </div>
          <NavItemsList listId="right" items={row1.rightItems} onChange={(items) => setRow1((p) => ({ ...p, rightItems: items }))} allListIds={row1ListIds} onMoveItem={handleRow1MoveItem} />
        </div>

        {/* مرکز */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center font-bold">●</span>
              مرکز
            </h5>
            <button onClick={() => setRow1((p) => ({ ...p, centerItems: [...p.centerItems, newItem()] }))} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="h-3 w-3" /> افزودن
            </button>
          </div>
          <NavItemsList listId="center" items={row1.centerItems} onChange={(items) => setRow1((p) => ({ ...p, centerItems: items }))} allListIds={row1ListIds} onMoveItem={handleRow1MoveItem} />
          </div>

        {/* سمت چپ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-purple-100 text-purple-600 text-[10px] flex items-center justify-center font-bold">←</span>
              سمت چپ
            </h5>
            <button onClick={() => setRow1((p) => ({ ...p, leftItems: [...p.leftItems, newItem()] }))} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="h-3 w-3" /> افزودن
            </button>
          </div>
          <NavItemsList listId="left" items={row1.leftItems} onChange={(items) => setRow1((p) => ({ ...p, leftItems: items }))} allListIds={row1ListIds} onMoveItem={handleRow1MoveItem} />
          </div>

        {!hasRow1Content && (
          <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ تمام آیتم‌ها مخفی هستند — ردیف بالا در سایت نمایش داده نخواهد شد.
          </p>
        )}

        {/* پیش‌نمایش */}
        <div className="rounded-xl overflow-hidden border border-border/50">
          <div className="p-2 flex items-center justify-between text-[10px] px-4" style={{ backgroundColor: row1.bgColor, color: row1.textColor }}>
            <div className="flex items-center gap-3">
              {row1.rightItems.filter((i) => i.visible).map((item) => (
                <span key={item.id} className="hover:text-white transition-colors cursor-pointer">{item.label}</span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {row1.centerItems.filter((i) => i.visible).map((item) => (
                <span key={item.id} className="hover:text-white transition-colors cursor-pointer font-semibold">{item.label}</span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {row1.leftItems.filter((i) => i.visible).map((item) => (
                <span key={item.id} className="hover:text-white transition-colors cursor-pointer">{item.label}</span>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* ══════ ردیف ۲: لوگو + جستجو + دکمه‌ها ══════ */}
      <CollapsibleCard
        number="۲" title="ردیف ۲ — لوگو، جستجو و دکمه‌ها" subtitle="لوگو، نوار جستجو، سبد خرید، علاقه‌مندی، دکمه ورود"
        color="#6366f1" isOpen={openRow === 2} onToggle={() => setOpenRow(openRow === 2 ? null : 2)}
      >
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker label="رنگ پس‌زمینه" value={row2.bgColor} onChange={(v) => setRow2((p) => ({ ...p, bgColor: v }))} />
          <ColorPicker label="رنگ حاشیه" value={row2.borderColor} onChange={(v) => setRow2((p) => ({ ...p, borderColor: v }))} />
        </div>

        {/* لوگو */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground">تنظیمات لوگو</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">زیرنویس لوگو</label>
              <input value={row2.logoLabel} onChange={(e) => setRow2((p) => ({ ...p, logoLabel: e.target.value }))} placeholder="فروشگاه آنلاین" className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">توضیح فرعی (اختیاری)</label>
              <input value={row2.logoSubLabel} onChange={(e) => setRow2((p) => ({ ...p, logoSubLabel: e.target.value }))} placeholder="بهترین کیفیت" className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40" />
            </div>
          </div>
        </div>

        {/* نوار جستجو */}
        <Toggle checked={row2.showSearch} onChange={() => setRow2((p) => ({ ...p, showSearch: !p.showSearch }))} label="نمایش نوار جستجو" description="نوار جستجوی محصولات در وسط ردیف" />
        {row2.showSearch && (
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">متن جایگزین</label>
            <input value={row2.searchPlaceholder} onChange={(e) => setRow2((p) => ({ ...p, searchPlaceholder: e.target.value }))} placeholder="چی میخوای پیدا کنی؟" className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40" />
          </div>
        )}

        {/* دکمه‌ها */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground">نمایش آیتم‌ها</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Toggle checked={row2.showWishlist} onChange={() => setRow2((p) => ({ ...p, showWishlist: !p.showWishlist }))} label="علاقه‌مندی‌ها" />
            <Toggle checked={row2.showCart} onChange={() => setRow2((p) => ({ ...p, showCart: !p.showCart }))} label="سبد خرید" />
            <Toggle checked={row2.showAuth} onChange={() => setRow2((p) => ({ ...p, showAuth: !p.showAuth }))} label="دکمه ورود" />
          </div>
          {row2.showAuth && (
            <div>
              <label className="block text-[10px] text-muted-foreground mb-1">متن دکمه ورود</label>
              <input value={row2.authLabel} onChange={(e) => setRow2((p) => ({ ...p, authLabel: e.target.value }))} placeholder="ورود / ثبت‌نام" className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40" />
            </div>
          )}
        </div>

        {/* پیش‌نمایش */}
        <div className="rounded-xl overflow-hidden border border-border/50">
          <div className="p-3 flex items-center gap-3" style={{ backgroundColor: row2.bgColor, borderBottom: `1px solid ${row2.borderColor}` }}>
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">C</div>
            <span className="text-xs font-bold text-gray-900 shrink-0">{row2.logoLabel}</span>
            {row2.showSearch && <div className="flex-1 h-7 rounded-xl bg-gray-50 border border-gray-200 flex items-center px-3"><span className="text-[10px] text-gray-400">{row2.searchPlaceholder}</span></div>}
            <div className="flex items-center gap-1 shrink-0">
              {row2.showWishlist && <span className="text-gray-400 text-xs">♡</span>}
              {row2.showCart && <span className="text-gray-400 text-xs">🛒</span>}
              {row2.showAuth && <span className="text-[10px] px-2 py-1 rounded-xl bg-primary text-white font-bold">{row2.authLabel}</span>}
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* ══════ ردیف ۳: منوی دسته‌بندی ══════ */}
      <CollapsibleCard
        number="۳" title="ردیف ۳ — منوی دسته‌بندی و لینک‌ها" subtitle="آیتم‌های سمت راست، مرکز، چپ + مدیریت دسته‌بندی‌ها"
        color="#10b981" isOpen={openRow === 3} onToggle={() => setOpenRow(openRow === 3 ? null : 3)}
      >
        <div className="grid grid-cols-3 gap-3">
          <ColorPicker label="رنگ پس‌زمینه" value={row3.bgColor} onChange={(v) => setRow3((p) => ({ ...p, bgColor: v }))} />
          <ColorPicker label="رنگ متن" value={row3.textColor} onChange={(v) => setRow3((p) => ({ ...p, textColor: v }))} />
          <ColorPicker label="رنگ آیتم فعال" value={row3.activeColor} onChange={(v) => setRow3((p) => ({ ...p, activeColor: v }))} />
        </div>

        {/* آیتم مرکز */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground">آیتم مرکز</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">عنوان</label>
              <input value={row3.centerLabel} onChange={(e) => setRow3((p) => ({ ...p, centerLabel: e.target.value }))} placeholder="فروشگاه" className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground mb-0.5">لینک</label>
              <input value={row3.centerUrl} onChange={(e) => setRow3((p) => ({ ...p, centerUrl: e.target.value }))} placeholder="/products" dir="ltr" className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none focus:border-primary/40" />
            </div>
          </div>
        </div>

        {/* آیتم‌های سمت راست */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-600 text-[10px] flex items-center justify-center font-bold">→</span>
              سمت راست
            </h5>
            <button onClick={() => setRow3((p) => ({ ...p, rightItems: [...p.rightItems, newItem()] }))} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="h-3 w-3" /> افزودن
            </button>
          </div>
          <NavItemsList listId="right" items={row3.rightItems} onChange={(items) => setRow3((p) => ({ ...p, rightItems: items }))} allListIds={row3ListIds} onMoveItem={handleRow3MoveItem} />
        </div>

        {/* آیتم‌های سمت چپ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-purple-100 text-purple-600 text-[10px] flex items-center justify-center font-bold">←</span>
              سمت چپ
            </h5>
            <button onClick={() => setRow3((p) => ({ ...p, leftItems: [...p.leftItems, newItem()] }))} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="h-3 w-3" /> افزودن
            </button>
          </div>
          <NavItemsList listId="left" items={row3.leftItems} onChange={(items) => setRow3((p) => ({ ...p, leftItems: items }))} allListIds={row3ListIds} onMoveItem={handleRow3MoveItem} />
        </div>

        {/* پیش‌نمایش */}
        <div className="rounded-xl overflow-hidden border border-border/50">
          <div className="p-2 flex items-center gap-1 px-4 flex-wrap" style={{ backgroundColor: row3.bgColor, color: row3.textColor }}>
            {row3.rightItems.filter((i) => i.visible).map((item) => (
              <span key={item.id} className="px-2 py-1 text-[10px] font-medium rounded-lg hover:bg-gray-100 cursor-pointer">{item.label}</span>
            ))}
            {row3.rightItems.filter((i) => i.visible).length > 0 && <span className="w-px h-3 bg-gray-200 mx-1" />}
            <span className="px-2 py-1 text-[10px] font-bold rounded-lg" style={{ color: row3.activeColor, backgroundColor: row3.activeColor + "15" }}>{row3.centerLabel}</span>
            <span className="w-px h-3 bg-gray-200 mx-1" />
            {row3.leftItems.filter((i) => i.visible).map((item) => (
              <span key={item.id} className="px-2 py-1 text-[10px] font-medium rounded-lg hover:bg-gray-100 cursor-pointer">{item.label}</span>
            ))}
          </div>
        </div>
      </CollapsibleCard>

      {/* ══════ مدیریت نمایش دسته‌بندی‌ها ══════ */}
      <CollapsibleCard
        number="☆" title="نمایش/مخفی‌سازی دسته‌بندی‌ها" subtitle="هر دسته‌بندی که غیرفعال شود از منوی صفحه اصلی حذف می‌شود"
        color="#f59e0b" isOpen={openRow === 99} onToggle={() => setOpenRow(openRow === 99 ? null : 99)}
      >
        <p className="text-[11px] text-muted-foreground mb-3">
          دسته‌بندی‌های غیرفعال در صفحه اصلی نمایش داده نمی‌شوند، اما در خود بخش مدیریت دسته‌بندی‌ها قابل مشاهده هستند.
        </p>
        <div className="space-y-1.5">
          {categories && categories.filter((c: any) => !c.parentId).map((cat: any) => {
            const isHidden = row3.hiddenCategoryIds.includes(cat._id);
            return (
              <div key={cat._id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs">
                    {cat.image ? <img src={cat.image} alt="" className="w-full h-full rounded-lg object-cover" /> : "📂"}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{cat.name}</span>
                    {cat.slug && <span className="text-[10px] text-muted-foreground mr-2" dir="ltr">/{cat.slug}</span>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newHidden = isHidden
                      ? row3.hiddenCategoryIds.filter((id) => id !== cat._id)
                      : [...row3.hiddenCategoryIds, cat._id];
                    setRow3((p) => ({ ...p, hiddenCategoryIds: newHidden }));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                    isHidden
                      ? "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
                      : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {isHidden ? <><EyeOff className="h-3 w-3" /> مخفی</> : <><Eye className="h-3 w-3" /> نمایش</>}
                </button>
              </div>
            );
          })}
          {categories && categories.filter((c: any) => !c.parentId).length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-4">دسته‌بندی‌ای وجود ندارد.</p>
          )}
        </div>
      </CollapsibleCard>

      {/* ── دکمه‌ها ── */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <RotateCcw className="h-4 w-4" /> بازگشت به پیش‌فرض
        </button>
        <SaveButton onClick={handleSave} loading={isSaving} />
      </div>
    </div>
    </DndProvider>
  );
}
