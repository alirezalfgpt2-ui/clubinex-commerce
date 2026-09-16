import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare, Search, Send, User, Ticket, Paperclip, Circle,
  Phone, Mail, Globe, Clock, Trash2, StopCircle, Star, X,
  Filter, CheckSquare, Square, Archive, Inbox, AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ChatReadTicks, UnreadDivider } from "../components/ChatReadTicks";
import { ChatDateSeparator, formatExactTime, isDifferentDay } from "../components/ChatDateSeparator";
import { JalaliDatePicker } from "@/components/ui/JalaliDatePicker";
import { parseJalaliString } from "@/lib/jalali";

type FilterTab = "all" | "unread" | "active" | "ended";

export default function ChatPage() {
  const { user } = useAuth();
  const chatList = useQuery(api.messages.listAll);
  const sendMessage = useMutation(api.messages.send);
  const markRead = useMutation(api.messages.markRead);
  const endChat = useMutation(api.messages.endChat);
  const deleteChat = useMutation(api.messages.deleteChat);
  const createTicket = useMutation(api.tickets.create);

  const confirmDialog = useConfirm();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const currentChat = chatList?.find((c: any) => c.chatId === selectedChat);
  const chatMessages = useQuery(
    api.messages.listByChatId,
    selectedChat ? { chatId: selectedChat } : "skip"
  );

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages?.length]);

  useEffect(() => {
    if (selectedChat && chatMessages && user?._id) {
      chatMessages
        .filter((m: any) => m.receiverId === user._id && !m.isRead)
        .forEach((m: any) => markRead({ messageId: m._id }).catch(() => {}));
    }
  }, [selectedChat, chatMessages, user?._id]);

  // ── فیلتر هوشمند چت‌ها ──
  const filteredChats = useMemo(() => {
    if (!chatList) return [];
    return chatList.filter((c: any) => {
      // فیلتر تب
      if (activeTab === "unread" && c.unread === 0) return false;
      if (activeTab === "active" && c.isEnded) return false;
      if (activeTab === "ended" && !c.isEnded) return false;
      // فیلتر جستجو
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!c.guestName?.toLowerCase().includes(s) && !c.guestEmail?.toLowerCase().includes(s) &&
            !c.guestPhone?.includes(s) && !c.ipAddress?.includes(s)) return false;
      }
      // فیلتر تاریخ شمسی
      if (dateFrom) {
        const d = parseJalaliString(dateFrom);
        if (d && c.lastMessage?.createdAt < d.getTime()) return false;
      }
      if (dateTo) {
        const d = parseJalaliString(dateTo);
        if (d && c.lastMessage?.createdAt > d.getTime() + 86400000) return false;
      }
      return true;
    });
  }, [chatList, activeTab, search, dateFrom, dateTo]);

  // آمار تب‌ها
  const tabCounts = useMemo(() => {
    if (!chatList) return { all: 0, unread: 0, active: 0, ended: 0 };
    return {
      all: chatList.length,
      unread: chatList.filter((c: any) => c.unread > 0).length,
      active: chatList.filter((c: any) => !c.isEnded).length,
      ended: chatList.filter((c: any) => c.isEnded).length,
    };
  }, [chatList]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      const attachments = attachmentUrl ? [attachmentUrl] : undefined;
      await sendMessage({ receiverId: selectedChat, body: newMessage.trim(), chatId: selectedChat, attachments });
      setNewMessage(""); setAttachmentUrl("");
    } catch { toast.error("خطا در ارسال پیام."); }
  };

  const handleEndChat = async (chatId?: string) => {
    const cid = chatId || selectedChat;
    if (!cid || !await confirmDialog({ title: "خاتمه گفتگو", message: "آیا از خاتمه این گفتگو اطمینان دارید؟", variant: "warning" })) return;
    try { await endChat({ chatId: cid }); toast.success("گفتگو خاتمه یافت."); }
    catch { toast.error("خطا در خاتمه گفتگو."); }
  };

  const handleDeleteChat = async (chatId?: string) => {
    const cid = chatId || selectedChat;
    if (!cid || !await confirmDialog({ title: "حذف گفتگو", message: "⚠️ تمام پیام‌ها حذف خواهد شد. آیا مطمئنید؟", variant: "danger" })) return;
    try {
      await deleteChat({ chatId: cid });
      if (cid === selectedChat) setSelectedChat(null);
      toast.success("گفتگو حذف شد.");
    } catch { toast.error("خطا در حذف."); }
  };

  // ── حذف گروهی ──
  const handleBulkDelete = async () => {
    if (selectedChats.size === 0) return;
    if (!await confirmDialog({ title: `حذف ${selectedChats.size} گفتگو`, message: "تمام پیام‌های انتخاب‌شده حذف خواهد شد. آیا مطمئنید؟", variant: "danger" })) return;
    try {
      for (const cid of selectedChats) { await deleteChat({ chatId: cid }); }
      setSelectedChat(null); setSelectedChats(new Set());
      toast.success(`${selectedChats.size} گفتگو حذف شد.`);
    } catch { toast.error("خطا در حذف گروهی."); }
  };

  // ── خاتمه گروهی ──
  const handleBulkEnd = async () => {
    if (selectedChats.size === 0) return;
    if (!await confirmDialog({ title: `خاتمه ${selectedChats.size} گفتگو`, message: "آیا از خاتمه گفتگوهای انتخاب‌شده اطمینان دارید؟", variant: "warning" })) return;
    try {
      for (const cid of selectedChats) { await endChat({ chatId: cid }); }
      setSelectedChats(new Set());
      toast.success(`${selectedChats.size} گفتگو خاتمه یافت.`);
    } catch { toast.error("خطا در خاتمه گروهی."); }
  };

  // ── تبدیل به تیکت ──
  const handleConvertToTicket = async () => {
    if (!selectedChat || !currentChat) return;
    if (!await confirmDialog({ title: "تبدیل به تیکت", message: `آیا چت با ${currentChat.guestName} به تیکت تبدیل شود؟`, variant: "info" })) return;
    try {
      const body = chatMessages?.map((m: any) => `[${m.senderId.startsWith("guest-") ? currentChat.guestName : "اپراتور"}]: ${m.body}`).join("\n") || "";
      await createTicket({ subject: `چت زنده - ${currentChat.guestName}`, message: body || "تبدیل خودکار", category: "general", priority: "medium" });
      toast.success("مکالمه به تیکت تبدیل شد.");
    } catch { toast.error("خطا در تبدیل."); }
  };

  const toggleSelectChat = (chatId: string) => {
    setSelectedChats(prev => { const next = new Set(prev); next.has(chatId) ? next.delete(chatId) : next.add(chatId); return next; });
  };

  const toggleSelectAll = () => {
    if (selectedChats.size === filteredChats.length) setSelectedChats(new Set());
    else setSelectedChats(new Set(filteredChats.map((c: any) => c.chatId)));
  };

  const userId = user?._id as unknown as string;
  const firstUnreadIdx = chatMessages?.findIndex((m: any) => m.receiverId === userId && !m.isRead) ?? -1;

  const TABS: { key: FilterTab; label: string; icon: any }[] = [
    { key: "all", label: "همه", icon: Inbox },
    { key: "unread", label: "خوانده‌نشده", icon: AlertCircle },
    { key: "active", label: "فعال", icon: MessageSquare },
    { key: "ended", label: "خاتمه‌یافته", icon: Archive },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">چت زنده</h1>
        {currentChat && (
          <div className="flex items-center gap-2">
            {currentChat.isEnded && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-medium">خاتمه یافته</span>}
            {currentChat.rating && <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium"><Star className="h-3 w-3" /> {currentChat.rating}/5</span>}
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-lg">{currentChat.messageCount} پیام</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: "65vh" }}>
        {/* ── لیست چت‌ها ── */}
        <div className="clay-card p-3 space-y-2 overflow-y-auto">
          {/* جستجو */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..."
              className="clay-input w-full pl-9 pr-3 py-2 text-sm outline-none" />
          </div>

          {/* تب‌های فیلتر */}
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                <tab.icon className="h-3 w-3" />
                {tab.label}
                <span className="text-[9px] opacity-60">({tabCounts[tab.key]})</span>
              </button>
            ))}
          </div>

          {/* فیلترهای پیشرفته */}
          <div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="h-3 w-3" /> فیلتر پیشرفته {showFilters ? "▲" : "▼"}
            </button>
            {showFilters && (
              <div className="mt-2 space-y-2 p-2.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-2">
                  <JalaliDatePicker value={dateFrom} onChange={setDateFrom} placeholder="از تاریخ" className="w-full" />
                  <JalaliDatePicker value={dateTo} onChange={setDateTo} placeholder="تا تاریخ" className="w-full" />
                </div>
                {(dateFrom || dateTo) && (
                  <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-[10px] text-destructive hover:underline">پاک کردن فیلتر تاریخ</button>
                )}
              </div>
            )}
          </div>

          {/* عملیات گروهی */}
          {filteredChats.length > 0 && (
            <div className="flex items-center justify-between pt-1 border-t">
              <button onClick={toggleSelectAll} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                {selectedChats.size === filteredChats.length ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                {selectedChats.size > 0 ? `${selectedChats.size} انتخاب` : "انتخاب همه"}
              </button>
              {selectedChats.size > 0 && (
                <div className="flex gap-1">
                  <button onClick={handleBulkEnd} className="text-[10px] text-orange-600 hover:underline">خاتمه گروهی</button>
                  <button onClick={handleBulkDelete} className="text-[10px] text-destructive hover:underline">حذف گروهی</button>
                </div>
              )}
            </div>
          )}

          {/* لیست چت‌ها */}
          {filteredChats.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">مکالمه‌ای یافت نشد.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat: any) => (
                <div key={chat.chatId}
                  className={`w-full p-2.5 rounded-xl text-right transition-all flex items-start gap-2 ${
                    selectedChat === chat.chatId ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent"
                  }`}>
                  <button onClick={() => toggleSelectChat(chat.chatId)} className="mt-2 shrink-0">
                    {selectedChats.has(chat.chatId) ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5 text-muted-foreground/40" />}
                  </button>
                  <button onClick={() => setSelectedChat(chat.chatId)} className="flex-1 text-right">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                        <Circle className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-background ${chat.isOnline ? "fill-emerald-500 text-emerald-500" : "fill-gray-300 text-gray-300"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold truncate">{chat.guestName}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {chat.isEnded && <Archive className="h-3 w-3 text-orange-400" />}
                            {chat.rating && <Star className="h-3 w-3 text-emerald-500" />}
                            {chat.unread > 0 && <span className="bg-primary text-primary-foreground text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{chat.unread}</span>}
                          </div>
                        </div>
                        {chat.guestPhone && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5" />{chat.guestPhone}</p>}
                        <div className="flex items-center justify-between mt-0.5">
                          {chat.lastMessage && <p className="text-[10px] text-muted-foreground truncate max-w-[65%]">{chat.lastMessage.body}</p>}
                          <span className="text-[9px] text-muted-foreground/50 shrink-0">{chat.lastMessage && formatExactTime(chat.lastMessage.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── پنجره چت ── */}
        <div className="lg:col-span-3 clay-card flex flex-col">
          {!selectedChat || !currentChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">یک مکالمه را انتخاب کنید</p>
              </div>
            </div>
          ) : (
            <>
              {/* هدر */}
              <div className="border-b p-3 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                    {currentChat.isOnline && <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-emerald-500 text-emerald-500 border-2 border-background" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{currentChat.guestName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className={`flex items-center gap-1 ${currentChat.isOnline ? "text-emerald-600" : ""}`}>
                        <Circle className={`h-2 w-2 ${currentChat.isOnline ? "fill-emerald-500" : "fill-gray-300"}`} />
                        {currentChat.isOnline ? "آنلاین" : "آفلاین"}
                      </span>
                      {currentChat.guestPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {currentChat.guestPhone}</span>}
                      {currentChat.guestEmail && <span className="flex items-center gap-1 truncate max-w-[150px]"><Mail className="h-3 w-3" /> {currentChat.guestEmail}</span>}
                      {currentChat.ipAddress && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {currentChat.ipAddress}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowRating(!showRating)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="نظرسنجی"><Star className="h-4 w-4" /></button>
                  <button onClick={handleConvertToTicket} className="p-2 rounded-lg hover:bg-muted text-primary transition-colors" title="تبدیل به تیکت"><Ticket className="h-4 w-4" /></button>
                  {!currentChat.isEnded && <button onClick={() => handleEndChat()} className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors" title="خاتمه چت"><StopCircle className="h-4 w-4" /></button>}
                  <button onClick={() => handleDeleteChat()} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="حذف چت"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              {/* پنل نظرسنجی */}
              {showRating && currentChat.rating && (
                <div className="bg-emerald-50 border-b p-3 flex items-center gap-3">
                  <Star className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">نظر کاربر: {currentChat.rating} از ۵</p>
                    <p className="text-[10px] text-emerald-600">{[1,2,3,4,5].map(i => i <= currentChat.rating ? "⭐" : "☆").join("")}</p>
                  </div>
                  <button onClick={() => setShowRating(false)} className="mr-auto p-1 text-emerald-400 hover:text-emerald-600"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}

              {/* پیام‌ها */}
              <div className="flex-1 p-4 space-y-1 overflow-y-auto min-h-[400px] bg-background/50">
                <div className="flex justify-center mb-3">
                  <div className="bg-muted/50 text-muted-foreground text-[10px] px-3 py-1 rounded-full">شروع مکالمه با {currentChat.guestName}</div>
                </div>
                {chatMessages?.map((msg: any, idx: number) => {
                  const isMine = msg.senderId === userId;
                  const prevMsg = idx > 0 ? chatMessages[idx - 1] : null;
                  const showDate = !prevMsg || isDifferentDay(prevMsg.createdAt, msg.createdAt);
                  return (
                    <div key={msg._id}>
                      {showDate && <ChatDateSeparator timestamp={msg.createdAt} />}
                      {idx === firstUnreadIdx && <UnreadDivider />}
                      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
                        <div className="max-w-[75%]">
                          {!isMine && <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1"><User className="h-2.5 w-2.5" /> {msg.senderName || "مهمان"}</p>}
                          <div className={`p-2.5 rounded-2xl ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : msg.chatEnded ? "bg-orange-50 text-orange-800 border border-orange-200 rounded-bl-md text-center text-xs" : "bg-muted rounded-bl-md"}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-white/10">
                                <Paperclip className="h-3 w-3" />
                                {msg.attachments.map((a: string, i: number) => <a key={i} href={a} target="_blank" rel="noopener noreferrer" className={`text-[10px] underline ${isMine ? "text-primary-foreground/70" : "text-primary"}`}>فایل {i + 1}</a>)}
                              </div>
                            )}
                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? "text-primary-foreground/50 justify-end" : "text-muted-foreground/60"}`}>
                              <Clock className="h-2.5 w-2.5" /> {formatExactTime(msg.createdAt)}
                              <ChatReadTicks isRead={msg.isRead} readAt={msg.readAt} createdAt={msg.createdAt} isMine={isMine} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* ورودی */}
              {!currentChat.isEnded ? (
                <div className="border-t p-4 space-y-2 bg-muted/20">
                  {attachmentUrl && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                      <Paperclip className="h-3 w-3" /><span className="truncate">{attachmentUrl}</span>
                      <button onClick={() => setAttachmentUrl("")} className="text-destructive hover:underline shrink-0">حذف</button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => { const url = prompt("لینک فایل:"); if (url) setAttachmentUrl(url); }}
                      className="clay-icon flex h-10 w-10 items-center justify-center rounded-xl bg-muted hover:bg-accent transition-colors shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="پاسخ خود را بنویسید..." className="clay-input flex-1 px-4 py-2.5 text-sm outline-none" />
                    <button onClick={handleSend} disabled={!newMessage.trim()}
                      className="clay-button px-5 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                      <Send className="h-4 w-4" /> ارسال
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t p-4 bg-orange-50 text-center">
                  <p className="text-xs text-orange-700 font-medium">گفتگو خاتمه یافته است</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
