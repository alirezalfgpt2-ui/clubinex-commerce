import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Bell, Check, Trash2, Filter, Package, CreditCard, AlertTriangle, Settings, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const TYPE_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  order: { label: "سفارش", icon: <Package className="h-4 w-4" />, color: "text-blue-500 bg-blue-50" },
  payment: { label: "پرداخت", icon: <CreditCard className="h-4 w-4" />, color: "text-emerald-500 bg-emerald-50" },
  product: { label: "محصول", icon: <Package className="h-4 w-4" />, color: "text-amber-500 bg-amber-50" },
  system: { label: "سیستم", icon: <Settings className="h-4 w-4" />, color: "text-purple-500 bg-purple-50" },
  support: { label: "پشتیبانی", icon: <MessageSquare className="h-4 w-4" />, color: "text-indigo-500 bg-indigo-50" },
  inventory: { label: "موجودی", icon: <AlertTriangle className="h-4 w-4" />, color: "text-rose-500 bg-rose-50" },
};

export default function NotificationListPage() {
  const notifications = useQuery(api.notifications.list);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const [filter, setFilter] = useState<string>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = notifications?.filter((n: any) => filter === "all" || n.type === filter) || [];
  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleDelete = async (id: string) => {
    try {
      await markAsRead({ notificationId: id as any });
      toast.success("اعلان حذف شد.");
    } catch {}
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">اعلان‌ها</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} اعلان خوانده‌نشده` : `${notifications?.length || 0} اعلان`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={() => markAllAsRead()} className="clay-button flex items-center gap-2 px-4 py-2 text-sm">
              <Check className="h-4 w-4" /> همه خوانده شد
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          همه ({notifications?.length || 0})
        </button>
        {Object.entries(TYPE_MAP).map(([key, { label, color }]) => {
          const count = notifications?.filter((n: any) => n.type === key).length || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === key ? `bg-primary text-primary-foreground` : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {!notifications || notifications.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">اعلانی وجود ندارد.</p>
          <p className="text-xs text-muted-foreground mt-1">اعلان‌های جدید شما اینجا نمایش داده می‌شوند.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="clay-card p-8 text-center">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">اعلانی در این دسته‌بندی وجود ندارد.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n: any) => {
            const typeInfo = TYPE_MAP[n.type] || { label: n.type, icon: <Bell className="h-4 w-4" />, color: "text-gray-500 bg-gray-50" };
            return (
              <div
                key={n._id}
                className={`clay-card p-4 flex items-center gap-4 transition-all ${
                  !n.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
                }`}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                  {typeInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${!n.isRead ? "" : "text-muted-foreground"}`}>{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead({ notificationId: n._id })}
                      className="clay-icon h-7 w-7 flex items-center justify-center bg-muted rounded-lg hover:bg-accent transition-colors"
                      title="خواندم"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(n._id)}
                    className="clay-icon h-7 w-7 flex items-center justify-center bg-muted rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-2">حذف اعلان</h3>
            <p className="text-sm text-muted-foreground mb-4">آیا از حذف این اعلان اطمینان دارید؟</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">
                انصراف
              </button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="clay-button px-4 py-2 text-sm bg-destructive text-white hover:bg-destructive/90">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
