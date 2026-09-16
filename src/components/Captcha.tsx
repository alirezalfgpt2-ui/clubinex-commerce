import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

function generateCaptchaText(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function Captcha({ onVerify }: CaptchaProps) {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [verified, setVerified] = useState(false);

  const refresh = useCallback(() => {
    const newText = generateCaptchaText();
    setText(newText);
    setInput("");
    setVerified(false);
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    refresh();
  }, []);

  const handleChange = (value: string) => {
    setInput(value);
    if (value === text) {
      setVerified(true);
      onVerify(true);
    } else {
      setVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">کد امنیتی</label>
      <div className="flex items-center gap-2">
        <div
          className="relative flex-shrink-0 select-none overflow-hidden rounded-xl border border-border bg-gradient-to-r from-muted/80 to-muted px-4 py-2.5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)`,
          }}
        >
          <span
            className="text-lg font-bold tracking-[0.3em] text-primary/80"
            style={{
              fontFamily: "monospace",
              textShadow: "1px 1px 0 rgba(0,0,0,0.1)",
            }}
          >
            {text}
          </span>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="clay-icon flex h-10 w-10 items-center justify-center rounded-xl bg-muted hover:bg-accent transition-colors"
          title="کد جدید"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="کد بالا را وارد کنید..."
        className={`clay-input w-full p-3 text-sm outline-none ${
          verified ? "border-emerald-500" : input ? "border-rose-400" : ""
        }`}
        maxLength={6}
      />
      {verified && (
        <p className="text-xs text-emerald-600">✓ کد تأیید شد</p>
      )}
    </div>
  );
}
