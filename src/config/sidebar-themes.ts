/**
 * تم‌های سایدبار — هر تم مجموعه‌ای کامل از CSS variables را تنظیم می‌کند
 * این متغیرها توسط Sidebar.tsx خوانده و اعمال می‌شوند
 */

export interface SidebarThemeVars {
  "--sb-bg": string;
  "--sb-text": string;
  "--sb-text-muted": string;
  "--sb-border": string;
  "--sb-search-bg": string;
  "--sb-search-text": string;
  "--sb-group-label": string;
  "--sb-active-bg": string;
  "--sb-active-text": string;
  "--sb-hover-bg": string;
  "--sb-logo-bg": string;
  "--sb-logo-text": string;
  "--sb-scrollbar": string;
  "--sb-scroll-bg": string;
  "--sb-item-radius": string;
  "--sb-item-padding": string;
  "--sb-item-gap": string;
}

export interface SidebarThemeDef {
  id: string;
  label: string;
  labelEn: string;
  desc: string;
  accent: string;
  vars: SidebarThemeVars;
}

/** تم روشن — مینیمال و سفید */
const LIGHT: SidebarThemeVars = {
  "--sb-bg": "#ffffff",
  "--sb-text": "#374151",
  "--sb-text-muted": "#9ca3af",
  "--sb-border": "#e5e7eb",
  "--sb-search-bg": "#f3f4f6",
  "--sb-search-text": "#6b7280",
  "--sb-group-label": "#9ca3af",
  "--sb-active-bg": "#eef2ff",
  "--sb-active-text": "#4f46e5",
  "--sb-hover-bg": "#f9fafb",
  "--sb-logo-bg": "#4f46e5",
  "--sb-logo-text": "#ffffff",
  "--sb-scrollbar": "#d1d5db",
  "--sb-scroll-bg": "transparent",
  "--sb-item-radius": "0.5rem",
  "--sb-item-padding": "0.5rem 0.75rem",
  "--sb-item-gap": "0.125rem",
};

/** تم تاریک — مشکی مدرن با گرادیانت ظریف */
const DARK: SidebarThemeVars = {
  "--sb-bg": "#0f172a",
  "--sb-text": "#cbd5e1",
  "--sb-text-muted": "#64748b",
  "--sb-border": "rgba(255,255,255,0.06)",
  "--sb-search-bg": "rgba(255,255,255,0.07)",
  "--sb-search-text": "#94a3b8",
  "--sb-group-label": "#475569",
  "--sb-active-bg": "rgba(99,102,241,0.2)",
  "--sb-active-text": "#818cf8",
  "--sb-hover-bg": "rgba(255,255,255,0.05)",
  "--sb-logo-bg": "#1e293b",
  "--sb-logo-text": "#818cf8",
  "--sb-scrollbar": "rgba(255,255,255,0.1)",
  "--sb-scroll-bg": "rgba(255,255,255,0.02)",
  "--sb-item-radius": "0.5rem",
  "--sb-item-padding": "0.5rem 0.75rem",
  "--sb-item-gap": "0.125rem",
};

/** تم گرادیانت — بنفش رنگی با افکت شیشه‌ای */
const GRADIENT: SidebarThemeVars = {
  "--sb-bg": "linear-gradient(160deg, #4f46e5, #7c3aed, #9333ea)",
  "--sb-text": "rgba(255,255,255,0.9)",
  "--sb-text-muted": "rgba(255,255,255,0.4)",
  "--sb-border": "rgba(255,255,255,0.1)",
  "--sb-search-bg": "rgba(255,255,255,0.12)",
  "--sb-search-text": "rgba(255,255,255,0.7)",
  "--sb-group-label": "rgba(255,255,255,0.35)",
  "--sb-active-bg": "rgba(255,255,255,0.18)",
  "--sb-active-text": "#ffffff",
  "--sb-hover-bg": "rgba(255,255,255,0.08)",
  "--sb-logo-bg": "rgba(255,255,255,0.15)",
  "--sb-logo-text": "#ffffff",
  "--sb-scrollbar": "rgba(255,255,255,0.15)",
  "--sb-scroll-bg": "rgba(255,255,255,0.03)",
  "--sb-item-radius": "0.75rem",
  "--sb-item-padding": "0.625rem 0.75rem",
  "--sb-item-gap": "0.25rem",
};


/** تم شیشه‌ای — روشن با افکت Blur */
const GLASS: SidebarThemeVars = {
  "--sb-bg": "rgba(255, 255, 255, 0.7)",
  "--sb-text": "#1f2937",
  "--sb-text-muted": "#6b7280",
  "--sb-border": "rgba(0, 0, 0, 0.05)",
  "--sb-search-bg": "rgba(0, 0, 0, 0.03)",
  "--sb-search-text": "#6b7280",
  "--sb-group-label": "#9ca3af",
  "--sb-active-bg": "rgba(15, 23, 42, 0.06)",
  "--sb-active-text": "#111827",
  "--sb-hover-bg": "rgba(0, 0, 0, 0.03)",
  "--sb-logo-bg": "#000000",
  "--sb-logo-text": "#ffffff",
  "--sb-scrollbar": "rgba(0, 0, 0, 0.1)",
  "--sb-scroll-bg": "transparent",
  "--sb-item-radius": "0.75rem",
  "--sb-item-padding": "0.5rem 0.75rem",
  "--sb-item-gap": "0.125rem",
};

