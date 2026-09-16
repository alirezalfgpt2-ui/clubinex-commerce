/**
 * 📊 صفحه گزارش‌ها و تحلیل‌ها
 * — فیلتر تاریخ (از/تا) روی تمام تب‌ها با پیش‌فرض امروز
 * — جستجو و سورت روی تمام جداول
 * — صفحه‌بندی حرفه‌ای
 */
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart3, TrendingUp, Package, Users, ShoppingCart, DollarSign, Download, FileText,
  Eye, Calendar, Zap, Search, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/config/constants";
import { formatJalaliDate, parseJalaliString } from "@/lib/jalali";
import { JalaliDatePicker } from "@/modules/shared/ui/JalaliDatePicker";
import { DynamicReportBuilder, TABLES } from "@/modules/reports/ui/DynamicReportBuilder";
import { MetricCard } from "@/modules/reports/ui/MetricCard";
import { Pagination } from "@/modules/reports/ui/Pagination";
import { InvoicePreview } from "@/modules/reports/ui/InvoicePreview";
import { exportToCSV, exportToExcel } from "@/modules/reports/utils/export";

const PAGE_SIZE = 15;

// ── Get today in Jalali format ──
function todayJalali(): string {
  return formatJalaliDate(new Date());
}

// ── Sortable column indicator ──
function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
  return asc ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />;
}

type ReportTab = "overview" | "orders" | "products" | "users" | "views" | "invoices" | "dynamic";

const TABS: { id: ReportTab; label: string; icon: any }[] = [
  { id: "overview", label: "نمای کلی", icon: BarChart3 },
  { id: "orders", label: "گزارش سفارشات", icon: ShoppingCart },
  { id: "products", label: "گزارش محصولات", icon: Package },
  { id: "users", label: "گزارش کاربران", icon: Users },
  { id: "views", label: "بازدید محصولات", icon: Eye },
  { id: "invoices", label: "فاکتورها", icon: FileText },
  { id: "dynamic", label: "گزارش پیشرفته", icon: Zap },
];

/** Date range filter bar — reusable for all tabs */
function DateRangeBar({
  dateFrom, dateTo, onChangeFrom, onChangeTo,
}: {
  dateFrom: string; dateTo: string;
  onChangeFrom: (v: string) => void; onChangeTo: (v: string) => void;
}) {
  return (
    <div className="clay-card p-3 flex items-center gap-3 flex-wrap">
      <Calendar className="h-4 w-4 text-primary" />
      <span className="text-xs font-medium">فیلتر تاریخ:</span>
      <div className="flex-1 min-w-[140px]"><JalaliDatePicker label="" value={dateFrom} onChange={onChangeFrom} /></div>
      <span className="text-xs text-muted-foreground">تا</span>
      <div className="flex-1 min-w-[140px]"><JalaliDatePicker label="" value={dateTo} onChange={onChangeTo} /></div>
      {(dateFrom || dateTo) && (
        <button onClick={() => { onChangeFrom(""); onChangeTo(""); }} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted">پاک کردن</button>
      )}
    </div>
  );
}

/** Search input for tables */
function TableSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "جستجو..."}
        className="clay-input w-full h-8 pl-8 pr-3 text-xs outline-none"
      />
    </div>
  );
}

