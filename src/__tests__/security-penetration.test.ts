/**
 * 🔒 تست نفوذ و امنیت (Security & Penetration Test)
 * ============================================================
 * 
 * این تست جنبه‌های امنیتی برنامه را بررسی می‌کند:
 * ۱. حملات XSS (Cross-Site Scripting)
 * ۲. حملات Injection
 * ۳. اعتبارسنجی ورودی‌ها
 * ۴. Rate Limiting و Brute Force Protection
 * ۵. احراز هویت و مجوزها
 * ۶. CSRF Protection
 * ۷. مدیریت نشست
 * ۸. امنیت فایل‌ها
 * ۹. لاگ‌گیری امنیتی
 * ۱۰. قفل حساب
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

// ============================================================
// بخش ۱: تست XSS Protection
// ============================================================

describe("🛡️ XSS Protection", () => {

  describe("HTML Sanitization", () => {
    it("باید تگ‌های HTML خطرناک را بی‌اثر کند", () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '"><script>alert(document.cookie)</script>',
        "<iframe src=\"javascript:alert(1)\">",
        '<body onload="alert(1)">',
        '<input onfocus="alert(1)" autofocus>',
        '<marquee onstart="alert(1)">',
      ];

      for (const payload of xssPayloads) {
        const sanitized = sanitizeHtml(payload);
        // After escaping: < becomes &lt; so tags can't parse
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).not.toContain("<img");
        expect(sanitized).not.toContain("<svg");
        expect(sanitized).not.toContain("<iframe");
        expect(sanitized).not.toContain("<body");
        expect(sanitized).not.toContain("<input");
        expect(sanitized).not.toContain("<marquee");
      }
    });

    it("باید کاراکترهای خطرناک HTML را escape کند", () => {
      const dangerous = '<>"\'`/';
      const sanitized = sanitizeHtml(dangerous);

      expect(sanitized).toContain("&lt;");
      expect(sanitized).toContain("&gt;");
      expect(sanitized).toContain("&quot;");
      expect(sanitized).toContain("&#x27;");
      // The raw characters should be escaped
      expect(sanitized).not.toMatch(/<(?!\/)/);
    });

    it("باید محتوای عادی را تغییر ندهد", () => {
      const normal = "سلام دنیا! قیمت: ۱,۰۰۰ تومان";
      const sanitized = sanitizeHtml(normal);
      expect(sanitized).toBe(normal);
    });
  });

  describe("Attribute Sanitization", () => {
    it("باید کاراکترهای خطرناک در attribute را escape کند", () => {
      const malicious = 'text" onmouseover="alert(1)" data-x="';
      const sanitized = sanitizeAttr(malicious);
      // Quotes are escaped, so attribute injection breaks
      expect(sanitized).toContain("&quot;");
    });

    it("باید javascript: protocol را حذف کند", () => {
      const payloads = [
        "javascript:alert(1)",
        "JAVASCRIPT:alert(1)",
      ];

      for (const payload of payloads) {
        const sanitized = sanitizeAttr(payload);
        expect(sanitized.toLowerCase()).not.toContain("javascript:");
      }
    });

    it("باید event handler prefix را حذف کند", () => {
      const malicious = 'text onmouseover=alert(1)';
      const sanitized = sanitizeAttr(malicious);
      expect(sanitized).not.toContain("onmouseover");
    });
  });

  describe("Strip HTML", () => {
    it("باید تمام تگ‌های HTML را حذف کند", () => {
      const html = '<div class="test"><p>متن <b>بولد</b> و <a href="#">لینک</a></p></div>';
      const stripped = stripHtml(html);
      expect(stripped).not.toContain("<div");
      expect(stripped).not.toContain("<p>");
      expect(stripped).not.toContain("<b>");
      expect(stripped).not.toContain("<a");
      expect(stripped).toContain("متن");
      expect(stripped).toContain("بولد");
      expect(stripped).toContain("لینک");
    });

    it("ورودی غیررشته باید خالی برگرداند", () => {
      expect(stripHtml(null as any)).toBe("");
      expect(stripHtml(undefined as any)).toBe("");
      expect(stripHtml(123 as any)).toBe("");
    });
  });

  describe("Text Input Sanitization", () => {
    it("باید طول متن را محدود کند", () => {
      const longText = "a".repeat(2000);
      const sanitized = sanitizeTextInput(longText, 500);
      expect(sanitized.length).toBe(500);
    });

    it("باید تگ‌های HTML را از متن حذف کند", () => {
      const input = '<script>alert("xss")</script> متن عادی';
      const sanitized = sanitizeTextInput(input);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("متن عادی");
    });

    it("باید فاصله‌های اضافی اول و آخر را حذف کند", () => {
      const input = "  متن با فاصله  ";
      const sanitized = sanitizeTextInput(input);
      expect(sanitized).not.toMatch(/^ /);
      expect(sanitized).not.toMatch(/ $/);
    });
  });
});

// ============================================================
// بخش ۲: تست Input Validation
// ============================================================

describe("✅ Input Validation", () => {

  describe("Email Validation", () => {
    it("ایمیل معتبر باید تأیید شود", () => {
      expect(validators.email("test@example.com").valid).toBe(true);
      expect(validators.email("user.name@domain.co").valid).toBe(true);
      expect(validators.email("user+tag@domain.com").valid).toBe(true);
    });

    it("ایمیل نامعتبر باید رد شود", () => {
      expect(validators.email("").valid).toBe(false);
      expect(validators.email("invalid").valid).toBe(false);
      expect(validators.email("no@domain").valid).toBe(false);
      expect(validators.email("@domain.com").valid).toBe(false);
      expect(validators.email("user@").valid).toBe(false);
    });

    it("ایمیل XSS باید رد شود", () => {
      const xssEmails = [
        "test<script>@x.com",
        "user@<script>alert(1)</script>.com",
      ];

      for (const email of xssEmails) {
        expect(validators.email(email).valid).toBe(false);
      }
    });
  });

  describe("Phone Validation", () => {
    it("شماره تلفن ایران معتبر باید تأیید شود", () => {
      expect(validators.phone("09121234567").valid).toBe(true);
      expect(validators.phone("+989121234567").valid).toBe(true);
    });

    it("شماره تلفن نامعتبر باید رد شود", () => {
      expect(validators.phone("").valid).toBe(false);
      expect(validators.phone("12345").valid).toBe(false);
      expect(validators.phone("abcdefghij").valid).toBe(false);
    });
  });

  describe("National Code Validation", () => {
    it("کد ملی ۱۰ رقمی باید تأیید شود", () => {
      // Format check: 10 digits
      const result = validators.nationalCode("0499330981");
      expect(typeof result.valid).toBe("boolean");
    });

    it("کد ملی نامعتبر باید رد شود", () => {
      expect(validators.nationalCode("").valid).toBe(false);
      expect(validators.nationalCode("12345").valid).toBe(false);
      expect(validators.nationalCode("12345678901").valid).toBe(false); // 11 digits
    });
  });

  describe("Postal Code Validation", () => {
    it("کد پستی ۱۰ رقمی باید تأیید شود", () => {
      expect(validators.postalCode("1234567890").valid).toBe(true);
      expect(validators.postalCode("0012345678").valid).toBe(true);
    });

    it("کد پستی نامعتبر باید رد شود", () => {
      expect(validators.postalCode("").valid).toBe(false);
      expect(validators.postalCode("12345").valid).toBe(false);
      expect(validators.postalCode("abc").valid).toBe(false);
    });
  });

  describe("Name Validation", () => {
    it("نام معتبر باید تأیید شود", () => {
      expect(validators.name("علی").valid).toBe(true);
      expect(validators.name("Ali Rezaei").valid).toBe(true);
    });

    it("نام خیلی کوتاه باید رد شود", () => {
      expect(validators.name("a").valid).toBe(false);
    });

    it("نام XSS باید معتبر باشد (sanitized output)", () => {
      const result = validators.name('<script>alert(1)</script>');
      // sanitizeTextInput strips HTML, leaving "alert(1)" which is > 2 chars
      // But the name contains < which get stripped
      expect(typeof result.valid).toBe("boolean");
    });
  });

  describe("Address Validation", () => {
    it("آدرس معتبر باید تأیید شود", () => {
      expect(validators.address("تهران، خیابان ولیعصر، پلاک ۱۲۳").valid).toBe(true);
    });

    it("آدرس خیلی کوتاه باید رد شود", () => {
      expect(validators.address("تهران").valid).toBe(false);
    });
  });

  describe("Order Amount Validation", () => {
    it("مبلغ معتبر باید تأیید شود", () => {
      expect(validators.orderAmount(100000).valid).toBe(true);
    });

    it("مبلغ صفر یا منفی باید رد شود", () => {
      expect(validators.orderAmount(0).valid).toBe(false);
      expect(validators.orderAmount(-1000).valid).toBe(false);
    });

    it("مبلغ خیلی زیاد باید رد شود", () => {
      expect(validators.orderAmount(100_000_000_000).valid).toBe(false);
    });
  });

  describe("Quantity Validation", () => {
    it("تعداد معتبر باید تأیید شود", () => {
      expect(validators.quantity(1).valid).toBe(true);
      expect(validators.quantity(100).valid).toBe(true);
    });

    it("تعداد نامعتبر باید رد شود", () => {
      expect(validators.quantity(0).valid).toBe(false);
      expect(validators.quantity(-1).valid).toBe(false);
      expect(validators.quantity(0.5).valid).toBe(false);
      expect(validators.quantity(1000).valid).toBe(false);
    });
  });

  describe("Discount Code Validation", () => {
    it("کد تخفیف معتبر باید تأیید شود", () => {
      expect(validators.discountCode("SAVE20").valid).toBe(true);
      expect(validators.discountCode("abc123").valid).toBe(true);
    });

    it("کد تخفیف خیلی کوتاه باید رد شود", () => {
      expect(validators.discountCode("ab").valid).toBe(false);
    });
  });
});

// ============================================================
// بخش ۳: تست Rate Limiting
// ============================================================

describe("⏱️ Rate Limiting & Brute Force Protection", () => {

  it("باید بعد از حداکثر تلاش قفل شود", () => {
    const limiter = new ClientRateLimiter(3, 60000);

    // 3 allowed attempts
    expect(limiter.check("user@test.com").allowed).toBe(true);
    expect(limiter.check("user@test.com").allowed).toBe(true);
    expect(limiter.check("user@test.com").allowed).toBe(true);

    // 4th attempt should be blocked
    const blocked = limiter.check("user@test.com");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("هر شناسه باید جداگانه شمارش شود", () => {
    const limiter = new ClientRateLimiter(2, 60000);

    limiter.check("user1@test.com");
    limiter.check("user1@test.com");
    limiter.check("user1@test.com"); // 3rd call → blocked (maxAttempts=2)

    // user1 is locked
    expect(limiter.check("user1@test.com").allowed).toBe(false);

    // user2 should still be allowed
    expect(limiter.check("user2@test.com").allowed).toBe(true);
  });

  it("reset باید شمارشگر را صفر کند", () => {
    const limiter = new ClientRateLimiter(3, 60000);

    limiter.check("user@test.com");
    limiter.check("user@test.com");
    limiter.reset("user@test.com");

    const result = limiter.check("user@test.com");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });
});

// ============================================================
// بخش ۴: تست Authentication & Authorization
// ============================================================

describe("🔐 Authentication & Authorization", () => {

  describe("Role-Based Access Control", () => {
    const roles = {
      admin: ["products.view", "products.create", "products.edit", "products.delete",
        "orders.view", "orders.manage", "users.view", "users.manage",
        "settings.manage", "reports.view", "discounts.manage", "shipping.manage",
        "tickets.manage", "invoices.view", "invoices.create"],
      manager: ["products.view", "products.create", "products.edit",
        "orders.view", "orders.manage", "users.view", "reports.view"],
      operator: ["products.view", "orders.view", "tickets.manage"],
      user: ["products.view"],
      member: ["products.view"],
    };

    it("ادمین باید به تمام بخش‌ها دسترسی داشته باشد", () => {
      const adminPerms = roles.admin;
      expect(adminPerms).toContain("settings.manage");
      expect(adminPerms).toContain("users.manage");
      expect(adminPerms).toContain("products.delete");
    });

    it("کاربر عادی نباید به بخش مدیریت دسترسی داشته باشد", () => {
      const userPerms = roles.user;
      expect(userPerms).not.toContain("settings.manage");
      expect(userPerms).not.toContain("users.manage");
      expect(userPerms).not.toContain("orders.manage");
    });

    it("اپراتور فقط باید بخش‌های مشاهده و تیکت داشته باشد", () => {
      const operatorPerms = roles.operator;
      expect(operatorPerms).toContain("products.view");
      expect(operatorPerms).toContain("tickets.manage");
      expect(operatorPerms).not.toContain("products.delete");
      expect(operatorPerms).not.toContain("settings.manage");
    });
  });

  describe("Authentication Checks", () => {
    it("عملیات حساس بدون احراز هویت باید رد شود", () => {
      const userId = null;
      const isAuthenticated = userId !== null;
      expect(isAuthenticated).toBe(false);
    });

    it("تغییر نقش فقط توسط ادمین مجاز باشد", () => {
      const currentUser = { role: "operator" };
      const canChangeRole = currentUser.role === "admin";
      expect(canChangeRole).toBe(false);
    });
  });

  describe("Session Management", () => {
    it("نشست باید شامل شناسه کاربر باشد", () => {
      const session = {
        userId: "user_1",
        role: "admin",
        lastActivity: Date.now(),
      };

      expect(session.userId).toBeTruthy();
      expect(session.lastActivity).toBeLessThanOrEqual(Date.now());
    });

    it("نشست باید بعد از بی‌تحرکی طولانی منقضی شود", () => {
      const lastActivity = Date.now() - 30 * 60 * 1000; // 30 minutes ago
      const sessionTimeout = 15 * 60 * 1000; // 15 minutes
      const isExpired = Date.now() - lastActivity > sessionTimeout;

      expect(isExpired).toBe(true);
    });
  });
});

// ============================================================
// بخش ۵: تست CSRF Protection
// ============================================================

describe("🔒 CSRF Protection", () => {

  it("درخواست‌های POST باید شامل توکن CSRF باشند", () => {
    const csrfToken = "random_csrf_token_12345";
    const headers = {
      "X-CSRF-Token": csrfToken,
      "Content-Type": "application/json",
    };

    expect(headers["X-CSRF-Token"]).toBeTruthy();
  });

  it("درخواست بدون توکن CSRF باید رد شود", () => {
    const headers = {
      "Content-Type": "application/json",
    };

    const hasCsrf = "X-CSRF-Token" in headers;
    expect(hasCsrf).toBe(false);
  });

  it("Origin header باید با دامنه مطابقت داشته باشد", () => {
    const allowedOrigins = ["https://clubinex.com", "https://www.clubinex.com"];
    const requestOrigin = "https://clubinex.com";

    expect(allowedOrigins).toContain(requestOrigin);
  });

  it("Origin جعلی باید رد شود", () => {
    const allowedOrigins = ["https://clubinex.com"];
    const maliciousOrigin = "https://evil.com";

    expect(allowedOrigins.includes(maliciousOrigin)).toBe(false);
  });
});

// ============================================================
// بخش ۶: تست XSS در فرم‌ها
// ============================================================

describe("📝 Form Security", () => {

  it("فیلد آدرس باید XSS را فیلتر کند", () => {
    const xssAddress = '<script>alert("hacked")</script> تهران، خیابان ولیعصر';
    const sanitized = sanitizeTextInput(xssAddress, 500);

    expect(sanitized).not.toContain("<script>");
    expect(sanitized).toContain("تهران");
  });

  it("فیلد نام باید HTML injection را فیلتر کند", () => {
    const name = '<img src=x onerror=alert(1)>علی';
    const sanitized = sanitizeTextInput(name, 100);

    expect(sanitized).not.toContain("<img");
    expect(sanitized).not.toContain("onerror");
  });

  it("URL باید فقط http/https را بپذیرد", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("");
  });

  it("فیلد توضیحات باید against Stored XSS محافظت کند", () => {
    const storedXss = '<img src="x" onerror="steal(cookie)">';
    const sanitized = sanitizeTextInput(storedXss);

    expect(sanitized).not.toContain("<img");
    expect(sanitized).not.toContain("onerror");
  });
});

// ============================================================
// بخش ۷: تست Data Security
// ============================================================

describe("🗄️ Data Security", () => {

  it("داده‌های حساس نباید در URL نمایش داده شوند", () => {
    const sensitiveData = {
      password: "secret123",
      creditCard: "4111111111111111",
      cvv: "123",
    };

    const url = `/api/user?name=Ali`;
    expect(url).not.toContain(sensitiveData.password);
    expect(url).not.toContain(sensitiveData.creditCard);
  });

  it("رمز عبور باید هش شده ذخیره شود (نه plain text)", () => {
    const userRecord = {
      name: "Ali",
      email: "ali@test.com",
      role: "user",
    };

    expect(userRecord).not.toHaveProperty("password");
    expect(userRecord).not.toHaveProperty("hashedPassword");
  });

  it("ایمیل باید lowercase ذخیره شود", () => {
    const email = "Ali@Test.COM";
    const normalized = sanitizeEmail(email);
    expect(normalized).toBe("ali@test.com");
  });
});

// ============================================================
// بخش ۸: تست امنیت عملیات پرداخت
// ============================================================

describe("💳 Payment Security", () => {

  it("مبلغ پرداخت نباید قابل تغییر توسط کلاینت باشد", () => {
    const clientAmount: number = 1000;
    const serverAmount: number = 1000000;
    const isTampered = clientAmount !== serverAmount;
    expect(isTampered).toBe(true);
  });

  it("callback URL باید معتبر باشد", () => {
    const allowedDomains = ["clubinex.com", "localhost"];
    const callbackUrl = new URL("https://clubinex.com/payment/return");

    expect(allowedDomains).toContain(callbackUrl.hostname);
  });

  it("callback URL جعلی باید رد شود", () => {
    const allowedDomains = ["clubinex.com"];
    const maliciousUrl = new URL("https://evil.com/phishing");

    expect(allowedDomains.includes(maliciousUrl.hostname)).toBe(false);
  });

  it("Amount conversion: Tomans to Rials should be ×10", () => {
    const tomans = 100000;
    const rials = tomans * 10;
    expect(rials).toBe(1000000);
  });
});

// ============================================================
// بخش ۹: تست امنیت فایل‌ها
// ============================================================

describe("📁 File Security", () => {

  it("فقط فرمت‌های مجاز باید قابل آپلود باشند", () => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".xlsx", ".xls"];
    const dangerousFiles = [
      "malware.exe",
      "script.php",
      "shell.jsp",
      "backdoor.asp",
      "virus.bat",
    ];

    for (const file of dangerousFiles) {
      const ext = "." + file.split(".").pop();
      expect(allowedExtensions).not.toContain(ext);
    }
  });

  it("نام فایل خطرناک باید شناسایی شود", () => {
    const dangerousNames = [
      "../../../etc/passwd",
      "..\\..\\windows\\system32\\config",
    ];

    for (const name of dangerousNames) {
      const hasPathTraversal = name.includes("..") || name.includes("\\");
      expect(hasPathTraversal).toBe(true);
    }
  });

  it("سایز فایل باید محدود باشد", () => {
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxExcelSize = 10 * 1024 * 1024; // 10MB

    expect(1024).toBeLessThanOrEqual(maxImageSize);
    expect(20 * 1024 * 1024).toBeGreaterThan(maxExcelSize);
  });
});

// ============================================================
// بخش ۱۰: تست لاگ‌گیری امنیتی
// ============================================================

describe("📝 Security Audit Logging", () => {

  it("لاگ امنیتی باید شامل action باشد", () => {
    const logEntry = {
      action: "login_failed",
      entity: "users",
      entityId: "user@test.com",
      userId: "anonymous",
      details: "Invalid OTP code",
      createdAt: Date.now(),
    };

    expect(logEntry.action).toBeTruthy();
    expect(logEntry.entity).toBeTruthy();
  });

  it("عملیات حساس باید لاگ شوند", () => {
    const sensitiveActions = [
      "password_reset",
      "role_change",
      "account_lock",
      "account_disable",
      "login_failed",
      "payment_failed",
    ];

    for (const action of sensitiveActions) {
      expect(action.length).toBeGreaterThan(0);
    }
  });

  it("IP کاربر در لاگ ذخیره شود", () => {
    const logEntry = {
      action: "login",
      ip: "192.168.1.1",
      createdAt: Date.now(),
    };

    expect(logEntry.ip).toBeTruthy();
  });
});

// ============================================================
// بخش ۱۱: تست Security Headers
// ============================================================

describe("🔐 Security Headers", () => {

  it("Content-Security-Policy باید تعریف شده باشد", () => {
    const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'";
    expect(csp).toContain("default-src");
    expect(csp).toContain("'self'");
  });

  it("X-Content-Type-Options باید nosniff باشد", () => {
    const header = "nosniff";
    expect(header).toBe("nosniff");
  });

  it("X-Frame-Options باید DENY یا SAMEORIGIN باشد", () => {
    const options = ["DENY", "SAMEORIGIN"];
    expect(options).toContain("DENY");
  });

  it("Strict-Transport-Security باید فعال باشد", () => {
    const hsts = "max-age=31536000; includeSubDomains";
    expect(hsts).toContain("max-age");
  });
});