/** تم شیشه‌ای تاریک */
const GLASS_DARK: SidebarThemeVars = {
  "--sb-bg": "rgba(15, 23, 42, 0.7)",
  "--sb-text": "#f1f5f9",
  "--sb-text-muted": "#94a3b8",
  "--sb-border": "rgba(255, 255, 255, 0.05)",
  "--sb-search-bg": "rgba(255, 255, 255, 0.05)",
  "--sb-search-text": "#cbd5e1",
  "--sb-group-label": "#64748b",
  "--sb-active-bg": "rgba(255, 255, 255, 0.1)",
  "--sb-active-text": "#ffffff",
  "--sb-hover-bg": "rgba(255, 255, 255, 0.05)",
  "--sb-logo-bg": "#ffffff",
  "--sb-logo-text": "#0f172a",
  "--sb-scrollbar": "rgba(255, 255, 255, 0.1)",
  "--sb-scroll-bg": "transparent",
  "--sb-item-radius": "0.75rem",
  "--sb-item-padding": "0.5rem 0.75rem",
  "--sb-item-gap": "0.125rem",
};

export const SIDEBAR_THEMES: SidebarThemeDef[] = [
  {
    id: "sidebar-auto",
    label: "هماهنگ با تم",
    labelEn: "Auto",
    desc: "رنگ سایدبار از تم اصلی گرفته شود",
    accent: "#6b7280",
    vars: LIGHT, // مقدار پیش‌فرض — applySidebarTheme این تم را نادیده می‌گیرد
  },
  {
    id: "sidebar-light",
    label: "روشن",
    labelEn: "Light",
    desc: "سایدبار سفید مینیمال",
    accent: "#4f46e5",
    vars: LIGHT,
  },
  {
    id: "sidebar-dark",
    label: "تاریک",
    labelEn: "Dark",
    desc: "سایدبار مشکی مدرن",
    accent: "#818cf8",
    vars: DARK,
  },
  {
    id: "sidebar-glass",
    label: "شیشه‌ای",
    labelEn: "Glass",
    desc: "سایدبار با افکت مات",
    accent: "#6b7280",
    vars: GLASS,
  },
  {
    id: "sidebar-glass-dark",
    label: "شیشه‌ای تاریک",
    labelEn: "Glass Dark",
    desc: "سایدبار تاریک مات",
    accent: "#f1f5f9",
    vars: GLASS_DARK,
  },
  {
    id: "sidebar-gradient",
    label: "گرادیانت",
    labelEn: "Gradient",
    desc: "سایدبار رنگی بنفش",
    accent: "#a855f7",
    vars: GRADIENT,
  },
];

/** اعمال متغیرهای تم سایدبار روی document */
export function applySidebarTheme(themeId: string): void {
  if (themeId === "sidebar-auto" || !themeId) return; // هماهنگ با تم اصلی — کاری نکن
  const theme = SIDEBAR_THEMES.find((t) => t.id === themeId);
  if (!theme || !theme.vars) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}

/** بازنشانی متغیرهای سایدبار به مقدار پیش‌فرض */
export function resetSidebarTheme(): void {
  applySidebarTheme("sidebar-light");
}

/** دریافت تم فعال سایدبار */
export function getCurrentSidebarTheme(): string {
  return localStorage.getItem("clubinex-sidebar-theme") || "sidebar-dark";
}

/** پیش‌نمایش رنگ‌ها برای نمایش در settings */
export const SIDEBAR_THEME_PREVIEWS: Record<string, { bg: string; text: string; search: string; active: string; border: string; group: string; itemRadius: string }> = {
  "sidebar-auto": { bg: "var(--sb-bg, #ffffff)", text: "var(--sb-text, #374151)", search: "var(--sb-search-bg, #f3f4f6)", active: "var(--sb-active-bg, #eef2ff)", border: "var(--sb-border, #e5e7eb)", group: "var(--sb-group-label, #9ca3af)", itemRadius: "0.5rem" },
  "sidebar-light": { bg: "#ffffff", text: "#374151", search: "#f3f4f6", active: "#eef2ff", border: "#e5e7eb", group: "#9ca3af", itemRadius: "0.5rem" },
  "sidebar-dark": { bg: "#0f172a", text: "#cbd5e1", search: "rgba(255,255,255,0.07)", active: "rgba(99,102,241,0.2)", border: "rgba(255,255,255,0.06)", group: "#475569", itemRadius: "0.5rem" },
  "sidebar-gradient": { bg: "linear-gradient(160deg, #4f46e5, #7c3aed, #9333ea)", text: "rgba(255,255,255,0.9)", search: "rgba(255,255,255,0.12)", active: "rgba(255,255,255,0.18)", border: "rgba(255,255,255,0.1)", group: "rgba(255,255,255,0.35)", itemRadius: "0.75rem" },
  "sidebar-glass": { bg: "rgba(255, 255, 255, 0.7)", text: "#1f2937", search: "rgba(0, 0, 0, 0.03)", active: "rgba(15, 23, 42, 0.06)", border: "rgba(0, 0, 0, 0.05)", group: "#9ca3af", itemRadius: "0.75rem" },
  "sidebar-glass-dark": { bg: "rgba(15, 23, 42, 0.7)", text: "#f1f5f9", search: "rgba(255, 255, 255, 0.05)", active: "rgba(255, 255, 255, 0.1)", border: "rgba(255, 255, 255, 0.05)", group: "#64748b", itemRadius: "0.75rem" },
};
