/** File validation utilities for secure uploads */

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_EXCEL_SIZE = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate an image file */
export function validateImage(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `فایل ${file.name} فرمت مجاز نیست. فرمت‌های مجاز: JPG, PNG, GIF, WebP` };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `حجم فایل ${file.name} بیش از ${MAX_IMAGE_SIZE / 1024 / 1024} مگابایت است.` };
  }
  // Check for potentially malicious content
  const name = file.name.toLowerCase();
  if (name.includes(".php") || name.includes(".js") || name.includes(".exe") || name.includes(".bat")) {
    return { valid: false, error: `فایل ${file.name} حاوی محتوای مشکوک است.` };
  }
  return { valid: true };
}

/** Validate an Excel/CSV file */
export function validateExcel(file: File): ValidationResult {
  if (!ALLOWED_EXCEL_TYPES.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
    return { valid: false, error: `فایل ${file.name} فرمت اکسل یا CSV نیست.` };
  }
  if (file.size > MAX_EXCEL_SIZE) {
    return { valid: false, error: `حجم فایل ${file.name} بیش از ${MAX_EXCEL_SIZE / 1024 / 1024} مگابایت است.` };
  }
  return { valid: true };
}

/** Sanitize a filename for safe storage */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 200);
}

/** Check for duplicate products by name in an Excel import */
export function checkDuplicateProducts(
  newNames: string[],
  existingNames: string[]
): { duplicates: string[]; unique: string[] } {
  const existing = new Set(existingNames.map((n) => n.toLowerCase()));
  const duplicates: string[] = [];
  const unique: string[] = [];
  for (const name of newNames) {
    if (existing.has(name.toLowerCase())) {
      duplicates.push(name);
    } else {
      unique.push(name);
    }
  }
  return { duplicates, unique };
}
