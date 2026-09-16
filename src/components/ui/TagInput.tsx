/**
 * 🏷️ کامپوننت ورودی برچسب‌ها (Tag/Chip Input)
 * — تایپ + اینتر برای افزودن
 * — ضربدر برای حذف هر برچسب
 * — جلوگیری از تکرار
 */
import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "تگ را تایپ کنید و اینتر بزنید...",
  disabled = false,
  maxTags = 20,
  className = "",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    if (value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 p-2 min-h-[42px] rounded-xl border border-input bg-background transition-all focus-within:ring-2 focus:ring-primary/20 focus:border-primary cursor-text ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium animate-in fade-in zoom-in-95 duration-150"
        >
          <span className="max-w-[140px] truncate">{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || value.length >= maxTags}
        placeholder={value.length === 0 ? placeholder : value.length >= maxTags ? "حداکثر تعداد رسید" : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
