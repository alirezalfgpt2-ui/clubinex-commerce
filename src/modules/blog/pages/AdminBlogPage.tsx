/**
 * 📰 صفحه مدیریت بلاگ — نسخه حرفه‌ای
 * — نمایش جدولی و کارتی
 * — فیلتر وضعیت و دسته‌بندی
 * — افزودن در صفحه جداگانه
 */
import { useState } from "react";
import { Link } from "react-router";
import { Plus, Edit3, Trash2, Eye, Clock, Table2, LayoutGrid, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { formatJalaliDate } from "@/lib/jalali";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: number;
  status: "draft" | "published";
  image?: string;
  tags: string[];
}

const INITIAL_POSTS: BlogPost[] = [
  { id: "1", title: "راهنمای جامع خرید گوشی هوشمند", excerpt: "نکات مهم هنگام خرید گوشی هوشمند", content: "محتوا...", category: "راهنما", author: "تیم فنی", date: Date.now() - 2 * 86400000, status: "published", image: "https://picsum.photos/seed/blog1/800/400", tags: ["موبایل", "راهنما"] },
  { id: "2", title: "۱۰ نکته برای عمر باتری لپتاپ", excerpt: "افزایش عمر باتری", content: "محتوا...", category: "فنی", author: "علی محمدی", date: Date.now() - 5 * 86400000, status: "published", tags: ["لپتاپ"] },
  { id: "3", title: "مقایسه آیفون ۱۶ و سامسونگ S26", excerpt: "بررسی تفصیلی", content: "محتوا...", category: "مقایسه", author: "سارا احمدی", date: Date.now() - 1 * 86400000, status: "draft", tags: ["مقایسه", "موبایل"] },
];

type ViewMode = "table" | "card";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const confirmDialog = useConfirm();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = [...new Set(posts.map((p) => p.category))];

  const filtered = posts.filter((p) => {
    const matchSearch = !search || p.title.includes(search) || p.category.includes(search) || p.tags.some((t) => t.includes(search));
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: "حذف مقاله", message: "آیا از حذف این مقاله مطمئن هستید؟", variant: "danger" })) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("مقاله حذف شد");
  };

  const toggleStatus = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p)));
    toast.success("وضعیت تغییر کرد");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">بلاگ و اخبار</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} مقاله</p>
        </div>
        <Link to="/dashboard/blog/new" className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> مقاله جدید
        </Link>
      </div>

      {/* Toolbar */}
      <div className="clay-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="clay-input h-9 w-full pr-9 pl-3 text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="clay-input h-9 px-3 text-sm outline-none min-w-[120px]">
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="clay-input h-9 px-3 text-sm outline-none min-w-[120px]">
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-1 border rounded-xl p-0.5">
          <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}><Table2 className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-lg transition-all ${viewMode === "card" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="clay-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">#</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">عنوان</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">دسته</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">نویسنده</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">تاریخ</th>
                  <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                  <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">مقاله‌ای یافت نشد.</td></tr>
                ) : filtered.map((post, idx) => (
                  <tr key={post.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {post.image && <img src={post.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <span className="font-medium text-xs line-clamp-1 block">{post.title}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">{post.excerpt}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{post.category}</td>
                    <td className="p-3 text-xs text-muted-foreground">{post.author}</td>
                    <td className="p-3 text-xs text-muted-foreground">{formatJalaliDate(post.date)}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => toggleStatus(post.id)} className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${post.status === "published" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                        {post.status === "published" ? "منتشر" : "پیش‌نویس"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleStatus(post.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <Link to={`/dashboard/blog/edit/${post.id}`} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></Link>
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <div key={post.id} className="clay-card overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              {post.image && <div className="h-40 bg-muted overflow-hidden"><img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(post.id)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {post.status === "published" ? "منتشر" : "پیش‌نویس"}
                  </button>
                  <span className="text-[10px] text-muted-foreground">{post.category}</span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2">{post.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{post.author}</span>
                  <span>{formatJalaliDate(post.date)}</span>
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">{post.tags.map((tag) => <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{tag}</span>)}</div>
                )}
                <div className="flex gap-1 pt-1">
                  <Link to={`/dashboard/blog/edit/${post.id}`} className="text-[10px] px-2 py-1 rounded-lg border hover:bg-muted flex items-center gap-1"><Edit3 className="h-3 w-3" />ویرایش</Link>
                  <button onClick={() => handleDelete(post.id)} className="text-[10px] px-2 py-1 rounded-lg border hover:bg-rose-50 hover:text-rose-600 flex items-center gap-1"><Trash2 className="h-3 w-3" />حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="clay-card p-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">مقاله‌ای یافت نشد.</p>
        </div>
      )}
    </div>
  );
}
