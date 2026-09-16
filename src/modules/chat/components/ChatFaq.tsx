/**
 * ChatFaq — سؤالات متداول چت
 * قبل از پاسخ اپراتور، سؤالات متداول به کاربر نمایش داده می‌شود
 * از تنظیمات خوانده می‌شود و قابل ویرایش است
 */
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatFaqProps {
  onSelect?: (question: string, answer: string) => void;
}

export function ChatFaq({ onSelect }: ChatFaqProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const faqItems = useQuery(api.settings.get, { key: "chatFaqItems" });

  // پیش‌فرض اگر تنظیمات نباشد
  const items: Array<{ q: string; a: string }> =
    Array.isArray(faqItems) && faqItems.length > 0
      ? faqItems
      : [
          {
            q: "ساعت کاری پشتیبانی چقدر است?",
            a: "پشتیبانی ما از شنبه تا پنجشنبه، ساعت ۹ صبح تا ۶ عصر آماده پاسخگویی است.",
          },
          {
            q: "شرایط مرجوعی کالا چیست?",
            a: "تا ۷ روز پس از تحویل، در صورت سالم بودن کالا امکان مرجوع وجود دارد.",
          },
          {
            q: "هزینه ارسال چقدر است?",
            a: "ارسال برای سفارش‌های بالای ۵۰۰ هزار تومان رایگان است.",
          },
          {
            q: "چطور سفارش خود را پیگیری کنم?",
            a: "از بخش پیگیری سفارش با شماره سفارش یا شماره موبایل می‌توانید وضعیت را ببینید.",
          },
          {
            q: "روش‌های پرداخت کدام‌ها هستند?",
            a: "پرداخت آنلاین از درگاه‌های بانکی، کارت به کارت و پرداخت در محل (تحویل حضوری) ممکن است.",
          },
        ];

  return (
    <div className="border-t border-border bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <HelpCircle className="h-3.5 w-3.5 text-primary" />
        <p className="text-[11px] font-semibold text-muted-foreground">
          سؤالات متداول — قبل از پاسخ اپراتور
        </p>
      </div>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-background overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === idx ? null : idx)}
              className="w-full flex items-center justify-between p-2.5 text-right hover:bg-muted/50 transition-colors"
            >
              <span className="text-[11px] font-medium text-foreground flex-1 pr-1">
                {item.q}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${
                  expandedId === idx ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {expandedId === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-2.5 pb-2.5 pt-0">
                    <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-2">
                      {item.a}
                    </p>
                    {onSelect && (
                      <button
                        onClick={() => onSelect(item.q, item.a)}
                        className="flex items-center gap-1 mt-1.5 text-[10px] text-primary hover:underline"
                      >
                        <MessageSquare className="h-2.5 w-2.5" />
                        ارسال این پاسخ
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
