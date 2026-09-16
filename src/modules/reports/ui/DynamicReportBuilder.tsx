import { useState, useMemo, useRef } from "react";

import {
  Columns, Filter, Download, Printer, CheckSquare, Square,
  ChevronDown, ChevronUp, Search, Calendar,
} from "lucide-react";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/config/constants";
import { formatJalaliDate, parseJalaliString } from "@/lib/jalali";
import { ReportSettings, DEFAULT_SETTINGS, type ReportSettingsData } from "./ReportSettings";
import { JalaliDatePicker } from "@/modules/shared/ui/JalaliDatePicker";

// ── Table Definitions (Persian + English names) ──
interface ColumnDef {
  key: string;
  label: string;
  labelEn: string;
  type: "text" | "number" | "date" | "boolean" | "status";
  filterable: boolean;
  sortable: boolean;
}

interface TableDef {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  columns: ColumnDef[];
}

export const TABLES: TableDef[] = [
  {
    id: "products",
    label: "محصولات",
    labelEn: "Products",
    icon: "📦",
    columns: [
      { key: "name", label: "نام محصول", labelEn: "Product Name", type: "text", filterable: true, sortable: true },
      { key: "price", label: "قیمت", labelEn: "Price", type: "number", filterable: true, sortable: true },
      { key: "salePrice", label: "قیمت ویژه", labelEn: "Sale Price", type: "number", filterable: false, sortable: true },
      { key: "stock", label: "موجودی", labelEn: "Stock", type: "number", filterable: true, sortable: true },
      { key: "views", label: "بازدید", labelEn: "Views", type: "number", filterable: false, sortable: true },
      { key: "rating", label: "امتیاز", labelEn: "Rating", type: "number", filterable: false, sortable: true },
      { key: "brand", label: "برند", labelEn: "Brand", type: "text", filterable: true, sortable: true },
      { key: "isActive", label: "وضعیت", labelEn: "Status", type: "boolean", filterable: true, sortable: false },
      { key: "isFeatured", label: "ویژه", labelEn: "Featured", type: "boolean", filterable: true, sortable: false },
      { key: "createdAt", label: "تاریخ ایجاد", labelEn: "Created At", type: "date", filterable: false, sortable: true },
    ],
  },
  {
    id: "orders",
    label: "سفارشات",
    labelEn: "Orders",
    icon: "📋",
    columns: [
      { key: "orderNumber", label: "شماره سفارش", labelEn: "Order #", type: "text", filterable: true, sortable: true },
      { key: "total", label: "مبلغ کل", labelEn: "Total", type: "number", filterable: true, sortable: true },
      { key: "status", label: "وضعیت سفارش", labelEn: "Order Status", type: "status", filterable: true, sortable: true },
      { key: "paymentStatus", label: "وضعیت پرداخت", labelEn: "Payment Status", type: "status", filterable: true, sortable: true },
      { key: "paymentMethod", label: "روش پرداخت", labelEn: "Payment Method", type: "text", filterable: true, sortable: false },
      { key: "shippingMethod", label: "روش ارسال", labelEn: "Shipping Method", type: "text", filterable: true, sortable: false },
      { key: "address", label: "آدرس", labelEn: "Address", type: "text", filterable: false, sortable: false },
      { key: "createdAt", label: "تاریخ", labelEn: "Date", type: "date", filterable: false, sortable: true },
    ],
  },
  {
    id: "users",
    label: "کاربران",
    labelEn: "Users",
    icon: "👥",
    columns: [
      { key: "name", label: "نام", labelEn: "Name", type: "text", filterable: true, sortable: true },
      { key: "email", label: "ایمیل", labelEn: "Email", type: "text", filterable: true, sortable: true },
      { key: "phone", label: "تلفن", labelEn: "Phone", type: "text", filterable: true, sortable: false },
      { key: "role", label: "نقش", labelEn: "Role", type: "text", filterable: true, sortable: true },
      { key: "isActive", label: "فعال", labelEn: "Active", type: "boolean", filterable: true, sortable: false },
      { key: "createdAt", label: "تاریخ ثبت‌نام", labelEn: "Joined At", type: "date", filterable: false, sortable: true },
    ],
  },
  {
    id: "discounts",
    label: "تخفیف‌ها",
    labelEn: "Discounts",
    icon: "🏷️",
    columns: [
      { key: "code", label: "کد تخفیف", labelEn: "Code", type: "text", filterable: true, sortable: true },
      { key: "type", label: "نوع", labelEn: "Type", type: "text", filterable: true, sortable: false },
      { key: "value", label: "مقدار", labelEn: "Value", type: "number", filterable: true, sortable: true },
      { key: "usedCount", label: "تعداد استفاده", labelEn: "Used Count", type: "number", filterable: false, sortable: true },
      { key: "isActive", label: "فعال", labelEn: "Active", type: "boolean", filterable: true, sortable: false },
      { key: "startDate", label: "تاریخ شروع", labelEn: "Start Date", type: "date", filterable: false, sortable: true },
      { key: "endDate", label: "تاریخ پایان", labelEn: "End Date", type: "date", filterable: false, sortable: true },
    ],
  },
  {
    id: "brands",
    label: "برندها",
    labelEn: "Brands",
    icon: "🏷️",
    columns: [
      { key: "name", label: "نام برند", labelEn: "Brand Name", type: "text", filterable: true, sortable: true },
      { key: "slug", label: "اسلاگ", labelEn: "Slug", type: "text", filterable: false, sortable: true },
      { key: "isActive", label: "فعال", labelEn: "Active", type: "boolean", filterable: true, sortable: false },
      { key: "createdAt", label: "تاریخ ایجاد", labelEn: "Created At", type: "date", filterable: false, sortable: true },
    ],
  },
  {
    id: "shipping",
    label: "روش‌های ارسال",
    labelEn: "Shipping Methods",
    icon: "🚚",
    columns: [
      { key: "name", label: "نام (انگلیسی)", labelEn: "Name", type: "text", filterable: true, sortable: true },
      { key: "nameFa", label: "نام (فارسی)", labelEn: "Name (FA)", type: "text", filterable: true, sortable: true },
      { key: "type", label: "نوع ارسال", labelEn: "Type", type: "text", filterable: true, sortable: false },
      { key: "cost", label: "هزینه", labelEn: "Cost", type: "number", filterable: true, sortable: true },
      { key: "isActive", label: "فعال", labelEn: "Active", type: "boolean", filterable: true, sortable: false },
    ],
  },
  {
    id: "tickets",
    label: "تیکت‌ها",
    labelEn: "Tickets",
    icon: "🎫",
    columns: [
      { key: "subject", label: "موضوع", labelEn: "Subject", type: "text", filterable: true, sortable: true },
      { key: "category", label: "دسته‌بندی", labelEn: "Category", type: "text", filterable: true, sortable: true },
      { key: "priority", label: "اولویت", labelEn: "Priority", type: "text", filterable: true, sortable: true },
      { key: "status", label: "وضعیت", labelEn: "Status", type: "status", filterable: true, sortable: true },
      { key: "createdAt", label: "تاریخ ایجاد", labelEn: "Created At", type: "date", filterable: false, sortable: true },
    ],
  },
];

