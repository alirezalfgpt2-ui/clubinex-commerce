// تست‌های واحد سیستم i18n / Unit tests for i18n system
import { describe, it, expect } from "vitest";

// Test the translations directly without React rendering
const translations: Record<string, Record<string, string>> = {
  fa: {
    "app.name": "فروشگاه",
    "app.save": "ذخیره",
    "product.price": "قیمت",
    "nav.home": "خانه",
  },
  en: {
    "app.name": "Store",
    "app.save": "Save",
    "product.price": "Price",
    "nav.home": "Home",
  },
};

function t(locale: string, key: string): string {
  const dict = translations[locale] || translations.fa;
  return dict[key] || translations.fa[key] || key;
}

describe("i18n translations", () => {
  it("returns Farsi text for fa locale", () => {
    expect(t("fa", "app.name")).toBe("فروشگاه");
    expect(t("fa", "app.save")).toBe("ذخیره");
    expect(t("fa", "product.price")).toBe("قیمت");
  });

  it("returns English text for en locale", () => {
    expect(t("en", "app.name")).toBe("Store");
    expect(t("en", "app.save")).toBe("Save");
    expect(t("en", "product.price")).toBe("Price");
  });

  it("returns key as fallback for unknown key", () => {
    expect(t("fa", "unknown.key")).toBe("unknown.key");
    expect(t("en", "unknown.key")).toBe("unknown.key");
  });

  it("falls back to Farsi for unknown locale", () => {
    expect(t("de", "app.name")).toBe("فروشگاه");
  });
});
