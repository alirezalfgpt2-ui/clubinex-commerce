import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isoToJalali, jalaliToIso, MONTH_NAMES_FA, daysInJalaliMonth } from "@/lib/jalali";

interface JalaliDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DAY_NAMES_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function getFirstDayOfWeekJalali(jy: number, jm: number): number {
  const isoDate = jalaliToIso(jy, jm, 1);
  const [gy, gm, gd] = isoDate.split("-").map(Number);
  const d = new Date(gy, gm - 1, gd);
  return (d.getDay() + 1) % 7;
}

/** Jalali date string "1403-05-15" → formatted "۱۵ مرداد ۱۴۰۳" */
function formatDisplay(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return "";
  return `${parts[2]} ${MONTH_NAMES_FA[parts[1]]} ${parts[0]}`;
}

export function JalaliDatePicker({ value, onChange, label, placeholder, className, disabled }: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, placeAbove: false });

  const jalaliStr = value ? isoToJalali(value) : "";
  const parts = jalaliStr ? jalaliStr.split("-").map(Number) : [1404, 1, 1];
  const [viewYear, setViewYear] = useState(parts[0]);
  const [viewMonth, setViewMonth] = useState(parts[1]);
  const selectedDay = parts.length >= 3 ? parts[2] : 0;

  useEffect(() => {
    if (jalaliStr) {
      const [y, m] = jalaliStr.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m);
    }
  }, [jalaliStr]);

  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const calH = 340;
    const calW = 280;
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const placeAbove = spaceBelow < calH && spaceAbove > spaceBelow;
    let top = placeAbove ? r.top - calH - 4 : r.bottom + 4;
    let left = r.left;
    // RTL: align right edge of calendar to right edge of button
    if (left + calW > window.innerWidth - 8) left = window.innerWidth - calW - 8;
    if (left < 8) left = 8;
    if (top < 8) top = 8;
    if (top + calH > window.innerHeight - 8) top = window.innerHeight - calH - 8;
    setPos({ top, left, placeAbove });
  }, []);

  // Close on outside click (portal-safe)
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      if (calRef.current?.contains(target)) return;
      if (btnRef.current?.contains(target)) return;
      setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handle), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handle); };
  }, [open]);

  // Recalc on scroll/resize
  useEffect(() => {
    if (!open) return;
    calcPos();
    const recalc = () => calcPos();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [open, calcPos]);

  const handleSelectDay = (day: number) => {
    const isoDate = jalaliToIso(viewYear, viewMonth, day);
    onChange(isoDate);
    setOpen(false);
  };

  const daysInMonth = daysInJalaliMonth(viewYear, viewMonth);
  const startOfWeek = getFirstDayOfWeekJalali(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const displayText = jalaliStr ? formatDisplay(jalaliStr) : (placeholder || "انتخاب تاریخ");

  return (
    <div className={`relative ${className || ""}`}>
      {label && <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>}
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(!open); }}
        className="w-full flex items-center gap-2 rounded-xl border border-purple-100/60 bg-white/70 backdrop-blur px-3 py-2.5 text-sm text-right outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all disabled:opacity-50"
      >
        <CalendarDays className="h-4 w-4 text-purple-400 shrink-0" />
        <span className={jalaliStr ? "text-foreground" : "text-muted-foreground"}>{displayText}</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={calRef}
              initial={{ opacity: 0, scale: 0.97, y: pos.placeAbove ? 8 : -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 99999 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-100/40 p-3 sm:p-4 w-[260px] sm:w-[280px]"
              dir="rtl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-purple-50 transition-colors">
                  <ChevronRight className="h-4 w-4 text-purple-500" />
                </button>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  {MONTH_NAMES_FA[viewMonth]} {viewYear.toLocaleString("fa-IR")}
                </span>
                <button type="button" onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-purple-50 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-purple-500" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-purple-400/70 mb-1">
                {DAY_NAMES_SHORT.map((d) => (
                  <div key={d} className="py-1 font-medium">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: startOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = jalaliStr === isoToJalali(new Date().toISOString().split("T")[0]);
                  const isSelected = jalaliStr && day === selectedDay;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
                          : isToday && day === selectedDay
                          ? "bg-purple-100/80 text-purple-700"
                          : "hover:bg-purple-50 text-foreground"
                      }`}
                    >
                      {day.toLocaleString("fa-IR")}
                    </button>
                  );
                })}
              </div>

              {/* Today button */}
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  onChange(today);
                  setOpen(false);
                }}
                className="w-full mt-3 py-1.5 text-xs font-medium text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
              >
                امروز
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
