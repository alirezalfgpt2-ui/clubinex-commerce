import { useState, useEffect, useMemo } from "react";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarUser } from "./sidebar/SidebarUser";
import { SidebarSearch } from "./sidebar/SidebarSearch";
import { SidebarNav } from "./sidebar/SidebarNav";
import { NAV_GROUPS, STORAGE_KEY } from "./sidebar/nav-config";
import { applySidebarTheme, getCurrentSidebarTheme } from "@/config/sidebar-themes";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * سایدبار اصلی پنل مدیریت
 * — از کامپوننت‌های کوچک‌تر تشکیل شده
 * — تم سایدبار یکبار در mount اعمال می‌شود (بدون polling)
 */
export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  // اعمال تم سایدبار فقط یکبار در mount
  useEffect(() => {
    applySidebarTheme(getCurrentSidebarTheme());
  }, []);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    const defaults: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => (defaults[g.id] = true));
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS;
    const q = searchQuery.toLowerCase();
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.to.toLowerCase().includes(q)
      ),
    })).filter((group) => group.items.length > 0);
  }, [searchQuery]);

  return (
    <aside
      className="h-full border-l flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: "var(--sb-bg)",
        color: "var(--sb-text)",
        borderLeftColor: "var(--sb-border)",
        width: isOpen ? "16rem" : "0",
        borderLeftWidth: isOpen ? "1px" : "0",
      }}
    >
      <div className={`min-w-[16rem] h-full flex flex-col ${isOpen ? "" : "invisible"}`}>
        <SidebarHeader />
        <SidebarUser />
        <SidebarSearch value={searchQuery} onChange={setSearchQuery} />
        <SidebarNav
          groups={filteredGroups}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
        />
      </div>
    </aside>
  );
}
