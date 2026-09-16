import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X } from "lucide-react";

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = "انتخاب کنید...", searchPlaceholder = "جستجو...", label }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (dropRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    calcPos();
    const recalc = () => calcPos();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [isOpen, calcPos]);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div className="relative">
      {label && <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-purple-100/60 bg-white/70 backdrop-blur px-3 py-2.5 text-sm text-right outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all dark:bg-gray-800/70 dark:border-gray-700/60 dark:text-gray-200"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{selectedLabel || placeholder}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""} text-muted-foreground`} />
      </button>

      {createPortal(
        isOpen && (
          <div
            ref={dropRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-hidden"
            dir="rtl"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border-0 pl-7 pr-7 text-xs outline-none text-foreground"
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="overflow-y-auto max-h-48 py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground text-center">نتیجه‌ای یافت نشد</p>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { onChange(option.value); setIsOpen(false); setSearch(""); }}
                    className={`w-full text-right px-3 py-2 text-sm hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors ${
                      value === option.value ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  );
}
