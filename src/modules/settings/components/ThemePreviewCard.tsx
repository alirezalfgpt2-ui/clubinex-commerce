import { Check } from "lucide-react";

/**
 * کارت پیش‌نمایش تم — نمایش کوچک از لایوت پنل ادمین
 * شامل: سایدبار، تاپبار، دکمه‌ها، کارت‌ها
 */
interface ThemePreviewCardProps {
  name: string;
  nameFa: string;
  isActive: boolean;
  primary: string;
  accent: string;
  sidebar: string;
  background: string;
  card: string;
  border: string;
  onClick: () => void;
}

export function ThemePreviewCard({
  name,
  nameFa,
  isActive,
  primary,
  accent,
  sidebar,
  background,
  card,
  border,
  onClick,
}: ThemePreviewCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 text-left w-full ${
        isActive
          ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
          : "border-border/50 hover:border-border hover:shadow-md"
      }`}
    >
      {/* ── پیش‌نمایش لایوت ── */}
      <div
        className="relative h-32 overflow-hidden rounded-t-xl"
        style={{ background }}
      >
        {/* سایدبار */}
        <div
          className="absolute right-0 top-0 bottom-0 w-10 flex flex-col items-center gap-1 pt-2"
          style={{ background: sidebar }}
        >
          <div className="w-5 h-5 rounded-md" style={{ background: primary }} />
          <div className="w-5 h-1.5 rounded-full mt-1 opacity-40" style={{ background: primary }} />
          <div className="w-5 h-1.5 rounded-full opacity-30" style={{ background: primary }} />
          <div className="w-5 h-1.5 rounded-full opacity-30" style={{ background: primary }} />
          <div className="w-5 h-1.5 rounded-full opacity-20" style={{ background: primary }} />
        </div>

        {/* تاپبار */}
        <div
          className="absolute right-10 top-0 left-0 h-6 flex items-center px-2 gap-1"
          style={{ background: card, borderBottom: `1px solid ${border}` }}
        >
          <div className="w-3 h-3 rounded opacity-40" style={{ background: primary }} />
          <div className="w-12 h-1.5 rounded-full opacity-20 ml-auto" style={{ background: primary }} />
        </div>

        {/* محتوا */}
        <div className="absolute right-10 top-6 left-0 p-2">
          {/* کارت‌ها */}
          <div className="flex gap-1.5 mb-1.5">
            <div className="flex-1 rounded-lg p-1.5" style={{ background: card, border: `1px solid ${border}` }}>
              <div className="w-6 h-1 rounded-full opacity-30 mb-0.5" style={{ background: primary }} />
              <div className="w-4 h-2 rounded opacity-60" style={{ background: accent }} />
            </div>
            <div className="flex-1 rounded-lg p-1.5" style={{ background: card, border: `1px solid ${border}` }}>
              <div className="w-6 h-1 rounded-full opacity-30 mb-0.5" style={{ background: primary }} />
              <div className="w-4 h-2 rounded opacity-60" style={{ background: primary }} />
            </div>
          </div>

          {/* دکمه */}
          <div
            className="w-12 h-3 rounded-md mx-auto"
            style={{ background: primary }}
          />

          {/* لیست موارد */}
          <div className="mt-1.5 space-y-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
              <div className="w-14 h-1 rounded-full opacity-30" style={{ background: primary }} />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full opacity-50" style={{ background: primary }} />
              <div className="w-10 h-1 rounded-full opacity-20" style={{ background: primary }} />
            </div>
          </div>
        </div>

        {/* تیک فعال */}
        {isActive && (
          <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-xl">
              <Check className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* ── نام تم ── */}
      <div className="p-3 bg-card">
        <p className="text-sm font-semibold leading-tight">{nameFa}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{name}</p>
      </div>
    </button>
  );
}
