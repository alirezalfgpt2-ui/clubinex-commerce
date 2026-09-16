import { Search as SearchIcon } from "lucide-react";

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/** فیلد جستجوی سایدبار */
export function SidebarSearch({ value, onChange }: SidebarSearchProps) {
  return (
    <div className="px-3 py-2.5">
      <div className="relative">
        <SearchIcon
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
          style={{ color: "var(--sb-text-muted)" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="جستجو..."
          className="h-8 w-full pr-7 pl-3 text-xs outline-none transition-colors"
          style={{
            background: "var(--sb-search-bg)",
            color: "var(--sb-search-text)",
            borderRadius: "var(--sb-item-radius)",
          }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--sb-text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
