/**
 * LiveChatWidget — ویجت چت زنده شناور
 * طراحی پاستیلی، مدرن و فوق حرفه‌ای
 */
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  MessageSquare, Send, X, Phone, User, Check, CheckCheck,
  Star, ChevronDown, HelpCircle, RotateCcw, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

async function getVisitorIP(): Promise<string> {
  try { const res = await fetch("https://api.ipify.org?format=json"); const data = await res.json(); return data.ip || ""; }
  catch { return ""; }
}

function fmtTime(ts: number) { return new Date(ts).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }); }
function isDiffDay(a: number, b: number) { return new Date(a).toDateString() !== new Date(b).toDateString(); }

function DateSep({ timestamp }: { timestamp: number }) {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  let label: string;
  if (d.toDateString() === today.toDateString()) label = "امروز";
  else if (d.toDateString() === yesterday.toDateString()) label = "دیروز";
  else label = d.toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="flex items-center gap-2 my-2 px-2">
      <span className="text-[9px] text-purple-400 bg-purple-50/80 border border-purple-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0">{label}</span>
    </div>
  );
}

const FALLBACK_FAQ = [
  { q: "ساعت کاری پشتیبانی چقدر است?", a: "پشتیبانی ما از شنبه تا پنجشنبه، ساعت ۹ صبح تا ۶ عصر آماده پاسخگویی است." },
  { q: "شرایط مرجوعی کالا چیست?", a: "تا ۷ روز پس از تحویل، در صورت سالم بودن کالا امکان مرجوع وجود دارد." },
  { q: "هزینه ارسال چقدر است?", a: "ارسال برای سفارش‌های بالای ۵۰۰ هزار تومان رایگان است." },
  { q: "چطور سفارش خود را پیگیری کنم?", a: "از بخش پیگیری سفارش با شماره سفارش یا شماره موبایل می‌توانید وضعیت را ببینید." },
];

/** نظرسنجی */
function RatingWidget({ chatId, sessionId, guestName, guestEmail, onDone }: { chatId: string; sessionId: string; guestName: string; guestEmail?: string; onDone?: () => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const [fb, setFb] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = useMutation(api.messages.submitRating);
  const EMOJIS = [
    { v: 1, e: "😡", l: "خیلی بد", color: "from-red-400 to-rose-400" },
    { v: 2, e: "😟", l: "بد", color: "from-orange-400 to-amber-400" },
    { v: 3, e: "😐", l: "معمولی", color: "from-yellow-400 to-amber-300" },
    { v: 4, e: "😊", l: "خوب", color: "from-emerald-400 to-teal-400" },
    { v: 5, e: "😍", l: "عالی", color: "from-purple-400 to-pink-400" },
  ];
  const handleSubmit = async () => {
    if (!sel) { toast.error("لطفاً یک امتیاز انتخاب کنید."); return; }
    setLoading(true);
    try { await submit({ chatId, sessionId, rating: sel, feedback: fb.trim() || undefined, guestName, guestEmail }); setDone(true); onDone?.(); }
    catch (e: any) { toast.error(e.message || "خطا"); }
    finally { setLoading(false); }
  };
  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 px-4 bg-gradient-to-b from-emerald-50/80 to-teal-50/60">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }} className="text-4xl mb-3">🙏</motion.div>
      <p className="text-sm font-bold text-gray-800">ممنون از نظر شما!</p>
      <p className="text-[11px] text-gray-500 mt-1">نظر شما به بهبود خدمات کمک می‌کند.</p>
    </motion.div>
  );
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-t border-purple-100 bg-gradient-to-b from-purple-50/50 to-pink-50/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400">
          <Star className="h-3 w-3 text-white" />
        </div>
        <p className="text-xs font-semibold text-gray-700">از مکالمه راضی بودید?</p>
      </div>
      <div className="flex justify-center gap-1.5 mb-3">
        {EMOJIS.map((i) => (
          <motion.button
            key={i.v}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSel(i.v)}
            className={`flex flex-col items-center p-2 rounded-2xl transition-all ${
              sel === i.v
                ? `bg-gradient-to-b ${i.color} shadow-md ring-2 ring-white scale-110`
                : "bg-white/60 hover:bg-white/80 shadow-sm"
            }`}
          >
            <span className={`text-2xl ${sel === i.v ? "" : "grayscale-[30%]"}`}>{i.e}</span>
            <span className={`text-[9px] mt-0.5 ${sel === i.v ? "text-white font-semibold" : "text-gray-500"}`}>{i.l}</span>
          </motion.button>
        ))}
      </div>
      <textarea value={fb} onChange={(e) => setFb(e.target.value)} placeholder="نظر شما (اختیاری)..."
        className="w-full rounded-2xl border border-purple-100 bg-white/70 px-3 py-2 text-xs outline-none min-h-[50px] mb-3 focus:border-purple-300 transition-colors" />
      <button onClick={handleSubmit} disabled={!sel || loading}
        className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 shadow-sm">
        {loading ? "در حال ارسال..." : "ارسال نظر"}
      </button>
    </motion.div>
  );
}

