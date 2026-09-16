import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useEffect, useState } from "react";

/**
 * Toaster — اعلان‌های toast با پشتیبانی از تم.
 * تم از کلاس‌های DOM خوانده می‌شود (بدون نیاز به ThemeProvider).
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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-emerald-500/10 group-[.toaster]:text-emerald-600 group-[.toaster]:border-emerald-500/20 dark:group-[.toaster]:bg-emerald-500/20 dark:group-[.toaster]:text-emerald-400",
          error: "group-[.toaster]:bg-rose-500/10 group-[.toaster]:text-rose-600 group-[.toaster]:border-rose-500/20 dark:group-[.toaster]:bg-rose-500/20 dark:group-[.toaster]:text-rose-400",
          warning: "group-[.toaster]:bg-amber-500/10 group-[.toaster]:text-amber-600 group-[.toaster]:border-amber-500/20 dark:group-[.toaster]:bg-amber-500/20 dark:group-[.toaster]:text-amber-400",
          info: "group-[.toaster]:bg-blue-500/10 group-[.toaster]:text-blue-600 group-[.toaster]:border-blue-500/20 dark:group-[.toaster]:bg-blue-500/20 dark:group-[.toaster]:text-blue-400",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
