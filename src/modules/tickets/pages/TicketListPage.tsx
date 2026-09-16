import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, MessageSquare, Send, ChevronDown, ChevronUp, Star, Paperclip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "@/config/constants";
import { useAuth } from "@/hooks/use-auth";

export default function TicketListPage() {
  const { user } = useAuth();
  const tickets = useQuery(api.tickets.list);
  const createTicket = useMutation(api.tickets.create);
  const addReply = useMutation(api.tickets.addReply);
  const updateStatus = useMutation(api.tickets.updateStatus);
  const rateTicket = useMutation(api.tickets.rateTicket);
  const forwardDepartment = useMutation(api.tickets.forwardToDepartment);

  const [showForm, setShowForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<string[]>([]);
  const [forwardTicketId, setForwardTicketId] = useState<string | null>(null);
  const [forwardDept, setForwardDept] = useState("");
  const [forwardNote, setForwardNote] = useState("");
  const [ticketRating, setTicketRating] = useState(0);
  const [ticketFeedback, setTicketFeedback] = useState("");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [department, setDepartment] = useState("");
  const departments = useQuery(api.settings.get, { key: "departments" });
  const deptList = (departments?.value as { id: string; name: string }[]) || [];

  const isAdmin = user?.role === "admin" || user?.role === "manager" || user?.role === "operator";

  const handleCreate = async () => {
    if (!subject || !message) { toast.error("لطفاً موضوع و متن پیام را وارد کنید."); return; }
    try {
      await createTicket({ subject, message, category: category as any, priority: priority as any, department: department || undefined });
      toast.success("تیکت پشتیبانی شما ثبت شد.");
      setShowForm(false); setSubject(""); setMessage("");
    } catch { toast.error("خطا در ارسال تیکت."); }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) { toast.error("پیام را وارد کنید."); return; }
    try {
      await addReply({
        ticketId: ticketId as any,
        message: replyMessage,
        attachments: replyAttachments.length > 0 ? replyAttachments : undefined,
      });
      setReplyMessage("");
      setReplyAttachments([]);
      toast.success("پاسخ ارسال شد.");
    } catch { toast.error("خطا در ارسال پاسخ."); }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateStatus({ ticketId: ticketId as any, status: newStatus as any });
      toast.success("وضعیت تیکت تغییر کرد.");
    } catch { toast.error("خطا در تغییر وضعیت."); }
  };

  const handleRate = async (ticketId: string) => {
    if (ticketRating === 0) { toast.error("امتیاز را انتخاب کنید."); return; }
    try {
      await rateTicket({ ticketId: ticketId as any, rating: ticketRating, feedback: ticketFeedback || undefined });
      toast.success("امتیاز شما ثبت شد.");
      setTicketRating(0);
      setTicketFeedback("");
    } catch (e: any) { toast.error(e.message || "خطا در ثبت امتیاز."); }
  };

  // Get replies for expanded ticket
  const replies = useQuery(
    api.tickets.getReplies,
    expandedTicket ? { ticketId: expandedTicket as any } : "skip"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تیکت‌های پشتیبانی</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ارسال و پیگیری درخواست‌های پشتیبانی</p>
      </div>

      <button onClick={() => setShowForm(!showForm)} className="clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold">
        <Plus className="h-4 w-4" /> {showForm ? "بستن فرم" : "تیکت جدید"}
      </button>

      {/* Create Form */}
      {showForm && (
        <div className="clay-card p-6 space-y-4">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع تیکت" className="clay-input w-full p-3 text-sm outline-none" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="توضیحات مشکل یا سؤال خود..." className="clay-input w-full p-3 text-sm outline-none min-h-[100px]" />
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">دسته‌بندی</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="clay-input p-3 text-sm outline-none">
                {TICKET_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اولویت</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="clay-input p-3 text-sm outline-none">
                {TICKET_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">دپارتمان</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="clay-input p-3 text-sm outline-none">
                <option value="">ندارد</option>
                {deptList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="clay-button px-4 py-2 text-sm font-semibold">ارسال تیکت</button>
            <button onClick={() => setShowForm(false)} className="clay-button px-4 py-2 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {!tickets || tickets.length === 0 ? (
        <div className="clay-card p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">هنوز تیکتی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => {
            const isExpanded = expandedTicket === t._id;
            return (
              <div key={t._id} className="clay-card overflow-hidden">
                {/* Ticket Header */}
                <div
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedTicket(isExpanded ? null : t._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="clay-icon flex h-10 w-10 items-center justify-center bg-primary/10 text-primary"><MessageSquare className="h-4 w-4" /></div>
                    <div>
                      <p className="font-semibold text-sm">{t.subject}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {TICKET_CATEGORIES.find((c) => c.value === t.category)?.label}
                        {(t as any).department && deptList.length > 0 && (
                          <span className="text-primary"> · {deptList.find((d) => d.id === (t as any).department)?.name || (t as any).department}</span>
                        )}
                        · {new Date(t.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[11px] font-medium rounded-full ${
                      t.status === "open" ? "bg-sky-100 text-sky-700" :
                      t.status === "answered" ? "bg-emerald-100 text-emerald-700" :
                      t.status === "closed" ? "bg-slate-100 text-slate-600" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {TICKET_STATUSES.find((s) => s.value === t.status)?.label}
                    </span>
                    <span className={`text-[11px] font-medium ${TICKET_PRIORITIES.find((p) => p.value === t.priority)?.color || ""}`}>
                      {TICKET_PRIORITIES.find((p) => p.value === t.priority)?.label}
                    </span>
                    {t.rating && (
                      <span className="text-[11px] text-amber-500">⭐ {t.rating}/5</span>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-4">
                    {/* Original Message */}
                    <div className="clay-surface p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">پیام اولیه</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleString("fa-IR")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.message}</p>
                    </div>

                    {/* Replies */}
                    {replies && replies.length > 0 && (
                      <div className="space-y-2">
                        {replies.map((r: any) => (
                          <div key={r._id} className="clay-surface p-3 rounded-xl ml-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">پاسخ</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleString("fa-IR")}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                            {r.attachments && r.attachments.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <Paperclip className="h-3 w-3 text-muted-foreground" />
                                {r.attachments.map((a: string, i: number) => (
                                  <a key={i} href={a} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">پیوست {i + 1}</a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status Change (Admin Only) */}
                    {isAdmin && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">تغییر وضعیت:</span>
                          {TICKET_STATUSES.map((s) => (
                            <button
                              key={s.value}
                              onClick={() => handleStatusChange(t._id, s.value)}
                              className={`px-2 py-1 text-[10px] rounded-lg transition-colors ${
                                t.status === s.value
                                  ? "bg-primary text-primary-foreground font-bold"
                                  : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                        {/* ارجاع به دپارتمان */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">ارجاع به:</span>
                          {deptList.filter((d: any) => d.id !== (t as any).department).map((d: any) => (
                            <button
                              key={d.id}
                              onClick={async () => {
                                try {
                                  await forwardDepartment({ ticketId: t._id as any, newDepartment: d.id });
                                  toast.success(`تیکت به «${d.name}» ارجاع شد.`);
                                } catch (e: any) { toast.error(e.message || "خطا."); }
                              }}
                              className="px-2 py-1 text-[10px] rounded-lg bg-muted text-muted-foreground hover:bg-accent transition-colors"
                            >
                              📌 {d.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reply Input (when ticket is not closed) */}
                    {t.status !== "closed" && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply(t._id)}
                            placeholder="پاسخ دهید..."
                            className="clay-input flex-1 p-3 text-sm outline-none"
                          />
                          <button
                            onClick={() => handleReply(t._id)}
                            className="clay-button px-4 py-2 text-sm font-semibold flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" /> ارسال
                          </button>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          فایل پیوست: URL فایل را در پیام قرار دهید (آپلود فایل از طریق لینک)
                        </div>
                      </div>
                    )}

                    {/* Rating Section (for closed tickets by ticket owner) */}
                    {t.status === "closed" && !t.rating && t.userId === user?._id && (
                      <div className="clay-surface p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-semibold">امتیازدهی به پشتیبانی</h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setTicketRating(star)}
                              className="transition-colors"
                            >
                              <Star className={`h-6 w-6 ${ticketRating >= star ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                            </button>
                          ))}
                          <span className="text-xs text-muted-foreground mr-2">{ticketRating > 0 ? `${ticketRating} از ۵` : ""}</span>
                        </div>
                        <textarea
                          value={ticketFeedback}
                          onChange={(e) => setTicketFeedback(e.target.value)}
                          placeholder="نظر شما درباره کیفیت پشتیبانی (اختیاری)..."
                          className="clay-input w-full p-2 text-xs outline-none min-h-[60px]"
                          rows={2}
                        />
                        <button onClick={() => handleRate(t._id)} className="clay-button px-4 py-1.5 text-xs font-semibold">ثبت امتیاز</button>
                      </div>
                    )}
                    {t.rating && t.status === "closed" && (
                      <div className="clay-surface p-3 rounded-xl">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">امتیاز شما:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${t.rating >= star ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                        {t.ratingFeedback && <p className="text-[11px] text-muted-foreground mt-1">{t.ratingFeedback}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