/** FAQ */
function FaqSection() {
  const [exp, setExp] = useState<number | null>(null);
  const faqVal = useQuery(api.settings.get, { key: "chatFaqItems" });
  const items: Array<{ q: string; a: string }> = Array.isArray(faqVal) && faqVal.length > 0 ? faqVal : FALLBACK_FAQ;
  return (
    <div className="border-t border-purple-100/60 bg-gradient-to-b from-purple-50/30 to-transparent p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
        <p className="text-[11px] font-semibold text-purple-500/70">سؤالات متداول</p>
      </div>
      <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-purple-100/60 bg-white/60 overflow-hidden backdrop-blur-sm">
            <button onClick={() => setExp(exp === i ? null : i)} className="w-full flex items-center justify-between p-2.5 text-right hover:bg-purple-50/50 transition-colors">
              <span className="text-[11px] font-medium text-gray-600 flex-1 pr-1">{item.q}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-purple-300 transition-transform shrink-0 ${exp === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {exp === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="px-2.5 pb-2.5 text-[11px] text-gray-500 bg-gradient-to-b from-purple-50/40 to-transparent rounded-b-2xl mx-1.5 mb-1.5 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [visitorIP, setVisitorIP] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useMutation(api.messages.sendGuest);
  const markAsRead = useMutation(api.messages.markAsRead);

  // خواندن رنگ چت از تنظیمات
  const chatThemeVal = useQuery(api.settings.get, { key: "chatTheme" });
  const chatTheme: Record<string, string> = (chatThemeVal && typeof chatThemeVal === "object" && !Array.isArray(chatThemeVal))
    ? chatThemeVal as Record<string, string>
    : {};
  const chatBg = chatTheme.background || "";
  const chatHeaderBg = chatTheme.headerBg || "";

  const sessionId = useRef(
    typeof window !== "undefined"
      ? localStorage.getItem("chat-session-id") ||
          (() => { const id = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; localStorage.setItem("chat-session-id", id); return id; })()
      : "guest-init"
  );

  useEffect(() => {
    const s = localStorage.getItem("chat-guest-name");
    const p = localStorage.getItem("chat-guest-phone");
    const e = localStorage.getItem("chat-guest-email");
    if (s) setName(s); if (p) setPhone(p); if (e) setEmail(e);
  }, []);

  useEffect(() => { getVisitorIP().then(setVisitorIP); }, []);

  const messages = useQuery(api.messages.listBySession, started ? { sessionId: sessionId.current } : "skip");
  const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;
  const chatEnded = !!lastMsg?.chatEnded;
  const chatId = messages?.[0]?.chatId;
  const chatRating = useQuery(api.messages.getChatRating, chatId ? { chatId } : "skip");

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages?.length]);

  // علامت خوانده شدن — فقط پیام‌های ادمین
  useEffect(() => {
    if (started && chatId && messages && messages.length > 0) {
      const hasUnreadAdmin = messages.some((m: any) => m.receiverId === sessionId.current && !m.isRead);
      if (hasUnreadAdmin) { markAsRead({ chatId }).catch(() => {}); }
    }
  }, [started, chatId, messages?.length]);

  // ریست خودکار بعد از امتیازدهی
  useEffect(() => {
    if (started && chatEnded && chatRating) {
      const timer = setTimeout(() => {
        setStarted(false); setHasRated(false);
        const newId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem("chat-session-id", newId);
        sessionId.current = newId;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [started, chatEnded, chatRating]);

  const handleStart = () => {
    if (!name.trim()) { toast.error("لطفاً نام خود را وارد کنید."); return; }
    localStorage.setItem("chat-guest-name", name.trim());
    if (phone.trim()) localStorage.setItem("chat-guest-phone", phone.trim());
    if (email.trim()) localStorage.setItem("chat-guest-email", email.trim());
    setStarted(true); setHasRated(false);
  };

  const handleStartNewChat = () => {
    const newId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("chat-session-id", newId);
    sessionId.current = newId;
    setStarted(true); setHasRated(false);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage({ sessionId: sessionId.current, body: message.trim(), senderName: name.trim(), senderEmail: email.trim() || undefined, senderPhone: phone.trim() || undefined, ipAddress: visitorIP || undefined });
      setMessage("");
    } catch { toast.error("خطا در ارسال پیام."); }
  };

  const headerStyle: React.CSSProperties = chatHeaderBg
    ? { background: chatHeaderBg }
    : { background: "linear-gradient(135deg, #a78bfa 0%, #c084fc 30%, #e879f9 60%, #f472b6 100%)" };

  return (
    <>
      {/* دکمه شناور */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.5)] transition-shadow"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ویجت چت */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-[0_8px_40px_rgba(139,92,246,0.2)] border border-white/60 overflow-hidden flex flex-col bg-white/95 backdrop-blur-xl"
            style={{ height: "540px" }}
          >
            {/* هدر */}
            <div className="p-4 flex items-center justify-between text-white shrink-0" style={headerStyle}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">پشتیبانی زنده</p>
                  <p className="text-[10px] text-white/70">{chatEnded ? "گفتگو خاتمه یافته" : started ? `${name} عزیز` : "آنلاین و آماده"}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white/20 transition-colors"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* فرم شروع */}
              {!started ? (
                <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-gradient-to-b from-purple-50/30 to-white">
                  <div className="text-center mb-4">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="h-16 w-16 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <MessageSquare className="h-7 w-7 text-purple-500" />
                    </motion.div>
                    <h3 className="font-bold text-gray-800 text-sm">شروع مکالمه</h3>
                    <p className="text-[11px] text-gray-400 mt-1">اطلاعات خود را وارد کنید تا متصل شوید.</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1.5 block font-semibold">نام و نام خانوادگی *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: علی رضایی"
                      className="w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1.5 block font-semibold">شماره تلفن *</label>
                    <div className="relative">
                      <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" dir="ltr"
                        className="w-full rounded-2xl border border-purple-100 bg-white pr-11 pl-4 py-3 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1.5 block font-semibold">ایمیل (اختیاری)</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr"
                      className="w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart} disabled={!name.trim() || !phone.trim()}
                    className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white py-3 text-sm font-bold hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 shadow-[0_2px_12px_rgba(139,92,246,0.3)]"
                  >
                    شروع چت
                  </motion.button>
                </div>
              ) : (
                <>
                  {!chatEnded && messages && messages.length <= 2 && <FaqSection />}

                  {/* پیام‌ها */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1.5 min-h-0 bg-gradient-to-b from-purple-50/20 via-white to-pink-50/10">
                    {/* پیام خوش‌آمد */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-2">
                      <div className="max-w-[80%] bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl rounded-br-md p-3 border border-purple-100/60 shadow-sm">
                        <p className="text-xs text-gray-600 leading-relaxed">سلام {name}! 👋<br />خوش آمدید. چطور می‌توانیم کمکتان کنیم?</p>
                        <p className="text-[10px] text-purple-300 mt-1">{fmtTime(Date.now())}</p>
                      </div>
                    </motion.div>

                    {messages?.map((msg: any, idx: number) => {
                      const isGuest = msg.senderId === sessionId.current;
                      const isSys = msg.chatEnded;
                      const prev = idx > 0 ? messages[idx - 1] : null;
                      const showDate = !prev || isDiffDay(prev.createdAt, msg.createdAt);

                      if (isSys) return (
                        <div key={msg._id} className="flex justify-center my-3">
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 text-[11px] px-4 py-2 rounded-full border border-amber-100 shadow-sm">{msg.body}</div>
                        </div>
                      );

                      return (
                        <div key={msg._id}>
                          {showDate && <DateSep timestamp={msg.createdAt} />}
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isGuest ? "justify-end" : "justify-start"} mb-1`}
                          >
                            <div className="max-w-[80%]">
                              {!isGuest && (
                                <p className="text-[10px] text-purple-400 mb-0.5 flex items-center gap-1 font-medium">
                                  <User className="h-2.5 w-2.5" /> اپراتور
                                </p>
                              )}
                              <div className={`p-2.5 rounded-2xl ${
                                isGuest
                                  ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-br-md shadow-sm"
                                  : "bg-white border border-gray-100 rounded-bl-md shadow-sm"
                              }`}>
                                <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                                <div className={`text-[10px] mt-1 flex items-center gap-1 ${isGuest ? "text-white/60 justify-end" : "text-gray-400"}`}>
                                  {fmtTime(msg.createdAt)}
                                  {isGuest && (msg.isRead ? <CheckCheck className="h-3 w-3 text-blue-200" /> : <Check className="h-3 w-3 text-white/40" />)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* نظرسنجی */}
                  {chatEnded && chatId && !chatRating && !hasRated && (
                    <RatingWidget chatId={chatId} sessionId={sessionId.current} guestName={name} guestEmail={email || undefined} onDone={() => setHasRated(true)} />
                  )}

                  {/* نظر ثبت‌شده + چت جدید */}
                  {chatEnded && (chatRating || hasRated) && (
                    <div className="border-t border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-teal-50/40 p-3">
                      <div className="text-center mb-2">
                        <p className="text-[11px] text-emerald-600 font-medium">نظر شما ثبت شد: {["⭐","⭐⭐","⭐⭐⭐","⭐⭐⭐⭐","⭐⭐⭐⭐⭐"][(chatRating?.rating || 4) - 1]}</p>
                      </div>
                      <button onClick={handleStartNewChat}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white py-2.5 text-xs font-semibold hover:from-violet-600 hover:to-purple-600 transition-all shadow-sm">
                        <RotateCcw className="h-3.5 w-3.5" /> شروع چت جدید
                      </button>
                    </div>
                  )}

                  {/* ورودی پیام */}
                  {!chatEnded && (
                    <div className="border-t border-purple-100/40 p-3 bg-white/90 backdrop-blur-sm shrink-0">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                          <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            placeholder="پیام خود را بنویسید..."
                            className="w-full rounded-2xl border border-purple-100 bg-purple-50/30 px-4 py-3 text-sm outline-none focus:border-purple-300 focus:bg-white transition-all placeholder:text-purple-300/60"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSend} disabled={!message.trim()}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-[0_2px_10px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_16px_rgba(139,92,246,0.4)] transition-all disabled:opacity-40 shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