export default function ReportsPage() {
  // ── Queries ──
  const productStats = useQuery(api.products.getStats);
  const orderStats = useQuery(api.orders.getStats);
  const userCount = useQuery(api.users.getUserCount);
  const products = useQuery(api.products.listActive);
  const orders = useQuery(api.orders.list);
  const users = useQuery(api.users.list);
  const discounts = useQuery(api.discounts.list);
  const brands = useQuery(api.brands.list);
  const shipping = useQuery(api.shipping.list);
  const tickets = useQuery(api.tickets.list);

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const [exportType, setExportType] = useState<"csv" | "excel">("excel");
  const [dynamicTable, setDynamicTable] = useState("products");

  // ── Date filters (default = today in Jalali) ──
  const [ordersDateFrom, setOrdersDateFrom] = useState(todayJalali);
  const [ordersDateTo, setOrdersDateTo] = useState(todayJalali);
  const [productsDateFrom, setProductsDateFrom] = useState(todayJalali);
  const [productsDateTo, setProductsDateTo] = useState(todayJalali);
  const [usersDateFrom, setUsersDateFrom] = useState(todayJalali);
  const [usersDateTo, setUsersDateTo] = useState(todayJalali);
  const [viewsDateFrom, setViewsDateFrom] = useState(todayJalali);
  const [viewsDateTo, setViewsDateTo] = useState(todayJalali);
  const [invoicesDateFrom, setInvoicesDateFrom] = useState(todayJalali);
  const [invoicesDateTo, setInvoicesDateTo] = useState(todayJalali);

  // ── Search state ──
  const [ordersSearch, setOrdersSearch] = useState("");
  const [productsSearch, setProductsSearch] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [viewsSearch, setViewsSearch] = useState("");

  // ── Sort state ──
  type SortDir = { key: string; asc: boolean };
  const [ordersSort, setOrdersSort] = useState<SortDir>({ key: "createdAt", asc: false });
  const [productsSort, setProductsSort] = useState<SortDir>({ key: "name", asc: true });
  const [usersSort, setUsersSort] = useState<SortDir>({ key: "name", asc: true });

  // ── Page state ──
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [viewsPage, setViewsPage] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);

  // ── Helpers ──
  const filterByDate = useCallback((list: any[], from: string, to: string) => {
    let result = list;
    if (from) {
      const d = parseJalaliString(from);
      if (d) result = result.filter((o) => o.createdAt >= d.getTime());
    }
    if (to) {
      const d = parseJalaliString(to);
      if (d) result = result.filter((o) => o.createdAt <= d.getTime() + 86400000);
    }
    return result;
  }, []);

  const sortByKey = useCallback((list: any[], key: string, asc: boolean) => {
    return [...list].sort((a, b) => {
      let cmp = 0;
      const av = a[key], bv = b[key];
      if (typeof av === "string") cmp = av.localeCompare(bv || "");
      else if (typeof av === "number") cmp = (av ?? 0) - (bv ?? 0);
      else cmp = 0;
      return asc ? cmp : -cmp;
    });
  }, []);

  const searchFilter = useCallback((list: any[], q: string, keys: string[]) => {
    if (!q) return list;
    const lq = q.toLowerCase();
    return list.filter((item) => keys.some((k) => String(item[k] ?? "").toLowerCase().includes(lq)));
  }, []);

  // ── Filtered data ──
  const filteredOrders = useMemo(() => {
    let r = filterByDate(orders ?? [], ordersDateFrom, ordersDateTo);
    r = searchFilter(r, ordersSearch, ["orderNumber", "address"]);
    r = sortByKey(r, ordersSort.key, ordersSort.asc);
    return r;
  }, [orders, ordersDateFrom, ordersDateTo, ordersSearch, ordersSort, filterByDate, searchFilter, sortByKey]);

  const filteredProducts = useMemo(() => {
    let r = filterByDate(products ?? [], productsDateFrom, productsDateTo);
    r = searchFilter(r, productsSearch, ["name", "brand", "tags"]);
    r = sortByKey(r, productsSort.key, productsSort.asc);
    return r;
  }, [products, productsDateFrom, productsDateTo, productsSearch, productsSort, filterByDate, searchFilter, sortByKey]);

  const filteredUsers = useMemo(() => {
    let r = filterByDate(users ?? [], usersDateFrom, usersDateTo);
    r = searchFilter(r, usersSearch, ["name", "email", "phone"]);
    r = sortByKey(r, usersSort.key, usersSort.asc);
    return r;
  }, [users, usersDateFrom, usersDateTo, usersSearch, usersSort, filterByDate, searchFilter, sortByKey]);

  const filteredViews = useMemo(() => {
    let r = filterByDate(products ?? [], viewsDateFrom, viewsDateTo);
    r = searchFilter(r, viewsSearch, ["name"]);
    return r;
  }, [products, viewsDateFrom, viewsDateTo, viewsSearch, filterByDate, searchFilter]);

  const filteredInvoices = useMemo(() => {
    return filterByDate(
      (orders ?? []).filter((o: any) => o.paymentStatus === "paid"),
      invoicesDateFrom, invoicesDateTo
    );
  }, [orders, invoicesDateFrom, invoicesDateTo, filterByDate]);

  // ── Paginated ──
  const paginate = (list: any[], page: number) => {
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  };

  const paginatedOrders = useMemo(() => paginate(filteredOrders, ordersPage), [filteredOrders, ordersPage]);
  const paginatedProducts = useMemo(() => paginate(filteredProducts, productsPage), [filteredProducts, productsPage]);
  const paginatedUsers = useMemo(() => paginate(filteredUsers, usersPage), [filteredUsers, usersPage]);
  const paginatedViews = useMemo(() => paginate(filteredViews, viewsPage), [filteredViews, viewsPage]);
  const paginatedInvoices = useMemo(() => paginate(filteredInvoices, invoicesPage), [filteredInvoices, invoicesPage]);

  const topProducts = useMemo(() => (products ?? []).sort((a: any, b: any) => b.views - a.views).slice(0, 5), [products]);

  // ── Sort toggle ──
  const toggleSort = (current: SortDir, key: string): SortDir =>
    current.key === key ? { key, asc: !current.asc } : { key, asc: true };

  // ── Export ──
  const handleExport = (tab: ReportTab) => {
    let data: Record<string, any>[] = [];
    let filename = "";
    switch (tab) {
      case "orders":
        data = filteredOrders.map((o: any) => ({
          "شماره سفارش": o.orderNumber, "تاریخ": formatJalaliDate(o.createdAt),
          "مبلغ کل": o.total, "وضعیت": ORDER_STATUSES.find((s) => s.value === o.status)?.label || o.status,
          "آدرس": o.address,
        }));
        filename = "گزارش-سفارشات"; break;
      case "products":
        data = filteredProducts.map((p: any) => ({
          "نام": p.name, "قیمت": p.price, "موجودی": p.stock, "بازدید": p.views,
          "وضعیت": p.isActive ? "فعال" : "غیرفعال",
        }));
        filename = "گزارش-محصولات"; break;
      case "users":
        data = filteredUsers.map((u: any) => ({
          "نام": u.name || "—", "ایمیل": u.email || "—", "تلفن": u.phone || "—",
          "نقش": u.role || "user", "تاریخ ثبت‌نام": u.createdAt ? formatJalaliDate(u.createdAt) : "—",
        }));
        filename = "گزارش-کاربران"; break;
      default: return;
    }
    if (exportType === "csv") exportToCSV(data, filename);
    else exportToExcel(data, filename);
  };

  // ── Dynamic data ──
  const dynamicData = useMemo(() => {
    switch (dynamicTable) {
      case "products": return (products ?? []).map((p: any) => ({
        _id: p._id, name: p.name, price: p.price, salePrice: p.salePrice, stock: p.stock,
        views: p.views, rating: p.rating ?? 0, brand: p.brand ?? "", isActive: p.isActive,
        isFeatured: p.isFeatured, createdAt: p.createdAt,
      }));
      case "orders": return (orders ?? []).map((o: any) => ({
        _id: o._id, orderNumber: o.orderNumber, total: o.total, status: o.status,
        paymentStatus: o.paymentStatus, paymentMethod: o.paymentMethod ?? "",
        shippingMethod: o.shippingMethod ?? "", address: o.address ?? "", createdAt: o.createdAt,
      }));
      case "users": return (users ?? []).map((u: any) => ({
        _id: u._id, name: u.name ?? "", email: u.email ?? "", phone: u.phone ?? "",
        role: u.role ?? "", isActive: u.isActive ?? true, createdAt: u.createdAt ?? 0,
      }));
      case "discounts": return (discounts ?? []).map((d: any) => ({
        _id: d._id, code: d.code, type: d.type, value: d.value,
        usedCount: d.usedCount ?? 0, isActive: d.isActive, startDate: d.startDate, endDate: d.endDate,
      }));
      case "brands": return (brands ?? []).map((b: any) => ({
        _id: b._id, name: b.name, slug: b.slug, isActive: b.isActive, createdAt: b.createdAt,
      }));
      case "shipping": return (shipping ?? []).map((s: any) => ({
        _id: s._id, name: s.name, nameFa: s.nameFa, type: s.type, cost: s.cost, isActive: s.isActive,
      }));
      case "tickets": return (tickets ?? []).map((t: any) => ({
        _id: t._id, subject: t.subject, category: t.category, priority: t.priority, status: t.status, createdAt: t.createdAt,
      }));
      default: return [];
    }
  }, [dynamicTable, products, orders, users, discounts, brands, shipping, tickets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">گزارش‌ها و تحلیل‌ها</h1>
        <p className="text-sm text-muted-foreground mt-0.5">آمار، تحلیل و گزارش‌گیری فروشگاه Clubinex</p>
      </div>

      {/* تب‌ها */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl flex-wrap">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── نمای کلی ── */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={Package} title="کل محصولات" value={productStats?.total ?? 0} color="bg-primary/10 text-primary" trend="↑ ۱۲٪ این ماه" />
            <MetricCard icon={ShoppingCart} title="کل سفارشات" value={orderStats?.totalOrders ?? 0} color="bg-amber-500/10 text-amber-600" trend="↑ ۸٪ این ماه" />
            <MetricCard icon={DollarSign} title="درآمد خالص" value={`${(orderStats?.totalRevenue ?? 0).toLocaleString("fa-IR")} ت`} color="bg-emerald-500/10 text-emerald-600" />
            <MetricCard icon={Users} title="تعداد کاربران" value={userCount ?? 0} color="bg-sky-500/10 text-sky-600" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="clay-card p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> پربازدیدترین محصولات</h3>
              {topProducts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">هنوز داده‌ای وجود ندارد.</p> : (
                <div className="space-y-3">
                  {topProducts.map((p: any) => {
                    const maxV = Math.max(...topProducts.map((tp: any) => tp.views), 1);
                    return (
                      <div key={p._id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate max-w-[150px]">{p.name}</span>
                          <span className="text-[11px] text-muted-foreground">{p.views} بازدید</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(p.views / maxV) * 100}%`, background: "linear-gradient(90deg, var(--primary), hsl(var(--primary) / 0.6))" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="clay-card p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> وضعیت سفارشات</h3>
              <div className="space-y-3">
                {[
                  { label: "در انتظار تأیید", count: orderStats?.pendingOrders ?? 0, color: "bg-amber-500" },
                  { label: "پرداخت شده", count: Math.max((orderStats?.totalOrders ?? 0) - (orderStats?.pendingOrders ?? 0) - (orderStats?.deliveredOrders ?? 0), 0), color: "bg-sky-500" },
                  { label: "تحویل شده", count: orderStats?.deliveredOrders ?? 0, color: "bg-emerald-500" },
                ].map((item, i) => {
                  const maxC = Math.max(orderStats?.totalOrders ?? 1, 1);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-xs">{item.label}</span>
                        <span className="text-xs font-medium">{item.count} سفارش</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.max((item.count / maxC) * 100, 2)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {productStats && productStats.lowStock > 0 && (
            <div className="clay-card p-5 border border-amber-300/50">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ هشدار موجودی کم</h3>
              <p className="text-sm text-muted-foreground">{productStats.lowStock} محصول موجودی پایینی دارند و نیاز به تأمین مجدد دارند.</p>
            </div>
          )}
        </>
      )}

      {/* ── گزارش سفارشات ── */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-sm">گزارش سفارشات ({filteredOrders.length} سفارش)</h3>
            <div className="flex items-center gap-2">
              <select value={exportType} onChange={(e) => setExportType(e.target.value as any)} className="clay-input px-3 py-1.5 text-xs outline-none">
                <option value="excel">خروجی Excel</option><option value="csv">خروجی CSV</option>
              </select>
              <button onClick={() => handleExport("orders")} className="clay-button flex items-center gap-1 px-3 py-1.5 text-xs"><Download className="h-3 w-3" /> خروجی</button>
            </div>
          </div>
          <DateRangeBar dateFrom={ordersDateFrom} dateTo={ordersDateTo} onChangeFrom={(v) => { setOrdersDateFrom(v); setOrdersPage(1); }} onChangeTo={(v) => { setOrdersDateTo(v); setOrdersPage(1); }} />
          <div className="flex items-center gap-2">
            <TableSearch value={ordersSearch} onChange={(v) => { setOrdersSearch(v); setOrdersPage(1); }} placeholder="جستجوی شماره سفارش یا آدرس..." />
          </div>
          <div className="clay-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                {([
                  { key: "orderNumber", label: "شماره سفارش" },
                  { key: "createdAt", label: "تاریخ" },
                  { key: "total", label: "مبلغ" },
                  { key: "status", label: "وضعیت" },
                ] as const).map((col) => (
                  <th key={col.key} className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => setOrdersSort(toggleSort(ordersSort, col.key))}>
                    <span className="inline-flex items-center gap-1">{col.label} <SortIcon active={ordersSort.key === col.key} asc={ordersSort.asc} /></span>
                  </th>
                ))}
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr></thead>
              <tbody>
                {paginatedOrders.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">سفارشی یافت نشد.</td></tr> : paginatedOrders.map((o: any) => (
                  <tr key={o._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="p-3 text-xs">{formatJalaliDate(o.createdAt)}</td>
                    <td className="p-3 font-bold text-xs">{o.total.toLocaleString("fa-IR")} ریال</td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${o.status === "delivered" ? "bg-emerald-100 text-emerald-700" : o.status === "cancelled" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{ORDER_STATUSES.find((s) => s.value === o.status)?.label || o.status}</span></td>
                    <td className="p-3 text-center"><button onClick={() => setInvoiceOrder(o)} className="text-primary hover:underline text-xs">پیش‌فاکتور</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={ordersPage} total={filteredOrders.length} pageSize={PAGE_SIZE} onPage={setOrdersPage} />
        </div>
      )}

      {/* ── گزارش محصولات ── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-sm">گزارش محصولات ({filteredProducts.length} محصول)</h3>
            <div className="flex items-center gap-2">
              <select value={exportType} onChange={(e) => setExportType(e.target.value as any)} className="clay-input px-3 py-1.5 text-xs outline-none">
                <option value="excel">خروجی Excel</option><option value="csv">خروجی CSV</option>
              </select>
              <button onClick={() => handleExport("products")} className="clay-button flex items-center gap-1 px-3 py-1.5 text-xs"><Download className="h-3 w-3" /> خروجی</button>
            </div>
          </div>
          <DateRangeBar dateFrom={productsDateFrom} dateTo={productsDateTo} onChangeFrom={(v) => { setProductsDateFrom(v); setProductsPage(1); }} onChangeTo={(v) => { setProductsDateTo(v); setProductsPage(1); }} />
          <div className="flex items-center gap-2">
            <TableSearch value={productsSearch} onChange={(v) => { setProductsSearch(v); setProductsPage(1); }} placeholder="جستجوی نام محصول یا برند..." />
          </div>
          <div className="clay-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                {([
                  { key: "name", label: "نام محصول" },
                  { key: "price", label: "قیمت" },
                  { key: "stock", label: "موجودی" },
                  { key: "views", label: "بازدید" },
                  { key: "isActive", label: "وضعیت" },
                ] as const).map((col) => (
                  <th key={col.key} className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => setProductsSort(toggleSort(productsSort, col.key))}>
                    <span className="inline-flex items-center gap-1">{col.label} <SortIcon active={productsSort.key === col.key} asc={productsSort.asc} /></span>
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {paginatedProducts.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">محصولی یافت نشد.</td></tr> : paginatedProducts.map((p: any) => (
                  <tr key={p._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-xs">{p.name}</td>
                    <td className="p-3 text-xs">{p.price.toLocaleString("fa-IR")} ریال</td>
                    <td className="p-3"><span className={`text-xs ${p.stock <= (p.stockAlert ?? 5) ? "text-rose-600 font-bold" : ""}`}>{p.stock}</span></td>
                    <td className="p-3 text-xs flex items-center gap-1"><Eye className="h-3 w-3" /> {p.views}</td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{p.isActive ? "فعال" : "غیرفعال"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={productsPage} total={filteredProducts.length} pageSize={PAGE_SIZE} onPage={setProductsPage} />
        </div>
      )}

      {/* ── گزارش کاربران ── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-sm">گزارش کاربران ({filteredUsers.length} کاربر)</h3>
            <div className="flex items-center gap-2">
              <select value={exportType} onChange={(e) => setExportType(e.target.value as any)} className="clay-input px-3 py-1.5 text-xs outline-none">
                <option value="excel">خروجی Excel</option><option value="csv">خروجی CSV</option>
              </select>
              <button onClick={() => handleExport("users")} className="clay-button flex items-center gap-1 px-3 py-1.5 text-xs"><Download className="h-3 w-3" /> خروجی</button>
            </div>
          </div>
          <DateRangeBar dateFrom={usersDateFrom} dateTo={usersDateTo} onChangeFrom={(v) => { setUsersDateFrom(v); setUsersPage(1); }} onChangeTo={(v) => { setUsersDateTo(v); setUsersPage(1); }} />
          <div className="flex items-center gap-2">
            <TableSearch value={usersSearch} onChange={(v) => { setUsersSearch(v); setUsersPage(1); }} placeholder="جستجوی نام، ایمیل یا تلفن..." />
          </div>
          <div className="clay-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                {([
                  { key: "name", label: "نام" },
                  { key: "email", label: "ایمیل" },
                  { key: "phone", label: "تلفن" },
                  { key: "role", label: "نقش" },
                  { key: "createdAt", label: "تاریخ ثبت‌نام" },
                ] as const).map((col) => (
                  <th key={col.key} className="p-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none" onClick={() => setUsersSort(toggleSort(usersSort, col.key))}>
                    <span className="inline-flex items-center gap-1">{col.label} <SortIcon active={usersSort.key === col.key} asc={usersSort.asc} /></span>
                  </th>
                ))}
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
              </tr></thead>
              <tbody>
                {paginatedUsers.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">کاربری یافت نشد.</td></tr> : paginatedUsers.map((u: any) => (
                  <tr key={u._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-xs">{u.name || "—"}</td>
                    <td className="p-3 text-xs" dir="ltr">{u.email || "—"}</td>
                    <td className="p-3 text-xs" dir="ltr">{u.phone || "—"}</td>
                    <td className="p-3 text-xs"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-medium">{u.role || "user"}</span></td>
                    <td className="p-3 text-xs text-muted-foreground">{u.createdAt ? formatJalaliDate(u.createdAt) : "—"}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{u.isActive ? "فعال" : "غیرفعال"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={usersPage} total={filteredUsers.length} pageSize={PAGE_SIZE} onPage={setUsersPage} />
        </div>
      )}

      {/* ── بازدید محصولات ── */}
      {activeTab === "views" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-sm">گزارش بازدید محصولات ({filteredViews.length} محصول)</h3>
            <div className="flex items-center gap-2">
              <select value={exportType} onChange={(e) => setExportType(e.target.value as any)} className="clay-input px-3 py-1.5 text-xs outline-none">
                <option value="excel">خروجی Excel</option><option value="csv">خروجی CSV</option>
              </select>
              <button onClick={() => {
                const data = filteredViews.map((p: any) => ({ "نام": p.name, "بازدید": p.views, "امتیاز": p.rating ?? 0, "قیمت": p.price, "وضعیت": p.isActive ? "فعال" : "غیرفعال" }));
                if (exportType === "csv") exportToCSV(data, "گزارش-بازدید-محصولات"); else exportToExcel(data, "گزارش-بازدید-محصولات");
              }} className="clay-button flex items-center gap-1 px-3 py-1.5 text-xs"><Download className="h-3 w-3" /> خروجی</button>
            </div>
          </div>
          <DateRangeBar dateFrom={viewsDateFrom} dateTo={viewsDateTo} onChangeFrom={(v) => { setViewsDateFrom(v); setViewsPage(1); }} onChangeTo={(v) => { setViewsDateTo(v); setViewsPage(1); }} />
          <div className="flex items-center gap-2">
            <TableSearch value={viewsSearch} onChange={(v) => { setViewsSearch(v); setViewsPage(1); }} placeholder="جستجوی نام محصول..." />
          </div>
          <div className="clay-card p-5">
            <h4 className="font-semibold text-xs mb-3">۱۰ محصول پربازدید</h4>
            {filteredViews.length > 0 ? (
              <div className="space-y-3">
                {[...filteredViews].sort((a: any, b: any) => b.views - a.views).slice(0, 10).map((p: any) => {
                  const maxV = Math.max(...filteredViews.map((tp: any) => tp.views), 1);
                  return (
                    <div key={p._id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                        <span className="text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />{p.views}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(p.views / maxV) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-6">داده‌ای وجود ندارد.</p>}
          </div>
          <div className="clay-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">نام محصول</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">بازدید</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">امتیاز</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">نظرات</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">قیمت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
              </tr></thead>
              <tbody>
                {paginatedViews.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">داده‌ای یافت نشد.</td></tr> : paginatedViews.map((p: any) => (
                  <tr key={p._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-xs">{p.name}</td>
                    <td className="p-3 text-center text-xs flex items-center justify-center gap-1"><Eye className="h-3 w-3" /> {p.views}</td>
                    <td className="p-3 text-center text-xs">{p.rating ? `⭐ ${p.rating}` : "—"}</td>
                    <td className="p-3 text-center text-xs">{p.reviewCount ?? 0}</td>
                    <td className="p-3 text-xs">{p.price.toLocaleString("fa-IR")} ریال</td>
                    <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{p.isActive ? "فعال" : "غیرفعال"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={viewsPage} total={filteredViews.length} pageSize={PAGE_SIZE} onPage={setViewsPage} />
        </div>
      )}

      {/* ── فاکتورها ── */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">فاکتورها و پیش‌فاکتورها ({filteredInvoices.length} فاکتور)</h3>
          <DateRangeBar dateFrom={invoicesDateFrom} dateTo={invoicesDateTo} onChangeFrom={(v) => { setInvoicesDateFrom(v); setInvoicesPage(1); }} onChangeTo={(v) => { setInvoicesDateTo(v); setInvoicesPage(1); }} />
          {filteredInvoices.length === 0 ? (
            <div className="clay-card p-12 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">فاکتوری یافت نشد.</p></div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedInvoices.map((o: any) => (
                  <div key={o._id} className="clay-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatJalaliDate(o.createdAt)} — {o.total.toLocaleString("fa-IR")} ریال</p>
                    </div>
                    <button onClick={() => setInvoiceOrder(o)} className="clay-button px-3 py-1.5 text-xs">مشاهده فاکتور</button>
                  </div>
                ))}
              </div>
              <Pagination page={invoicesPage} total={filteredInvoices.length} pageSize={PAGE_SIZE} onPage={setInvoicesPage} />
            </>
          )}
        </div>
      )}

      {/* ── گزارش پیشرفته ── */}
      {activeTab === "dynamic" && (
        <DynamicReportBuilder data={dynamicData} tableName={dynamicTable} onTableChange={(id) => setDynamicTable(id)} />
      )}

      {/* ── مودال فاکتور ── */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setInvoiceOrder(null)}>
          <div className="bg-background rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">پیش‌فاکتور</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="clay-button px-3 py-1.5 text-xs">چاپ</button>
                <button onClick={() => setInvoiceOrder(null)} className="text-muted-foreground hover:text-foreground text-xs">بستن ✕</button>
              </div>
            </div>
            <InvoicePreview order={invoiceOrder} />
          </div>
        </div>
      )}
    </div>
  );
}
