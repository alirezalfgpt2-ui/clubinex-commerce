/**
 * ChatDateSeparator — جداکننده تاریخ در چت
 * نمایش زیبای تاریخ شمسی بین گروه‌های پیام
 */
import { formatJalaliFull, formatJalaliDate } from "@/lib/jalali";

interface ChatDateSeparatorProps {
  timestamp: number;
}

export function ChatDateSeparator({ timestamp }: ChatDateSeparatorProps) {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (d.toDateString() === today.toDateString()) {
    label = "امروز";
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = "دیروز";
  } else {
    label = formatJalaliFull(d);
  }

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] text-muted-foreground bg-background border border-border px-3 py-1 rounded-full font-medium whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/**
 * فرمت ساعت دقیق فارسی
 */
export function formatExactTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * فرمت تاریخ + ساعت فارسی
 */
export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const datePart = formatJalaliDate(d);
  const timePart = d.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} • ${timePart}`;
}

/**
 * آیا دو تایم‌استمپ در روزهای مختلف هستند؟
 */
export function isDifferentDay(ts1: number, ts2: number): boolean {
  return new Date(ts1).toDateString() !== new Date(ts2).toDateString();
}
