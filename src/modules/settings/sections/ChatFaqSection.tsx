/**
 * ChatFaqSection — بخش تنظیمات سؤالات متداول چت زنده
 * مدیریت سؤالات و پاسخ‌هایی که قبل از پاسخ اپراتور نمایش داده می‌شوند
 */
import { useState } from "react";
import { useSettings } from "../hooks/use-settings";
import { SaveButton, SectionHeader } from "../components/SettingsUI";
import { Plus, Trash2, Edit3, HelpCircle, MessageSquare, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  q: string;
  a: string;
}

export default function ChatFaqSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("chatFaq");
  const [items, setItems] = useState<FaqItem[]>(() => {
    const saved = getVal("chatFaqItems");
    return Array.isArray(saved) ? saved : [];
  });
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!newQ.trim() || !newA.trim()) return;
    const updated = [...items, { q: newQ.trim(), a: newA.trim() }];
    setItems(updated);
    setVal("chatFaqItems", updated);
    setNewQ("");
    setNewA("");
    setShowAdd(false);
  };

  const handleUpdate = (idx: number, q: string, a: string) => {
    const updated = [...items];
    updated[idx] = { q, a };
    setItems(updated);
    setVal("chatFaqItems", updated);
    setEditingIdx(null);
  };

  const handleDelete = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    setVal("chatFaqItems", updated);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...items];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setItems(updated);
    setVal("chatFaqItems", updated);
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= items.length - 1) return;
    const updated = [...items];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setItems(updated);
    setVal("chatFaqItems", updated);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="سؤالات متداول چت زنده"
        description="سؤالاتی که قبل از پاسخ اپراتور به کاربر نمایش داده می‌شوند."
        gradient="from-cyan-50 to-sky-50 border-cyan-200/50"
      />

      {/* لیست آیتم‌ها */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border bg-card p-3 space-y-2"
            >
              {editingIdx === idx ? (
                <FaqEditForm
                  initialQ={item.q}
                  initialA={item.a}
                  onSave={(q, a) => handleUpdate(idx, q, a)}
                  onCancel={() => setEditingIdx(null)}
                />
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.q}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30"
                      title="بالا"
                    >
                      <GripVertical className="h-3.5 w-3.5 rotate-180" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === items.length - 1}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30"
                      title="پایین"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingIdx(idx)}
                      className="p-1.5 rounded-lg hover:bg-muted text-primary"
                      title="ویرایش"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                      title="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* فرم افزودن */}
      <AnimatePresence>
        {showAdd ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border-2 border-dashed border-primary/30 p-4 space-y-3"
          >
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-medium">
                <MessageSquare className="h-3 w-3 inline ml-1" /> سؤال
              </label>
              <input
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                placeholder="مثلاً: شرایط مرجوعی چیست?"
                className="clay-input w-full px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-medium">
                <HelpCircle className="h-3 w-3 inline ml-1" /> پاسخ
              </label>
              <textarea
                value={newA}
                onChange={(e) => setNewA(e.target.value)}
                placeholder="پاسخ سؤال..."
                className="clay-input w-full px-3 py-2 text-sm outline-none min-h-[80px] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newQ.trim() || !newA.trim()}
                className="clay-button px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                افزودن
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewQ(""); setNewA(""); }}
                className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 p-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            افزودن سؤال جدید
          </button>
        )}
      </AnimatePresence>

      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}

/** فرم ویرایش آیتم FAQ */
function FaqEditForm({
  initialQ,
  initialA,
  onSave,
  onCancel,
}: {
  initialQ: string;
  initialA: string;
  onSave: (q: string, a: string) => void;
  onCancel: () => void;
}) {
  const [q, setQ] = useState(initialQ);
  const [a, setA] = useState(initialA);

  return (
    <div className="space-y-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="clay-input w-full px-3 py-2 text-sm outline-none"
        placeholder="سؤال"
      />
      <textarea
        value={a}
        onChange={(e) => setA(e.target.value)}
        className="clay-input w-full px-3 py-2 text-sm outline-none min-h-[60px] resize-none"
        placeholder="پاسخ"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(q, a)}
          disabled={!q.trim() || !a.trim()}
          className="clay-button px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          ذخیره
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          انصراف
        </button>
      </div>
    </div>
  );
}