// ── Export Helpers ──
function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

function exportToExcel(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${filename}">
    <Table>
      <Row>${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>
      ${data.map((row) => `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${String(row[h] ?? "")}</Data></Cell>`).join("")}</Row>`).join("\n      ")}
    </Table>
  </Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xls`;
  link.click();
}

function formatValue(value: any, type: string, key: string): string {
  if (value === null || value === undefined) return "—";
  switch (type) {
    case "date":
      try { return formatJalaliDate(value); } catch { return new Date(value).toLocaleDateString("fa-IR"); }
    case "boolean":
      return value ? "✅" : "❌";
    case "status":
      if (key === "status") return ORDER_STATUSES.find((s) => s.value === value)?.label || value;
      if (key === "paymentStatus") return PAYMENT_STATUSES.find((s) => s.value === value)?.label || value;
      return value;
    case "number":
      return typeof value === "number" ? value.toLocaleString("fa-IR") : String(value);
    default:
      return String(value);
  }
}

// ── Searchable Table Dropdown ──
function TableDropdown({ tables, value, onChange }: { tables: TableDef[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = tables.filter(
    (t) =>
      t.label.includes(query) ||
      t.labelEn.toLowerCase().includes(query.toLowerCase()) ||
      t.id.includes(query.toLowerCase())
  );

  const selected = tables.find((t) => t.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="clay-input w-full p-3 text-sm outline-none text-right flex items-center gap-2"
      >
        <span>{selected?.icon}</span>
        <span className="font-medium">{selected?.label}</span>
        <span className="text-muted-foreground text-xs" dir="ltr">({selected?.labelEn})</span>
        <ChevronDown className={`h-3.5 w-3.5 mr-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-xl shadow-xl overflow-hidden" style={{ zIndex: 60 }}>
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی جدول..."
                className="w-full h-8 pl-7 pr-3 text-xs outline-none bg-muted/50 rounded-lg"
                autoFocus
              />
            </div>
          </div>
          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => { onChange(t.id); setOpen(false); setQuery(""); }}
                className={`w-full px-3 py-2.5 text-right text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                  value === t.id ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span className="text-xs text-muted-foreground mr-auto" dir="ltr">({t.labelEn})</span>
                <span className="text-[10px] text-muted-foreground">{t.columns.length} ستون</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="p-3 text-xs text-muted-foreground text-center">جدولی یافت نشد</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──
interface DynamicReportBuilderProps {
  data: Record<string, any>[];
  tableName: string;
  onTableChange: (id: string) => void;
}

export function DynamicReportBuilder({ data: allData, tableName, onTableChange }: DynamicReportBuilderProps) {
  const tableDef = TABLES.find((t) => t.id === tableName) || TABLES[0];
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    tableDef.columns.slice(0, 6).map((c) => c.key)
  );
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("excel");
  const [settings, setSettings] = useState<ReportSettingsData>(DEFAULT_SETTINGS);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [presets, setPresets] = useState<{ name: string; table: string; columns: string[]; filters: Record<string, string> }[]>(() => {
    try { return JSON.parse(localStorage.getItem("report_presets") || "[]"); } catch { return []; }
  });
  const [presetName, setPresetName] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // When table changes, reset columns to first 6
  const handleTableChange = (id: string) => {
    const newTable = TABLES.find((t) => t.id === id);
    if (newTable) {
      setSelectedColumns(newTable.columns.slice(0, 6).map((c) => c.key));
      setFilters({});
      setSearch("");
      setSortKey("");
      setDateFrom("");
      setDateTo("");
    }
    onTableChange(id);
  };

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...(allData || [])];

    // Date range filter
    const hasDateCol = tableDef.columns.some((c) => c.type === "date" && c.key === "createdAt");
    if (hasDateCol && (dateFrom || dateTo)) {
      const fromTs = dateFrom ? (parseJalaliString(dateFrom)?.getTime() ?? 0) : 0;
      const toTs = dateTo ? (parseJalaliString(dateTo)?.getTime() ?? 0) + 86400000 : Infinity;
      result = result.filter((row) => {
        const ts = row.createdAt;
        if (!ts) return false;
        return ts >= fromTs && ts <= toTs;
      });
    }

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q))
      );
    }

    // Column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (!value.trim()) return;
      const col = tableDef.columns.find((c) => c.key === key);
      if (!col) return;
      const q = value.toLowerCase();
      result = result.filter((row) => {
        const cell = String(row[key] ?? "").toLowerCase();
        if (col.type === "boolean") {
          const bVal = value === "true" || value === "فعال";
          return row[key] === bVal;
        }
        if (col.type === "number") {
          const num = Number(value);
          return !isNaN(num) && row[key] === num;
        }
        return cell.includes(q);
      });
    });

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (va === vb) return 0;
        const cmp = va < vb ? -1 : 1;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [allData, search, filters, sortKey, sortDir, tableDef, dateFrom, dateTo]);

  // Export data
  const exportData = useMemo(() => {
    return filteredData.map((row) => {
      const out: Record<string, any> = {};
      selectedColumns.forEach((key) => {
        const col = tableDef.columns.find((c) => c.key === key);
        out[col?.label || key] = formatValue(row[key], col?.type || "text", key);
      });
      return out;
    });
  }, [filteredData, selectedColumns, tableDef]);

  const handleExport = () => {
    const filename = `گزارش-${tableDef.label}-${new Date().toLocaleDateString("fa-IR")}`;
    if (exportFormat === "csv") exportToCSV(exportData, filename);
    else if (exportFormat === "excel") exportToExcel(exportData, filename);
    else window.print();
  };

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const visibleCols = tableDef.columns.filter((c) => selectedColumns.includes(c.key));

  const fontSizeClass = settings.fontSize === "small" ? "text-[10px]" : settings.fontSize === "large" ? "text-sm" : "text-xs";

  return (
    <div className="space-y-4">
      {/* Print CSS */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden !important; }
          .print-report, .print-report * { visibility: visible !important; }
          .print-report {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          @page { margin: 10mm !important; }
        }
      `}</style>

      {/* ── Controls (no-print) ── */}
      <div className="no-print space-y-4">
        {/* Table Selector (searchable dropdown) */}
        <div className="clay-card p-4" style={{ position: 'relative', zIndex: 50 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold">انتخاب جدول</span>
          </div>
          <TableDropdown tables={TABLES} value={tableName} onChange={handleTableChange} />
        </div>

        {/* Column Selector */}
        <div className="clay-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">انتخاب ستون‌ها</span>
              <span className="text-[10px] text-muted-foreground">({selectedColumns.length}/{tableDef.columns.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedColumns(tableDef.columns.map((c) => c.key))} className="text-[10px] text-primary hover:underline">انتخاب همه</button>
              <button onClick={() => setSelectedColumns([])} className="text-[10px] text-muted-foreground hover:underline">حذف همه</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tableDef.columns.map((col) => (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedColumns.includes(col.key)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {selectedColumns.includes(col.key) ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                {col.label}
                <span className="text-[9px] opacity-60" dir="ltr">{col.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range & Filters */}
        <div className="clay-card p-4 space-y-3">
          {/* Date Range */}
          {tableDef.columns.some((c) => c.key === "createdAt") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">محدوده تاریخ</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <JalaliDatePicker label="از تاریخ" value={dateFrom} onChange={setDateFrom} />
                <JalaliDatePicker label="تا تاریخ" value={dateTo} onChange={setDateTo} />
              </div>
            </div>
          )}

          {/* Column Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-semibold w-full"
          >
            <Filter className="h-4 w-4 text-primary" />
            فیلترهای پیشرفته
            {showFilters ? <ChevronUp className="h-3 w-3 mr-auto" /> : <ChevronDown className="h-3 w-3 mr-auto" />}
          </button>
          {showFilters && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در تمام ستون‌ها..."
                  className="clay-input w-full h-8 pl-8 pr-3 text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tableDef.columns.filter((c) => c.filterable).map((col) => (
                  <div key={col.key}>
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">{col.label} <span className="opacity-60">/ {col.labelEn}</span></label>
                    {col.type === "boolean" ? (
                      <select
                        value={filters[col.key] || ""}
                        onChange={(e) => setFilters((f) => ({ ...f, [col.key]: e.target.value }))}
                        className="clay-input w-full p-1.5 text-[11px] outline-none"
                      >
                        <option value="">همه</option>
                        <option value="true">فعال / Active</option>
                        <option value="false">غیرفعال / Inactive</option>
                      </select>
                    ) : (
                      <input
                        value={filters[col.key] || ""}
                        onChange={(e) => setFilters((f) => ({ ...f, [col.key]: e.target.value }))}
                        placeholder={`فیلتر ${col.label}...`}
                        className="clay-input w-full p-1.5 text-[11px] outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => { setFilters({}); setSearch(""); }} className="text-[10px] text-muted-foreground hover:text-foreground">پاک کردن فیلترها</button>
            </div>
          )}
        </div>

        {/* Export Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as any)} className="clay-input px-3 py-2 text-xs outline-none">
            <option value="excel">خروجی Excel (.xls)</option>
            <option value="csv">خروجی CSV (.csv)</option>
            <option value="pdf">چاپ / PDF</option>
          </select>
          <button onClick={handleExport} className="clay-button flex items-center gap-1.5 px-4 py-2 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> خروجی بگیر
          </button>
          <button onClick={() => window.print()} className="clay-button flex items-center gap-1.5 px-4 py-2 text-xs bg-muted text-foreground">
            <Printer className="h-3.5 w-3.5" /> چاپ
          </button>
          <div className="mr-auto flex items-center gap-2">
            {/* ذخیره و بازیابی گزارش سفارشی */}
            <div className="relative">
              <button onClick={() => setShowPresets(!showPresets)} className="text-xs text-primary hover:underline">📋 گزارش‌های ذخیره‌شده ({presets.length})</button>
              {showPresets && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-2 space-y-1">
                  <div className="flex gap-1">
                    <input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="نام گزارش" className="clay-input flex-1 p-1.5 text-[11px] outline-none" />
                    <button onClick={() => {
                      if (!presetName.trim()) return;
                      const newPreset = { name: presetName, table: tableName, columns: selectedColumns, filters };
                      const updated = [...presets, newPreset];
                      setPresets(updated);
                      localStorage.setItem("report_presets", JSON.stringify(updated));
                      setPresetName("");
                      setShowPresets(false);
                    }} className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-lg">ذخیره</button>
                  </div>
                  {presets.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">گزارش ذخیره‌شده‌ای نیست.</p>}
                  {presets.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted text-[11px]">
                      <button onClick={() => {
                        if (p.table !== tableName) onTableChange(p.table);
                        setSelectedColumns(p.columns);
                        setFilters(p.filters);
                        setShowPresets(false);
                      }} className="text-right font-medium truncate flex-1">{p.name}</button>
                      <button onClick={() => {
                        const updated = presets.filter((_, i) => i !== idx);
                        setPresets(updated);
                        localStorage.setItem("report_presets", JSON.stringify(updated));
                      }} className="text-rose-500 text-[10px] mr-2">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ReportSettings settings={settings} onChange={setSettings} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredData.length} رکورد از {allData?.length || 0} — {selectedColumns.length} ستون انتخاب شده
        </p>
      </div>

      {/* ── Printable Report (centered) ── */}
      <div
        ref={reportRef}
        className="print-report bg-white shadow-lg rounded-2xl overflow-hidden mx-auto"
        style={{
          direction: settings.direction,
          maxWidth: "900px",
          border: settings.showBorder ? "1px solid #e5e7eb" : "none",
        }}
      >
        {/* Header */}
        <div
          className="border-b border-gray-200 flex items-center justify-between"
          style={{
            padding: `${settings.marginTop}px ${settings.marginRight}px`,
            paddingBottom: `${settings.marginTop}px`,
          }}
        >
          <div className="flex items-center gap-3">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
            )}
            <div>
              <h2 className="font-bold text-lg">{settings.header}</h2>
              <p className="text-xs text-gray-500">{settings.companyName}</p>
            </div>
          </div>
          <div className="text-left text-xs text-gray-500 space-y-0.5">
            {settings.showDate && <p>{formatJalaliDate(Date.now())}</p>}
            <p>جدول: {tableDef.label} / {tableDef.labelEn}</p>
            {(dateFrom || dateTo) && (
              <p className="text-primary">
                {dateFrom ? `از ${formatJalaliDate(new Date(dateFrom).getTime())}` : ""}
                {dateFrom && dateTo ? " — " : ""}
                {dateTo ? `تا ${formatJalaliDate(new Date(dateTo).getTime())}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto"
          style={{ padding: `${settings.marginTop / 2}px ${settings.marginRight}px ${settings.marginBottom / 2}px ${settings.marginLeft}px` }}
        >
          <table className={`w-full border-collapse ${fontSizeClass}`}>
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-right border-b-2 border-gray-300 font-bold text-gray-700 w-8">#</th>
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => {
                      if (!col.sortable) return;
                      if (sortKey === col.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else { setSortKey(col.key); setSortDir("asc"); }
                    }}
                    className={`p-2 text-right border-b-2 border-gray-300 font-bold text-gray-700 whitespace-nowrap ${col.sortable ? "cursor-pointer hover:bg-gray-200" : ""}`}
                  >
                    {col.label}
                    <span className="text-[9px] font-normal text-gray-400 mr-1" dir="ltr">{col.labelEn}</span>
                    {sortKey === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 1} className="p-8 text-center text-gray-400">داده‌ای یافت نشد</td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={row._id || i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-gray-100/50`}>
                    <td className="p-2 border-b border-gray-100 text-gray-400">{i + 1}</td>
                    {visibleCols.map((col) => (
                      <td key={col.key} className="p-2 border-b border-gray-100 whitespace-nowrap">
                        {formatValue(row[col.key], col.type, col.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400"
          style={{ padding: `${settings.marginBottom / 2}px ${settings.marginRight}px ${settings.marginBottom}px ${settings.marginLeft}px` }}
        >
          <span>{settings.footer}</span>
          {settings.showPageNumber && <span>صفحه ۱ از ۱</span>}
        </div>
      </div>
    </div>
  );
}
