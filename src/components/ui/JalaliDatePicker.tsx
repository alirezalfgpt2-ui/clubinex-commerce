/**
 * JalaliDatePicker — فیلد تاریخ شمسی
 * Portal + موقعیت هوشمند + طراحی پاستیلی شیشه‌ای
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gregorianToJalali, jalaliToGregorian, JALALI_MONTHS_FA } from "@/lib/jalali";

interface JalaliDatePickerProps {
  value?: string;
  onChange: (jalaliStr: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return ((jy + 12) % 33) % 4 === 1 ? 30 : 29;
}

function getFirstDayOfWeek(jy: number, jm: number): number {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
  const d = new Date(gy, gm - 1, gd).getDay();
  return d === 6 ? 0 : d + 1;
}

export function JalaliDatePicker({ value, onChange, placeholder = "انتخاب تاریخ", className = "", disabled = false, label }: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const now = new Date();
  const todayJalali = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const parseValue = (v?: string) => {
    if (!v) return { jy: todayJalali[0], jm: todayJalali[1], jd: todayJalali[2] };
    const parts = v.split("/");
    if (parts.length === 3) {
      return { jy: parseInt(parts[0]) || todayJalali[0], jm: parseInt(parts[1]) || todayJalali[1], jd: parseInt(parts[2]) || todayJalali[2] };
    }
    return { jy: todayJalali[0], jm: todayJalali[1], jd: todayJalali[2] };
  };

  const initial = parseValue(value);
  const [viewYear, setViewYear] = useState(initial.jy);
  const [viewMonth, setViewMonth] = useState(initial.jm);
  const [selectedDay, setSelectedDay] = useState<number | null>(initial.jd || null);

  const CAL_W = isMobile ? 260 : 280;
  const CAL_H = isMobile ? 300 : 320;

  const calcPos = useCallback(() => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    const r = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top: number, left: number;
    if (isMobile) {
      top = Math.max(10, (vh - CAL_H) / 2);
      left = Math.max(10, (vw - CAL_W) / 2);
    } else {
      const spaceBelow = vh - r.bottom - 8;
      const spaceAbove = r.top - 8;
      if (spaceBelow >= CAL_H) top = r.bottom + 4;
      else if (spaceAbove >= CAL_H) top = r.top - CAL_H - 4;
      else top = Math.max(10, (vh - CAL_H) / 2);
      left = r.left;
      if (left + CAL_W > vw - 10) left = vw - CAL_W - 10;
      if (left < 10) left = 10;
    }
    return { top, left };
  }, [isMobile]);

  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open) {
      setPos(calcPos());
      const update = () => setPos(calcPos());
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }
  }, [open, calcPos]);

  // بستن با کلیک بیرون — هم wrapper و هم portal را بررسی کن
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as Node;
        const inWrapper = wrapperRef.current?.contains(target);
        const inPortal = portalRef.current?.contains(target);
        if (!inWrapper && !inPortal) setOpen(false);
      };
      document.addEventListener("mousedown", handleMouseDown);
      return () => document.removeEventListener("mousedown", handleMouseDown);
    }, 50);
    return () => clearTimeout(t);
  }, [open]);

  const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const handleSelect = (day: number) => {
    setSelectedDay(day);
    const dateStr = `${viewYear}/${String(viewMonth).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const displayText = value || "";

  const calendarDropdown = open ? createPortal(
    <div ref={portalRef}>
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 99999 }}
        className="rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-purple-100/40 rounded-2xl" style={{ width: CAL_W }}>
          {/* هدر */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-50/80 to-pink-50/60 border-b border-purple-100/40">
            <button type="button" onMouseDown={(e) => { e.preventDefault(); prevMonth(); }} className="p-1 rounded-lg hover:bg-purple-100/60 transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-purple-500" />
            </button>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{JALALI_MONTHS_FA[viewMonth - 1]} {viewYear}</p>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); nextMonth(); }} className="p-1 rounded-lg hover:bg-purple-100/60 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 text-purple-500" />
            </button>
          </div>

          {/* هفته‌ها */}
          <div className="grid grid-cols-7 gap-0 px-2 pt-1.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[9px] font-semibold text-purple-400/70 py-0.5">{d}</div>
            ))}
          </div>

          {/* روزها */}
          <div className="grid grid-cols-7 gap-0 p-1.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === todayJalali[2] && viewMonth === todayJalali[1] && viewYear === todayJalali[0];
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(day); }}
                  className={`flex items-center justify-center h-7 ${isMobile ? "w-7" : "w-8"} rounded-lg text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm"
                      : isToday
                        ? "bg-purple-100/80 text-purple-600 font-bold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50/80"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* امروز */}
          <div className="border-t border-purple-100/40 p-1.5">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const [jy, jm, jd] = todayJalali;
                setViewYear(jy); setViewMonth(jm); setSelectedDay(jd);
                onChange(`${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`);
                setOpen(false);
              }}
              className="w-full py-1 text-[10px] text-purple-500 font-semibold hover:bg-purple-50/60 rounded-lg transition-colors"
            >
              امروز
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-full flex items-center gap-2 rounded-xl border border-purple-100/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3 py-2 text-xs text-right outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all disabled:opacity-50"
      >
        <Calendar className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <span className={displayText ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}>
          {displayText || placeholder}
        </span>
        {displayText && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); setSelectedDay(null); }}
            className="mr-auto p-0.5 rounded hover:bg-purple-50">
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </button>
      {calendarDropdown}
    </div>
  );
}

interface JalaliDateRangeProps {
  from?: string;
  to?: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  className?: string;
}

export function JalaliDateRange({ from, to, onFromChange, onToChange, className = "" }: JalaliDateRangeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <JalaliDatePicker value={from} onChange={onFromChange} placeholder="از تاریخ" className="flex-1" />
      <span className="text-purple-300 text-[10px]">تا</span>
      <JalaliDatePicker value={to} onChange={onToChange} placeholder="تا تاریخ" className="flex-1" />
      {(from || to) && (
        <button onClick={() => { onFromChange(""); onToChange(""); }} className="text-[9px] text-red-400 hover:text-red-500 hover:underline shrink-0">
          پاک کردن
        </button>
      )}
    </div>
  );
}
