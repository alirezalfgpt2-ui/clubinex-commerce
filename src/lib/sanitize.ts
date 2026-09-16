/**
 * XSS sanitizer utility
 * Prevents cross-site scripting attacks by sanitizing user input
 */

/** Characters that are dangerous in HTML context */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

/** Sanitize string for safe HTML output */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/[&<>"'`/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/** Sanitize for use in attributes */
export function sanitizeAttr(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[&<>"'`/]/g, (char) => HTML_ESCAPE_MAP[char] || char)
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/data:/gi, "");
}

/** Strip all HTML tags */
export function stripHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "");
}

/** Sanitize user text input (removes dangerous chars, trims, limits length) */
export function sanitizeTextInput(input: string, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return stripHtml(input).trim().slice(0, maxLength);
}

/** Sanitize email input */
export function sanitizeEmail(input: string): string {
  if (typeof input !== "string") return "";
  return input.trim().toLowerCase().slice(0, 254);
}

/** Sanitize phone number (Iran) */
export function sanitizePhone(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^0-9+\-]/g, "").slice(0, 15);
}

/** Sanitize postal code (Iran - 10 digits) */
export function sanitizePostalCode(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^0-9]/g, "").slice(0, 10);
}

/** Validate and sanitize URL */
export function sanitizeUrl(input: string): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/[<>"'`]/g, "").slice(0, 2048);
  }
  return "";
}

/** Input validation with Zod-like patterns */
export const validators = {
  /** Persian/English name (2-100 chars) */
  name: (input: string): { valid: boolean; error?: string } => {
    const sanitized = sanitizeTextInput(input, 100);
    if (sanitized.length < 2) return { valid: false, error: "نام باید حداقل ۲ کاراکتر باشد." };
    if (sanitized.length > 100) return { valid: false, error: "نام نباید بیش از ۱۰۰ کاراکتر باشد." };
    if (/[<>]/.test(sanitized)) return { valid: false, error: "نام شامل کاراکترهای غیرمجاز است." };
    return { valid: true };
  },

  /** Email validation */
  email: (input: string): { valid: boolean; error?: string } => {
    const sanitized = sanitizeEmail(input);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) return { valid: false, error: "ایمیل معتبر نیست." };
    return { valid: true };
  },

  /** Iranian phone number */
  phone: (input: string): { valid: boolean; error?: string } => {
    const sanitized = sanitizePhone(input);
    const phoneRegex = /^(09\d{9}|\+989\d{9})$/;
    if (!phoneRegex.test(sanitized)) return { valid: false, error: "شماره تلفن معتبر نیست." };
    return { valid: true };
  },

  /** Iranian national code (10 digits) */
  nationalCode: (input: string): { valid: boolean; error?: string } => {
    const sanitized = input.replace(/[^0-9]/g, "").slice(0, 10);
    if (sanitized.length !== 10) return { valid: false, error: "کد ملی باید ۱۰ رقم باشد." };
    // Iranian national code checksum
    const digits = sanitized.split("").map(Number);
    const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0);
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;
    if (digits[9] !== checkDigit) return { valid: false, error: "کد ملی معتبر نیست." };
    return { valid: true };
  },

  /** Iranian postal code (10 digits) */
  postalCode: (input: string): { valid: boolean; error?: string } => {
    const sanitized = sanitizePostalCode(input);
    if (sanitized.length !== 10) return { valid: false, error: "کد پستی باید ۱۰ رقم باشد." };
    return { valid: true };
  },

  /** Order amount */
  orderAmount: (amount: number): { valid: boolean; error?: string } => {
    if (typeof amount !== "number" || isNaN(amount)) return { valid: false, error: "مبلغ سفارش نامعتبر است." };
    if (amount <= 0) return { valid: false, error: "مبلغ سفارش باید مثبت باشد." };
    if (amount > 10_000_000_000) return { valid: false, error: "مبلغ سفارش بیش از حد مجاز است." };
    return { valid: true };
  },

  /** Quantity */
  quantity: (qty: number): { valid: boolean; error?: string } => {
    if (typeof qty !== "number" || isNaN(qty)) return { valid: false, error: "تعداد نامعتبر است." };
    if (!Number.isInteger(qty) || qty <= 0) return { valid: false, error: "تعداد باید عدد صحیح مثبت باشد." };
    if (qty > 999) return { valid: false, error: "تعداد بیش از حد مجاز است." };
    return { valid: true };
  },

  /** Discount code */
  discountCode: (input: string): { valid: boolean; error?: string } => {
    const sanitized = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (sanitized.length < 3) return { valid: false, error: "کد تخفیف باید حداقل ۳ کاراکتر باشد." };
    if (sanitized.length > 30) return { valid: false, error: "کد تخفیف بیش از حد مجاز است." };
    return { valid: true };
  },

  /** Address */
  address: (input: string): { valid: boolean; error?: string } => {
    const sanitized = sanitizeTextInput(input, 500);
    if (sanitized.length < 10) return { valid: false, error: "آدرس باید حداقل ۱۰ کاراکتر باشد." };
    return { valid: true };
  },
};

/** Rate limiter helper - tracks attempts per identifier in-memory (client-side) */
export class ClientRateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 60_000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(identifier: string): { allowed: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetAt) {
      this.attempts.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxAttempts - 1 };
    }

    if (record.count >= this.maxAttempts) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }

    record.count++;
    return { allowed: true, remaining: this.maxAttempts - record.count };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}
