import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react";

interface ParsedProduct {
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock: number;
  brand?: string;
  tags?: string;
  isValid: boolean;
  error?: string;
}

export function ProductImport({ onClose }: { onClose: () => void }) {
  const categories = useQuery(api.categories.listActive);
  const createProduct = useMutation(api.products.create);
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file: File) => {
    // Simple CSV/TSV parser (works for basic spreadsheet exports)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("فایل خالی است یا فرمت نامعتبر.");
        return;
      }

      const header = lines[0].split(/[,\t]/).map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      const products: ParsedProduct[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,\t]/).map((v) => v.trim().replace(/"/g, ""));
        const row: Record<string, string> = {};
        header.forEach((h, idx) => { row[h] = values[idx] || ""; });

        const name = row["name"] || row["نام"] || "";
        const price = parseFloat(row["price"] || row["قیمت"] || "0");
        const stock = parseInt(row["stock"] || row["موجودی"] || "0");

        if (!name) {
          products.push({ name: `ردیف ${i + 1}`, price: 0, stock: 0, isValid: false, error: "نام خالی است" });
        } else if (isNaN(price) || price <= 0) {
          products.push({ name, price: 0, stock: 0, isValid: false, error: "قیمت نامعتبر" });
        } else {
          products.push({
            name,
            nameEn: row["nameen"] || row["name_en"] || row["نام انگلیسی"] || undefined,
            description: row["description"] || row["توضیحات"] || `${name} - محصول وارد شده از اکسل`,
            price,
            salePrice: parseFloat(row["saleprice"] || row["قیمت ویژه"] || "0") || undefined,
            stock: isNaN(stock) ? 10 : stock,
            brand: row["brand"] || row["برند"] || undefined,
            tags: row["tags"] || row["برچسب"] || undefined,
            isValid: true,
          });
        }
      }

      setParsedProducts(products);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedCategoryId) { toast.error("لطفاً دسته‌بندی را انتخاب کنید."); return; }
    const validProducts = parsedProducts.filter((p) => p.isValid);
    if (validProducts.length === 0) { toast.error("محصول معتبری برای وارد کردن وجود ندارد."); return; }

    setImporting(true);
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const product of validProducts) {
      try {
        const slug = (product.nameEn || product.name).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-").trim();
        await createProduct({
          name: product.name,
          slug: slug || `product-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          description: product.description || product.name,
          shortDescription: product.nameEn ? `${product.nameEn} - ${product.name}` : product.name,
          price: product.price,
          salePrice: product.salePrice && product.salePrice > 0 ? product.salePrice : undefined,
          stock: product.stock,
          stockAlert: 5,
          categoryId: selectedCategoryId as any,
          tags: product.tags ? product.tags.split(",").map((t) => t.trim()) : [],
          brand: product.brand,
          isFeatured: false,
          isActive: true,
          images: [],
        });
        success++;
      } catch (e: any) {
        failed++;
        errors.push(`${product.name}: ${e.message || "خطا"}`);
      }
    }

    setResults({ success, failed, errors });
    setImporting(false);
    if (success > 0) toast.success(`${success} محصول با موفقیت وارد شد.`);
    if (failed > 0) toast.error(`${failed} محصول وارد نشد.`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">بارگذاری محصولات از فایل اکسل</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted/30 rounded-xl text-xs space-y-2">
          <p className="font-semibold">راهنمای فرمت فایل:</p>
          <p>فایل باید شامل ستون‌های زیر باشد (با کاما یا تب جدا شده):</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {["name/نام", "nameen/نام انگلیسی", "price/قیمت", "saleprice/قیمت ویژه", "stock/موجودی", "brand/برند", "tags/برچسب"].map((col) => (
              <span key={col} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">{col}</span>
            ))}
          </div>
          <p className="text-muted-foreground">ستون‌های name و price الزامی هستند.</p>
        </div>

        {/* File Upload */}
        <div
          className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
          {file ? (
            <div className="flex items-center gap-3 justify-center">
              <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">{parsedProducts.length} ردیف شناسایی شد</p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">فایل CSV یا Excel را اینجا بکشید یا کلیک کنید</p>
            </div>
          )}
        </div>

        {/* Category Selection */}
        {parsedProducts.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">دسته‌بندی محصولات</label>
            <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="clay-input w-full p-3 text-sm outline-none">
              <option value="">انتخاب دسته‌بندی...</option>
              {categories?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Preview */}
        {parsedProducts.length > 0 && (
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b">
                <th className="p-2 text-right">نام</th>
                <th className="p-2 text-right">قیمت</th>
                <th className="p-2 text-right">موجودی</th>
                <th className="p-2 text-center">وضعیت</th>
              </tr></thead>
              <tbody>
                {parsedProducts.slice(0, 20).map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 font-medium">{p.name}</td>
                    <td className="p-2">{p.price.toLocaleString("fa-IR")} ت</td>
                    <td className="p-2">{p.stock}</td>
                    <td className="p-2 text-center">
                      {p.isValid ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mx-auto" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className={`p-4 rounded-xl text-xs ${results.failed > 0 ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
            <p className="font-semibold">{results.success} موفق — {results.failed} ناموفق</p>
            {results.errors.length > 0 && (
              <ul className="mt-2 space-y-1 text-red-600">
                {results.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleImport} disabled={parsedProducts.length === 0 || importing || !selectedCategoryId} className="clay-button px-5 py-2 text-sm font-semibold disabled:opacity-50">
            {importing ? "در حال وارد کردن..." : `وارد کردن ${parsedProducts.filter((p) => p.isValid).length} محصول`}
          </button>
          <button onClick={onClose} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">بستن</button>
        </div>
      </div>
    </div>
  );
}
