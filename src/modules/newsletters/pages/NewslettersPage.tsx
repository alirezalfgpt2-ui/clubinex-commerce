/**
 * 📬 صفحه مدیریت خبرنامه
 * — مشاهده لیست مشترکین خبرنامه
 * — ارسال خبرنامه جدید
 * — حذف مشترکین
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Newspaper, Trash2, Search, Loader2, Mail, Users } from "lucide-react";
import { toast } from "sonner";

export default function NewslettersPage() {
  const subscribers = useQuery(api.newsletters.list);
  const removeSubscriber = useMutation(api.newsletters.remove);
  const [search, setSearch] = useState("");

  const filtered = (subscribers ?? []).filter(
    (s: any) =>
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = (subscribers ?? []).filter((s: any) => s.isActive !== false).length;

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این مشترک مطمئن هستید؟")) return;
    try {
      await removeSubscriber({ id: id as any });
      toast.success("مشترک با موفقیت حذف شد");
    } catch (e: any) {
      toast.error(e?.message ?? "خطا در حذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">خبرنامه</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            مدیریت مشترکین و ارسال خبرنامه
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="clay-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">کل مشترکین</p>
            <p className="text-lg font-bold">{subscribers?.length ?? 0}</p>
          </div>
        </div>
        <div className="clay-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">مشترکین فعال</p>
            <p className="text-lg font-bold">{activeCount}</p>
          </div>
        </div>
        <div className="clay-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">مشترکین غیرفعال</p>
            <p className="text-lg font-bold">{(subscribers?.length ?? 0) - activeCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="clay-card p-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی ایمیل یا نام..."
            className="clay-input w-full pl-9 pr-3 h-9 text-sm"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      {!subscribers ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">مشترکی یافت نشد.</p>
          <p className="text-xs text-muted-foreground mt-1">مشترکین خبرنامه از طریق فرم سایت اضافه می‌شوند.</p>
        </div>
      ) : (
        <div className="clay-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">ایمیل</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">نام</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">تاریخ عضویت</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s._id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-xs" dir="ltr">{s.email}</td>
                  <td className="p-3 text-xs">{s.name || "—"}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.isActive !== false ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString("fa-IR") : "—"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      title="حذف مشترک"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
