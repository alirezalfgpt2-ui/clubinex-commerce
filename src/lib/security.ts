// ابزارهای امنیتی مرکزی
// Centralized security utilities

/**
 * پاکسازی ورودی‌ها در برابر XSS
 * Sanitize user input against XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * حذف تگ‌های HTML از رشته
 * Strip HTML tags from string
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * اعتبارسنجی ایمیل
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * اعتبارسنجی شماره تلفن ایرانی
 * Validate Iranian phone number
 */
export function isValidIranianPhone(phone: string): boolean {
  const phoneRegex = /^(09\d{9}|\+989\d{9})$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

/**
 * اعتبارسنجی کد پستی ۱۰ رقمی
 * Validate 10-digit postal code
 */
export function isValidPostalCode(code: string): boolean {
  return /^\d{10}$/.test(code);
}

/**
 * محدود کردن طول رشته
 * Clamp string length
 */
export function clampLength(input: string, maxLength: number): string {
  return input.slice(0, maxLength);
}

/**
 * بررسی امنیتی نام فایل
 * Validate filename for security (prevent path traversal)
 */
export function isSafeFilename(filename: string): boolean {
  const unsafePattern = /[\/\\:*?"<>|]/;
  const dangerousPatterns = ["..", "~", "$", "`", "${"];
  if (unsafePattern.test(filename)) return false;
  if (dangerousPatterns.some((p) => filename.includes(p))) return false;
  return true;
}

/**
 * محدود کردن اندازه فایل
 * Validate file size
 */
export function isFileSizeValid(sizeBytes: number, maxSizeMB: number): boolean {
  return sizeBytes <= maxSizeMB * 1024 * 1024;
}

/**
 * تولید CSRF token ساده
 * Generate simple CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * اعتبارسنجی رمز عبور قوی
 * Validate strong password
 */
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: "رمز عبور باید حداقل ۸ کاراکتر باشد." };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "رمز عبور باید حداقل یک حرف بزرگ داشته باشد." };
  if (!/[a-z]/.test(password)) return { valid: false, message: "رمز عبور باید حداقل یک حرف کوچک داشته باشد." };
  if (!/[0-9]/.test(password)) return { valid: false, message: "رمز عبور باید حداقل یک عدد داشته باشد." };
  return { valid: true, message: "" };
}

/**
 * بررسی سرقت محتوا (CSRF-safe origin check)
 * Check if request origin matches expected
 */
export function isTrustedOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some((allowed) => origin === allowed || origin.endsWith(`.${new URL(allowed).hostname}`));
}

/**
 * محدودیت نرخ درخواست ساده (Client-side)
 * Simple client-side rate limiter
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;

  record.count++;
  return true;
}
