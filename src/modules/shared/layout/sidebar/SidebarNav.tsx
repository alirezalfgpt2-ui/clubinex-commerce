import { Link, useLocation } from "react-router";
import { ChevronDown } from "lucide-react";
import { ICON_MAP, type SidebarGroup } from "./nav-config";

interface SidebarNavProps {
  groups: SidebarGroup[];
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
}

/** ناوبری سایدبار — گروه‌ها و آیتم‌ها */
export function SidebarNav({ groups, expandedGroups, onToggleGroup }: SidebarNavProps) {
  const location = useLocation();

  return (
    <nav
      className="flex-1 overflow-y-auto py-2 px-2"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--sb-scrollbar) var(--sb-scroll-bg)",
      }}
    >
      {groups.map((group) => {
        const isExpanded = expandedGroups[group.id] !== false;
        const hasActive = group.items.some((item) => location.pathname === item.to);

        return (
          <div key={group.id} className="mb-1">
            {/* ── عنوان گروه ── */}
            <button
              onClick={() => onToggleGroup(group.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{
                color: hasActive ? "var(--sb-active-text)" : "var(--sb-group-label)",
                borderRadius: "var(--sb-item-radius)",
              }}
            >
              <span>{group.label}</span>
              <ChevronDown
                className="h-3 w-3 transition-transform duration-200"
                style={{
                  color: "var(--sb-text-muted)",
                  transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                }}
              />
            </button>

            {/* ── آیتم‌های گروه ── */}
            {isExpanded && (
              <div
                className="mt-0.5"
                style={{ gap: "var(--sb-item-gap)", display: "flex", flexDirection: "column" }}
              >
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  const IconComp = ICON_MAP[item.icon];
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-2.5 text-[13px] transition-all duration-150"
                      style={{
                        color: isActive ? "var(--sb-active-text)" : "var(--sb-text)",
                        background: isActive ? "var(--sb-active-bg)" : "transparent",
                        fontWeight: isActive ? 600 : 400,
                        padding: "var(--sb-item-padding)",
                        borderRadius: "var(--sb-item-radius)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = "var(--sb-hover-bg)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {IconComp ? (
                        <IconComp className="h-4 w-4 shrink-0" />
                      ) : (
                        <span className="text-base">•</span>
                      )}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
