import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  ShieldCheck,
  Trash2,
  Save,
  Send,
} from "lucide-react";

/**
 * Toaster — اعلان‌های حرفه‌ای با طراحی Glass Morphism
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const detect = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };
    detect();
    const observer = new MutationObserver(detect);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-left"
      dir="rtl"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/5 group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-sans group-[.toaster]:min-h-[60px] group-[.toaster]:max-w-[380px]",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-xs group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-xs",
          success:
            "group-[.toaster]:border-emerald-200 dark:group-[.toaster]:border-emerald-800/40",
          error:
            "group-[.toaster]:border-rose-200 dark:group-[.toaster]:border-rose-800/40",
          warning:
            "group-[.toaster]:border-amber-200 dark:group-[.toaster]:border-amber-800/40",
          info: "group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800/40",
        },
      }}
      icons={{
        success: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            <CircleCheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        ),
        info: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        ),
        warning: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
            <TriangleAlertIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        ),
        error: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40">
            <OctagonXIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        ),
        loading: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ),
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
