/**
 * 🧪 تست‌های واحد برای ماژول sanitize
 * ============================================================
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  sanitizeAttr,
  stripHtml,
  sanitizeTextInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizePostalCode,
  sanitizeUrl,
  validators,
  ClientRateLimiter,
} from "@/lib/sanitize";

describe("sanitizeHtml", () => {
  it("باید کاراکترهای HTML را escape کند", () => {
    // / is also escaped to &#x2F;
    expect(sanitizeHtml("<b>test</b>")).toBe("&lt;b&gt;test&lt;&#x2F;b&gt;");
    expect(sanitizeHtml("a & b")).toBe("a &amp; b");
  });

  it("باید کوئیت و quote را escape کند", () => {
    expect(sanitizeHtml(`"hello"`)).toContain("&quot;");
    expect(sanitizeHtml(`'hello'`)).toContain("&#x27;");
  });

  it("متن عادی نباید تغییر کند", () => {
    expect(sanitizeHtml("سلام دنیا")).toBe("سلام دنیا");
    expect(sanitizeHtml("۱۲۳۴۵۶۷۸۹۰")).toBe("۱۲۳۴۵۶۷۸۹۰");
  });
});

describe("stripHtml", () => {
  it("باید تمام تگ‌ها را حذف کند", () => {
    expect(stripHtml("<p>text</p>")).toBe("text");
    expect(stripHtml('<div class="x">hello</div>')).toBe("hello");
  });

  it("ورودی غیررشته باید خالی برگرداند", () => {
    expect(stripHtml(null as any)).toBe("");
    expect(stripHtml(123 as any)).toBe("");
  });
});

describe("sanitizeEmail", () => {
  it("باید lowercase کند", () => {
    expect(sanitizeEmail("Test@Example.COM")).toBe("test@example.com");
  });

  it("باید فاصله‌ها را حذف کند", () => {
    expect(sanitizeEmail("  test@test.com  ")).toBe("test@test.com");
  });

  it("باید طول را محدود کند (RFC 5321)", () => {
    const longEmail = "a".repeat(300) + "@test.com";
    expect(sanitizeEmail(longEmail).length).toBeLessThanOrEqual(254);
  });
});

describe("sanitizePhone", () => {
  it("باید فقط اعداد و کاراکترهای مجاز باقی بگذارد", () => {
    // - is allowed in the regex [0-9+\-]
    expect(sanitizePhone("0912-123-4567")).toBe("0912-123-4567");
    expect(sanitizePhone("+989121234567")).toBe("+989121234567");
    // abc should be stripped
    expect(sanitizePhone("0912abc1234")).toBe("09121234");
  });
});

describe("sanitizePostalCode", () => {
  it("باید فقط اعداد باقی بگذارد", () => {
    expect(sanitizePostalCode("12-345-67890")).toBe("1234567890");
    expect(sanitizePostalCode("1234567890")).toBe("1234567890");
  });

  it("باید طول را محدود کند", () => {
    expect(sanitizePostalCode("123456789012").length).toBeLessThanOrEqual(10);
  });
});

describe("sanitizeUrl", () => {
  it("URL معتبر HTTP/HTTPS باید تأیید شود", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    expect(sanitizeUrl("http://example.com/path")).toBe("http://example.com/path");
  });

  it("URL غیرمجاز باید خالی برگردد", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("data:text/html,<script>")).toBe("");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("");
    expect(sanitizeUrl("ftp://server.com")).toBe("");
  });

  it("URL با کاراکترهای خطرناک باید فیلتر شود", () => {
    expect(sanitizeUrl('https://example.com"><script>')).toBe("https://example.comscript");
  });
});

describe("ClientRateLimiter", () => {
  it("باید تعداد تلاش‌ها را ردیابی کند", () => {
    const limiter = new ClientRateLimiter(3, 60000);

    expect(limiter.check("test").allowed).toBe(true);
    expect(limiter.check("test").allowed).toBe(true);
    expect(limiter.check("test").remaining).toBe(0);
  });

  it("باید بعد از حداکثر تلاش قفل کند", () => {
    const limiter = new ClientRateLimiter(2, 60000);

    limiter.check("test");
    limiter.check("test");

    const result = limiter.check("test");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("reset باید شمارشگر را صفر کند", () => {
    const limiter = new ClientRateLimiter(3, 60000);

    limiter.check("test");
    limiter.check("test");
    limiter.reset("test");

    expect(limiter.check("test").remaining).toBe(2);
  });
});

describe("validators", () => {
  it("ایمیل صحیح باید تأیید شود", () => {
    expect(validators.email("test@example.com").valid).toBe(true);
    expect(validators.email("bad").valid).toBe(false);
  });

  it("تلفن صحیح باید تأیید شود", () => {
    expect(validators.phone("09121234567").valid).toBe(true);
    expect(validators.phone("123").valid).toBe(false);
  });

  it("تعداد صحیح باید تأیید شود", () => {
    expect(validators.quantity(1).valid).toBe(true);
    expect(validators.quantity(0).valid).toBe(false);
    expect(validators.quantity(-1).valid).toBe(false);
    expect(validators.quantity(0.5).valid).toBe(false);
  });

  it("مبلغ صحیح باید تأیید شود", () => {
    expect(validators.orderAmount(1000).valid).toBe(true);
    expect(validators.orderAmount(0).valid).toBe(false);
    expect(validators.orderAmount(-100).valid).toBe(false);
  });
});
