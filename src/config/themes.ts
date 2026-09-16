/**
 * Clubinex Commerce — 12 Premium Theme Presets with Layout Variations
 * Each theme includes: colors, layout style, and component variants
 */

export interface ThemePreset {
  id: string;
  name: string;
  nameFa: string;
  preview: string;
  accentPreview: string;
  layout: "default" | "compact" | "spacious" | "boxed";
  cardStyle: "clay" | "flat" | "glass" | "neumorphic";
  vars: Record<string, string>;
  darkVars?: Record<string, string>;
}

export const THEME_PRESETS: ThemePreset[] = [
  // ─── VIBRANT LIGHT THEMES ───
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    nameFa: "ایندیگو سلطنتی",
    preview: "oklch(0.50 0.18 270)",
    accentPreview: "oklch(0.70 0.15 320)",
    layout: "default",
    cardStyle: "clay",
    vars: {
      "--primary": "oklch(0.50 0.18 270)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.70 0.15 320)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--background": "oklch(0.98 0.005 270)",
      "--foreground": "oklch(0.15 0.02 270)",
      "--card": "oklch(1.0 0 0)",
      "--card-foreground": "oklch(0.15 0.02 270)",
      "--muted": "oklch(0.96 0.01 270)",
      "--muted-foreground": "oklch(0.42 0.02 270)",
      "--border": "oklch(0.92 0.01 270)",
      "--input": "oklch(0.94 0.008 270)",
      "--ring": "oklch(0.50 0.18 270)",
      "--destructive": "oklch(0.58 0.22 25)",
      "--sidebar": "oklch(0.97 0.008 270)",
    },
    darkVars: {
      "--primary": "oklch(0.65 0.20 270)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.65 0.18 320)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.65 0.20 270)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "ocean-tide",
    name: "Ocean Tide",
    nameFa: "جزر و مد",
    preview: "oklch(0.52 0.15 210)",
    accentPreview: "oklch(0.72 0.14 175)",
    layout: "spacious",
    cardStyle: "glass",
    vars: {
      "--primary": "oklch(0.52 0.15 210)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.72 0.14 175)",
      "--accent-foreground": "oklch(0.20 0.04 210)",
      "--background": "oklch(0.97 0.008 210)",
      "--foreground": "oklch(0.15 0.025 210)",
      "--card": "oklch(0.995 0.003 210)",
      "--card-foreground": "oklch(0.15 0.025 210)",
      "--muted": "oklch(0.95 0.01 210)",
      "--muted-foreground": "oklch(0.42 0.02 210)",
      "--border": "oklch(0.90 0.015 210)",
      "--input": "oklch(0.93 0.01 210)",
      "--ring": "oklch(0.52 0.15 210)",
      "--destructive": "oklch(0.58 0.22 25)",
      "--sidebar": "oklch(0.96 0.012 210)",
    },
    darkVars: {
      "--primary": "oklch(0.62 0.17 210)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.60 0.16 175)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.62 0.17 210)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    nameFa: "جنگل زمردین",
    preview: "oklch(0.52 0.16 155)",
    accentPreview: "oklch(0.75 0.12 85)",
    layout: "default",
    cardStyle: "clay",
    vars: {
      "--primary": "oklch(0.52 0.16 155)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.75 0.12 85)",
      "--accent-foreground": "oklch(0.22 0.04 155)",
      "--background": "oklch(0.97 0.008 155)",
      "--foreground": "oklch(0.15 0.025 155)",
      "--card": "oklch(1.0 0 0)",
      "--card-foreground": "oklch(0.15 0.025 155)",
      "--muted": "oklch(0.95 0.01 155)",
      "--muted-foreground": "oklch(0.40 0.02 155)",
      "--border": "oklch(0.90 0.015 155)",
      "--input": "oklch(0.93 0.01 155)",
      "--ring": "oklch(0.52 0.16 155)",
      "--destructive": "oklch(0.58 0.22 25)",
      "--sidebar": "oklch(0.96 0.012 155)",
    },
    darkVars: {
      "--primary": "oklch(0.62 0.18 155)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.58 0.14 85)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.62 0.18 155)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "sunset-blaze",
    name: "Sunset Blaze",
    nameFa: "شعله غروب",
    preview: "oklch(0.60 0.18 30)",
    accentPreview: "oklch(0.68 0.16 55)",
    layout: "compact",
    cardStyle: "neumorphic",
    vars: {
      "--primary": "oklch(0.60 0.18 30)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.68 0.16 55)",
      "--accent-foreground": "oklch(0.25 0.05 30)",
      "--background": "oklch(0.98 0.008 45)",
      "--foreground": "oklch(0.16 0.025 30)",
      "--card": "oklch(1.0 0.002 45)",
      "--card-foreground": "oklch(0.16 0.025 30)",
      "--muted": "oklch(0.95 0.01 45)",
      "--muted-foreground": "oklch(0.42 0.02 30)",
      "--border": "oklch(0.91 0.015 45)",
      "--input": "oklch(0.93 0.01 45)",
      "--ring": "oklch(0.60 0.18 30)",
      "--destructive": "oklch(0.55 0.22 0)",
      "--sidebar": "oklch(0.96 0.012 45)",
    },
    darkVars: {
      "--primary": "oklch(0.68 0.20 30)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.55 0.18 55)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.68 0.20 30)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "rose-bloom",
    name: "Rose Bloom",
    nameFa: "شکوفه رز",
    preview: "oklch(0.55 0.17 350)",
    accentPreview: "oklch(0.72 0.14 320)",
    layout: "spacious",
    cardStyle: "glass",
    vars: {
      "--primary": "oklch(0.55 0.17 350)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.72 0.14 320)",
      "--accent-foreground": "oklch(0.25 0.05 350)",
      "--background": "oklch(0.98 0.006 350)",
      "--foreground": "oklch(0.16 0.02 350)",
      "--card": "oklch(1.0 0.002 350)",
      "--card-foreground": "oklch(0.16 0.02 350)",
      "--muted": "oklch(0.96 0.008 350)",
      "--muted-foreground": "oklch(0.42 0.02 350)",
      "--border": "oklch(0.91 0.012 350)",
      "--input": "oklch(0.94 0.008 350)",
      "--ring": "oklch(0.55 0.17 350)",
      "--destructive": "oklch(0.58 0.22 25)",
      "--sidebar": "oklch(0.97 0.008 350)",
    },
    darkVars: {
      "--primary": "oklch(0.65 0.19 350)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.60 0.16 320)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.65 0.19 350)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  // ─── PREMIUM DARK THEMES ───
  {
    id: "midnight-obsidian",
    name: "Midnight Obsidian",
    nameFa: "نیمه‌شب ابسیدین",
    preview: "oklch(0.15 0.02 260)",
    accentPreview: "oklch(0.70 0.16 180)",
    layout: "default",
    cardStyle: "glass",
    vars: {
      "--primary": "oklch(0.65 0.15 260)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.70 0.16 180)",
      "--accent-foreground": "oklch(0.10 0.03 260)",
      "--background": "oklch(0.12 0.015 260)",
      "--foreground": "oklch(0.92 0.006 260)",
      "--card": "oklch(0.16 0.018 260)",
      "--card-foreground": "oklch(0.92 0.006 260)",
      "--muted": "oklch(0.20 0.012 260)",
      "--muted-foreground": "oklch(0.55 0.015 260)",
      "--border": "oklch(0.24 0.02 260)",
      "--input": "oklch(0.22 0.018 260)",
      "--ring": "oklch(0.65 0.15 260)",
      "--destructive": "oklch(0.62 0.22 25)",
      "--sidebar": "oklch(0.10 0.018 260)",
    },
    darkVars: {
      "--primary": "oklch(0.70 0.18 260)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.68 0.18 180)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.70 0.18 260)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "dark-ember",
    name: "Dark Ember",
    nameFa: "آتش تاریک",
    preview: "oklch(0.14 0.018 15)",
    accentPreview: "oklch(0.72 0.18 35)",
    layout: "compact",
    cardStyle: "neumorphic",
    vars: {
      "--primary": "oklch(0.62 0.18 20)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.72 0.18 35)",
      "--accent-foreground": "oklch(0.10 0.03 20)",
      "--background": "oklch(0.13 0.015 15)",
      "--foreground": "oklch(0.92 0.006 15)",
      "--card": "oklch(0.17 0.018 15)",
      "--card-foreground": "oklch(0.92 0.006 15)",
      "--muted": "oklch(0.21 0.012 15)",
      "--muted-foreground": "oklch(0.55 0.015 15)",
      "--border": "oklch(0.25 0.02 15)",
      "--input": "oklch(0.23 0.018 15)",
      "--ring": "oklch(0.62 0.18 20)",
      "--destructive": "oklch(0.55 0.22 0)",
      "--sidebar": "oklch(0.11 0.018 15)",
    },
    darkVars: {
      "--primary": "oklch(0.68 0.20 20)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.70 0.20 35)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.68 0.20 20)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "neon-violet",
    name: "Neon Violet",
    nameFa: "بنفش نئونی",
    preview: "oklch(0.14 0.02 290)",
    accentPreview: "oklch(0.78 0.18 300)",
    layout: "default",
    cardStyle: "glass",
    vars: {
      "--primary": "oklch(0.60 0.20 290)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.78 0.18 300)",
      "--accent-foreground": "oklch(0.10 0.04 290)",
      "--background": "oklch(0.12 0.018 290)",
      "--foreground": "oklch(0.92 0.006 290)",
      "--card": "oklch(0.16 0.02 290)",
      "--card-foreground": "oklch(0.92 0.006 290)",
      "--muted": "oklch(0.20 0.015 290)",
      "--muted-foreground": "oklch(0.55 0.015 290)",
      "--border": "oklch(0.24 0.022 290)",
      "--input": "oklch(0.22 0.02 290)",
      "--ring": "oklch(0.60 0.20 290)",
      "--destructive": "oklch(0.62 0.22 25)",
      "--sidebar": "oklch(0.10 0.02 290)",
    },
    darkVars: {
      "--primary": "oklch(0.68 0.22 290)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.76 0.20 300)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.68 0.22 290)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "arctic-frost",
    name: "Arctic Frost",
    nameFa: "یخ قطبی",
    preview: "oklch(0.13 0.012 200)",
    accentPreview: "oklch(0.80 0.10 195)",
    layout: "spacious",
    cardStyle: "flat",
    vars: {
      "--primary": "oklch(0.55 0.10 200)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.80 0.10 195)",
      "--accent-foreground": "oklch(0.15 0.03 200)",
      "--background": "oklch(0.12 0.012 200)",
      "--foreground": "oklch(0.93 0.004 200)",
      "--card": "oklch(0.16 0.015 200)",
      "--card-foreground": "oklch(0.93 0.004 200)",
      "--muted": "oklch(0.20 0.01 200)",
      "--muted-foreground": "oklch(0.55 0.012 200)",
      "--border": "oklch(0.24 0.015 200)",
      "--input": "oklch(0.22 0.012 200)",
      "--ring": "oklch(0.55 0.10 200)",
      "--destructive": "oklch(0.62 0.22 25)",
      "--sidebar": "oklch(0.10 0.012 200)",
    },
    darkVars: {
      "--primary": "oklch(0.65 0.12 200)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.78 0.12 195)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.65 0.12 200)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  // ─── WARM PREMIUM ───
  {
    id: "amber-gold",
    name: "Amber Gold",
    nameFa: "طلای کهربایی",
    preview: "oklch(0.58 0.15 65)",
    accentPreview: "oklch(0.65 0.14 25)",
    layout: "boxed",
    cardStyle: "clay",
    vars: {
      "--primary": "oklch(0.58 0.15 65)",
      "--primary-foreground": "oklch(0.12 0.03 65)",
      "--accent": "oklch(0.65 0.14 25)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--background": "oklch(0.97 0.006 55)",
      "--foreground": "oklch(0.18 0.02 55)",
      "--card": "oklch(1.0 0.003 55)",
      "--card-foreground": "oklch(0.18 0.02 55)",
      "--muted": "oklch(0.95 0.01 55)",
      "--muted-foreground": "oklch(0.42 0.02 55)",
      "--border": "oklch(0.91 0.012 55)",
      "--input": "oklch(0.93 0.008 55)",
      "--ring": "oklch(0.58 0.15 65)",
      "--destructive": "oklch(0.55 0.22 0)",
      "--sidebar": "oklch(0.96 0.01 55)",
    },
    darkVars: {
      "--primary": "oklch(0.68 0.17 65)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.58 0.16 25)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.68 0.17 65)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    nameFa: "صخره مرجانی",
    preview: "oklch(0.60 0.16 15)",
    accentPreview: "oklch(0.70 0.14 180)",
    layout: "default",
    cardStyle: "clay",
    vars: {
      "--primary": "oklch(0.60 0.16 15)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.70 0.14 180)",
      "--accent-foreground": "oklch(0.20 0.04 15)",
      "--background": "oklch(0.98 0.006 15)",
      "--foreground": "oklch(0.16 0.02 15)",
      "--card": "oklch(1.0 0.002 15)",
      "--card-foreground": "oklch(0.16 0.02 15)",
      "--muted": "oklch(0.95 0.01 15)",
      "--muted-foreground": "oklch(0.42 0.02 15)",
      "--border": "oklch(0.91 0.012 15)",
      "--input": "oklch(0.93 0.008 15)",
      "--ring": "oklch(0.60 0.16 15)",
      "--destructive": "oklch(0.55 0.22 25)",
      "--sidebar": "oklch(0.97 0.008 15)",
    },
    darkVars: {
      "--primary": "oklch(0.68 0.18 15)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.58 0.16 180)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.68 0.18 15)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  // ─── SPECIAL THEMES ───
  {
    id: "claymorphism",
    name: "Claymorphism",
    nameFa: "کِلایمورفیزم",
    preview: "oklch(0.65 0.12 260)",
    accentPreview: "oklch(0.75 0.14 200)",
    layout: "default",
    cardStyle: "clay",
    vars: {
      "--primary": "oklch(0.65 0.12 260)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.75 0.14 200)",
      "--accent-foreground": "oklch(0.15 0.03 260)",
      "--background": "oklch(0.96 0.01 250)",
      "--foreground": "oklch(0.16 0.025 260)",
      "--card": "oklch(0.97 0.008 260)",
      "--card-foreground": "oklch(0.16 0.025 260)",
      "--muted": "oklch(0.93 0.012 260)",
      "--muted-foreground": "oklch(0.45 0.02 260)",
      "--border": "oklch(0.88 0.015 260)",
      "--input": "oklch(0.92 0.01 260)",
      "--ring": "oklch(0.65 0.12 260)",
      "--destructive": "oklch(0.58 0.22 25)",
      "--sidebar": "oklch(0.94 0.01 260)",
    },
    darkVars: {
      "--primary": "oklch(0.70 0.14 260)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.72 0.16 200)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.70 0.14 260)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
  {
    id: "notebook",
    name: "Notebook",
    nameFa: "دفترچه یادداشت",
    preview: "oklch(0.55 0.08 80)",
    accentPreview: "oklch(0.50 0.10 260)",
    layout: "default",
    cardStyle: "flat",
    vars: {
      "--primary": "oklch(0.48 0.08 250)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--accent": "oklch(0.55 0.08 80)",
      "--accent-foreground": "oklch(0.15 0.02 80)",
      "--background": "oklch(0.98 0.004 80)",
      "--foreground": "oklch(0.18 0.015 80)",
      "--card": "oklch(1.0 0.002 80)",
      "--card-foreground": "oklch(0.18 0.015 80)",
      "--muted": "oklch(0.95 0.008 80)",
      "--muted-foreground": "oklch(0.44 0.02 80)",
      "--border": "oklch(0.88 0.012 80)",
      "--input": "oklch(0.93 0.008 80)",
      "--ring": "oklch(0.48 0.08 250)",
      "--destructive": "oklch(0.55 0.22 25)",
      "--sidebar": "oklch(0.96 0.006 80)",
    },
    darkVars: {
      "--primary": "oklch(0.58 0.10 250)",
      "--primary-foreground": "oklch(0.98 0.01 0)",
      "--accent": "oklch(0.60 0.10 80)",
      "--accent-foreground": "oklch(0.98 0.01 0)",
      "--background": "oklch(0.14 0.005 270)", 
      "--foreground": "oklch(0.92 0.005 270)",
      "--card": "oklch(0.17 0.005 270)",
      "--card-foreground": "oklch(0.92 0.005 270)",
      "--muted": "oklch(0.23 0.01 270)",
      "--muted-foreground": "oklch(0.65 0.01 270)",
      "--border": "oklch(0.23 0.01 270)",
      "--input": "oklch(0.23 0.01 270)",
      "--ring": "oklch(0.58 0.10 250)",
      "--sidebar": "oklch(0.11 0.005 270)",
    },
  },
];

/** Apply a theme preset by setting CSS variables on <html>.
 * Also derives sidebar CSS variables (--sb-*) from the theme colors
 * so that the sidebar matches the overall theme.
 */
export function applyTheme(themeId: string) {
  const preset = THEME_PRESETS.find((t) => t.id === themeId);
  if (!preset) return;
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const vars = isDark && preset.darkVars ? { ...preset.vars, ...preset.darkVars } : preset.vars;

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  // همیشه متغیرهای سایدبار را از تم اصلی مشتق کن
  // اگر تم سایدبار جداگانه تنظیم شده باشد، sidebar-themes آنها را رونویسی می‌کند
  const primary = vars["--primary"] || "oklch(0.50 0.18 270)";
  const fg = vars["--foreground"] || "oklch(0.15 0.02 270)";
  const muted = vars["--muted"] || "oklch(0.96 0.01 270)";
  const border = vars["--border"] || "oklch(0.92 0.01 270)";
  const cardBg = vars["--card"] || "oklch(1.0 0 0)";
  root.style.setProperty("--sb-bg", cardBg);
  root.style.setProperty("--sb-text", fg);
  root.style.setProperty("--sb-text-muted", vars["--muted-foreground"] || "#6b7280");
  root.style.setProperty("--sb-border", border);
  root.style.setProperty("--sb-search-bg", muted);
  root.style.setProperty("--sb-search-text", vars["--muted-foreground"] || "#6b7280");
  root.style.setProperty("--sb-group-label", vars["--muted-foreground"] || "#9ca3af");
  root.style.setProperty("--sb-active-bg", "color-mix(in oklch, " + primary + " 10%, transparent)");
  root.style.setProperty("--sb-active-text", primary);
  root.style.setProperty("--sb-hover-bg", muted);
  root.style.setProperty("--sb-logo-bg", primary);
  root.style.setProperty("--sb-logo-text", vars["--primary-foreground"] || "#ffffff");
  root.style.setProperty("--sb-scrollbar", border);
  // اگر تم سایدبار ذخیره شده باشد، آن را اعمال کن تا رنگ‌های مشتق‌شده را رونویسی کند
  const savedSidebarTheme = localStorage.getItem("clubinex-sidebar-theme");
  if (savedSidebarTheme && savedSidebarTheme !== "auto") {
    // applySidebarTheme بعداً توسط Sidebar.tsx اعمال می‌شود
  }

  // Apply layout class
  root.removeAttribute("data-theme-layout");
  root.setAttribute("data-theme-layout", preset.layout);

  // Apply card style class
  root.removeAttribute("data-theme-card");
  root.setAttribute("data-theme-card", preset.cardStyle);

  localStorage.setItem("clubinex-theme", themeId);

  // Update browser theme-color meta tag (for mobile status bar + desktop toolbar)
  updateBrowserThemeColor(vars["--primary"] || "#6366f1");
}

/** Apply font to the document */
export function applyFont(fontFamily: string, fontSize?: string) {
  const root = document.documentElement;
  const fontMap: Record<string, string> = {
    Vazirmatn: "Vazirmatn, sans-serif",
    IRANSans: "IRANSans, sans-serif",
    YekanBakh: "YekanBakh, sans-serif",
    Shabnam: "Shabnam, sans-serif",
    Tahoma: "Tahoma, sans-serif",
    "system-ui": "system-ui, sans-serif",
  };
  root.style.setProperty("--font-family", fontMap[fontFamily] || fontFamily);
  root.style.fontFamily = fontMap[fontFamily] || fontFamily;
  if (fontSize) root.style.setProperty("--font-size-base", `${fontSize}px`);
  localStorage.setItem("clubinex-font", fontFamily);
  if (fontSize) localStorage.setItem("clubinex-fontSize", fontSize);
}

/** Load saved theme from localStorage and apply it */
export function loadSavedTheme() {
  // Restore dark mode state
  const savedDarkMode = localStorage.getItem("clubinex-dark-mode");
  if (savedDarkMode === "true") {
    document.documentElement.classList.add("dark");
  }
  let saved = localStorage.getItem("clubinex-theme");
  if (!saved) {
    saved = "royal-indigo";
    localStorage.setItem("clubinex-theme", saved);
  }
  applyTheme(saved);
  const savedFont = localStorage.getItem("clubinex-font");
  const savedFontSize = localStorage.getItem("clubinex-fontSize");
  if (savedFont) applyFont(savedFont, savedFontSize || undefined);
  // Restore browser theme-color
  const savedThemeColor = localStorage.getItem("clubinex-browser-theme-color");
  if (savedThemeColor) updateBrowserThemeColor(savedThemeColor);
}

/** به‌روزرسانی رنگ نوار مرورگر (theme-color) — هم موبایل و هم دسکتاپ */
export function updateBrowserThemeColor(color: string) {
  const meta = document.getElementById("theme-color-meta") as HTMLMetaElement | null;
  if (meta) {
    meta.content = color;
  }
  localStorage.setItem("clubinex-browser-theme-color", color);
}

/** دریافت رنگ نوار مرورگر ذخیره‌شده */
export function getBrowserThemeColor(): string {
  return localStorage.getItem("clubinex-browser-theme-color") || "#6366f1";
}

/** Get the current theme ID from localStorage */
export function getCurrentTheme(): string {
  return localStorage.getItem("clubinex-theme") || "royal-indigo";
}
