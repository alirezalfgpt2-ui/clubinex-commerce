import { Link } from "react-router";
import { useAuth } from "@/hooks/use-auth";

/** بخش پروفایل کاربر در سایدبار */
export function SidebarUser() {
  const { user } = useAuth();
  const userInitial = user?.name?.[0] || user?.email?.[0] || "ک";

  return (
    <Link
      to="/dashboard/profile"
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{ borderBottom: "1px solid var(--sb-border)" }}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name || ""} className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "var(--sb-logo-bg)", color: "var(--sb-logo-text)" }}
        >
          {userInitial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--sb-text)" }}>
          {user?.name || "کاربر"}
        </p>
        <p className="text-[11px] truncate" style={{ color: "var(--sb-text-muted)" }}>
          {user?.email || ""}
        </p>
      </div>
    </Link>
  );
}
