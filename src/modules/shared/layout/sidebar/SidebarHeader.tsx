import { Link } from "react-router";
import { useAppName } from "@/hooks/use-app-name";

/** هدر سایدبار — لوگو + نام برنامه */
export function SidebarHeader() {
  const appName = useAppName();

  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-2.5 px-4 py-3.5 transition-colors"
      style={{ borderBottom: "1px solid var(--sb-border)" }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
        style={{ background: "var(--sb-logo-bg)", color: "var(--sb-logo-text)" }}
      >
        {appName?.[0] || "C"}
      </div>
      <span className="text-sm font-bold truncate" style={{ color: "var(--sb-text)" }}>
        {appName || "Store"}
      </span>
    </Link>
  );
}
