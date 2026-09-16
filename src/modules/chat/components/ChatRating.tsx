/**
 * ChatRating — نظرسنجی رضایت با ایمیوجی
 * بعد از خاتمه چت توسط اپراتور، به کاربر نمایش داده می‌شود
 */
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Star, X, MessageSquareHeart } from "lucide-react";

interface ChatRatingProps {
  chatId: string;
  sessionId: string;
  guestName: string;
  guestEmail?: string;
  onRated?: () => void;
}

const EMOJIS = [
  { value: 1, emoji: "😡", label: "خیلی بد", color: "text-red-500" },
  { value: 2, emoji: "😟", label: "بد", color: "text-orange-500" },
  { value: 3, emoji: "😐", label: "معمولی", color: "text-yellow-500" },
  { value: 4, emoji: "😊", label: "خوب", color: "text-lime-500" },
  { value: 5, emoji: "😍", label: "عالی", color: "text-emerald-500" },
];

export function ChatRating({
  chatId,
  sessionId,
  guestName,
  guestEmail,
  onRated,
}: ChatRatingProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRating = useMutation(api.messages.submitRating);

  const handleSubmit = async () => {
    if (!selected) {
      toast.error("لطفاً یک امتیاز انتخاب کنید.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitRating({
        chatId,
        sessionId,
        rating: selected,
        feedback: feedback.trim() || undefined,
        guestName,
        guestEmail,
      });
      setSubmitted(true);
      onRated?.();
    } catch (e: any) {
      toast.error(e.message || "خطا در ارسال نظر.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-6 px-4"
      >
        <div className="text-4xl mb-2">🙏</div>
        <p className="text-sm font-bold text-foreground">ممنون از نظر شما!</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          نظر شما به بهبود خدمات کمک می‌کند.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t bg-muted/30 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareHeart className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">
          از مکالمه با ما راضی بودید?
        </p>
      </div>

      {/* ایمیوجی‌ها */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {EMOJIS.map((item) => (
          <button
            key={item.value}
            onClick={() => setSelected(item.value)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              selected === item.value
                ? "bg-primary/10 ring-2 ring-primary scale-110"
                : "hover:bg-muted"
            }`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className={`text-[9px] mt-0.5 font-medium ${
              selected === item.value ? "text-primary" : "text-muted-foreground"
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* فیلد نظر */}
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="نظر یا پیشنهاد شما (اختیاری)..."
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition-colors resize-none min-h-[60px] mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={!selected || isSubmitting}
        className="w-full rounded-xl bg-primary text-primary-foreground py-2 text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "در حال ارسال..." : "ارسال نظر"}
      </button>
    </motion.div>
  );
}
