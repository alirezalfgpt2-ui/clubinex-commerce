/**
 * کامپوننت لیست قابل کشیدن و رها کردن (Drag & Drop)
 * — پشتیبانی از جابجایی بین بخش‌های مختلف
 * — RTL friendly
 * — بدون نیاز به پکیج خارجی
 */
import { useState, useRef, useCallback, ReactNode, createContext, useContext } from "react";
import { GripVertical } from "lucide-react";

export interface DragDropItem {
  id: string;
  [key: string]: any;
}

/** کانتکست برای اشتراک‌گذاری state بین لیست‌ها */
interface DndContextValue {
  dragItem: DragDropItem | null;
  dragSourceId: string | null;
  overTargetId: string | null;
  overIndex: number | null;
  setDragState: (item: DragDropItem | null, sourceId: string | null) => void;
  setOverState: (targetId: string | null, index: number | null) => void;
  clearDrag: () => void;
}

const DndContext = createContext<DndContextValue>({
  dragItem: null, dragSourceId: null, overTargetId: null, overIndex: null,
  setDragState: () => {}, setOverState: () => {}, clearDrag: () => {},
});

/** ارائه‌دهنده DndContext */
export function DndProvider({ children }: { children: React.ReactNode }) {
  const [dragItem, setDragItem] = useState<DragDropItem | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [overTargetId, setOverTargetId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return (
    <DndContext.Provider value={{
      dragItem, dragSourceId, overTargetId, overIndex,
      setDragState: (item, sourceId) => { setDragItem(item); setDragSourceId(sourceId); },
      setOverState: (targetId, index) => { setOverTargetId(targetId); setOverIndex(index); },
      clearDrag: () => { setDragItem(null); setDragSourceId(null); setOverTargetId(null); setOverIndex(null); },
    }}>
      {children}
    </DndContext.Provider>
  );
}

interface DragDropListProps<T extends DragDropItem> {
  /** شناسه یکتای این لیست (برای جابجایی بین لیست‌ها) */
  listId: string;
  items: T[];
  onReorder: (items: T[]) => void;
  /** وقتی آیتمی از لیست دیگری به این لیست منتقل شد */
  onDropFromOther?: (item: T, index: number) => void;
  /** وقتی آیتمی از این لیست به لیست دیگری منتقل شد */
  onDropToOther?: (item: T, targetListId: string) => void;
  /** لیست شناسه لیست‌های مجاز برای دریافت آیتم */
  targetListIds?: string[];
  renderItem: (item: T, index: number, dragHandle: ReactNode) => ReactNode;
  className?: string;
}

export function DragDropList<T extends DragDropItem>({
  listId, items, onReorder, onDropFromOther, onDropToOther, targetListIds, renderItem, className,
}: DragDropListProps<T>) {
  const ctx = useContext(DndContext);
  const listRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ item: items[index], sourceListId: listId, index }));
    ctx.setDragState(items[index], listId);
    // Ghost بی‌رنگ
    const ghost = document.createElement("div");
    ghost.style.opacity = "0";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => ghost.remove(), 0);
  }, [items, listId, ctx]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    ctx.setOverState(listId, index);
  }, [listId, ctx]);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { item, sourceListId, index: dragIndex } = data;

      if (sourceListId === listId) {
        // جابجایی در همان لیست
        if (dragIndex !== dropIndex) {
          const next = [...items];
          const [moved] = next.splice(dragIndex, 1);
          next.splice(dropIndex, 0, moved);
          onReorder(next);
        }
      } else {
        // جابجایی به لیست دیگر
        if (onDropFromOther && (!targetListIds || targetListIds.includes(sourceListId))) {
          onDropFromOther(item as T, dropIndex);
        }
      }
    } catch { /* ignore */ }
    ctx.clearDrag();
  }, [items, listId, onReorder, onDropFromOther, targetListIds, ctx]);

  const handleDragEnd = useCallback(() => {
    // اگر آیتم رها شد ولی هیچ لیستی قبول نکرد → احتمالاً حذف شده
    ctx.clearDrag();
  }, [ctx]);

  return (
    <div ref={listRef} className={`space-y-1 ${className || ""}`}>
      {items.map((item, index) => {
        const isDragging = ctx.dragItem?.id === item.id && ctx.dragSourceId === listId;
        const isOver = ctx.overTargetId === listId && ctx.overIndex === index;
        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-all duration-150 ${
              isDragging ? "opacity-40 scale-[0.98]" : ""
            } ${isOver ? "border-t-2 border-primary/50" : ""}`}
          >
            {renderItem(item, index, (
              <div
                draggable
                onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, index); }}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/60 transition-colors shrink-0"
                title="بکشید و رها کنید"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              </div>
            ))}
          </div>
        );
      })}
      {/* ناحیه drop برای لیست خالی */}
      {items.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); ctx.setOverState(listId, 0); }}
          onDrop={(e) => handleDrop(e, 0)}
          className="border-2 border-dashed border-border/50 rounded-xl p-4 text-center text-[11px] text-muted-foreground"
        >
          آیتم را اینجا رها کنید
        </div>
      )}
    </div>
  );
}
