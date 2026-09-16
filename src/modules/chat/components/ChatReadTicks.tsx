/**
 * ChatReadTicks — تیک‌های وضعیت پیام
 * ☐ ارسال شده (تیک تکی)
 * ☑☑ تحویل شده (دو تیک خاکستری)
 * ☑☑ خوانده شده (دو تیک آبی)
 */
import { Check, CheckCheck } from "lucide-react";

interface ChatReadTicksProps {
  isRead: boolean;
  readAt?: number;
  createdAt: number;
  isMine: boolean;
}

export function ChatReadTicks({ isRead, readAt, isMine }: ChatReadTicksProps) {
  if (!isMine) return null;

  return (
    <span className="inline-flex items-center gap-0.5 ml-1.5">
      {isRead ? (
        <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
      ) : (
        <Check className="h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </span>
  );
}

/**
 * UnreadDivider — خط جداکننده پیام‌های خوانده‌نشده
 */
export function UnreadDivider() {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-destructive/30" />
      <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full whitespace-nowrap">
        از اینجا به بعد خوانده نشده
      </span>
      <div className="flex-1 h-px bg-destructive/30" />
    </div>
  );
}
