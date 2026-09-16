// تست‌های واحد تولید اسلاگ / Unit tests for slug generation
import { describe, it, expect } from "vitest";

// Replicate the slug generation logic from the backend
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, "") // Remove Farsi characters
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumeric, spaces, hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
}

describe("slug generation", () => {
  it("converts simple name to slug", () => {
    expect(generateSlug("Test Product")).toBe("test-product");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("Test   Multiple   Spaces")).toBe("test-multiple-spaces");
  });

  it("removes special characters", () => {
    expect(generateSlug("Test @#$ Product!")).toBe("test-product");
  });

  it("handles Farsi characters (removes them)", () => {
    expect(generateSlug("محصول تستی Product")).toBe("product");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug("-Test Product-")).toBe("test-product");
  });

  it("handles numbers", () => {
    expect(generateSlug("Product 123 Pro")).toBe("product-123-pro");
  });

  it("handles mixed Farsi and English", () => {
    expect(generateSlug("iPhone 15 اپل")).toBe("iphone-15");
  });
});
