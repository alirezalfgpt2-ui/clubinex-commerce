export const APP_NAME = "Clubinex Commerce";
export const APP_DESCRIPTION = "فروشگاه آنلاین هوشمند — تجربه خریدی ساده، سریع و لذت‌بخش";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  OPERATOR: "operator",
  USER: "user",
  MEMBER: "member",
} as const;

export const ROLES_FA: Record<string, string> = {
  admin: "مدیر کل",
  manager: "مدیر فروش",
  operator: "اپراتور",
  user: "کاربر عادی",
  member: "عضو",
  representative: "نماینده فروش",
};

export const PERMISSIONS = [
  { key: "products.view", label: "مشاهده محصولات", labelEn: "View Products", group: "محصولات" },
  { key: "products.create", label: "ایجاد محصول", labelEn: "Create Product", group: "محصولات" },
  { key: "products.edit", label: "ویرایش محصول", labelEn: "Edit Product", group: "محصولات" },
  { key: "products.delete", label: "حذف محصول", labelEn: "Delete Product", group: "محصولات" },
  { key: "categories.view", label: "مشاهده دسته‌بندی‌ها", labelEn: "View Categories", group: "دسته‌بندی‌ها" },
  { key: "categories.create", label: "ایجاد دسته‌بندی", labelEn: "Create Category", group: "دسته‌بندی‌ها" },
  { key: "orders.view", label: "مشاهده سفارشات", labelEn: "View Orders", group: "سفارشات" },
  { key: "orders.manage", label: "مدیریت سفارشات", labelEn: "Manage Orders", group: "سفارشات" },
  { key: "users.view", label: "مشاهده کاربران", labelEn: "View Users", group: "کاربران" },
  { key: "users.manage", label: "مدیریت کاربران", labelEn: "Manage Users", group: "کاربران" },
  { key: "reports.view", label: "مشاهده گزارش‌ها", labelEn: "View Reports", group: "گزارش‌ها" },
  { key: "settings.manage", label: "مدیریت تنظیمات", labelEn: "Manage Settings", group: "تنظیمات" },
  { key: "discounts.manage", label: "مدیریت تخفیف‌ها", labelEn: "Manage Discounts", group: "تخفیف‌ها" },
  { key: "shipping.manage", label: "مدیریت ارسال", labelEn: "Manage Shipping", group: "ارسال کالا" },
  { key: "tickets.manage", label: "مدیریت تیکت‌ها", labelEn: "Manage Tickets", group: "پشتیبانی" },
  { key: "invoices.view", label: "مشاهده فاکتورها", labelEn: "View Invoices", group: "فاکتورها" },
  { key: "invoices.create", label: "صدور فاکتور", labelEn: "Create Invoice", group: "فاکتورها" },
  { key: "brands.manage", label: "مدیریت برندها", labelEn: "Manage Brands", group: "برندها" },
  { key: "features.manage", label: "مدیریت ویژگی‌ها", labelEn: "Manage Features", group: "ویژگی‌ها" },
];

export const PERMISSION_GROUPS = [
  "محصولات",
  "دسته‌بندی‌ها",
  "سفارشات",
  "کاربران",
  "گزارش‌ها",
  "تنظیمات",
  "تخفیف‌ها",
  "ارسال کالا",
  "پشتیبانی",
  "فاکتورها",
  "برندها",
  "ویژگی‌ها",
];

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUSES = [
  { value: "pending", label: "در انتظار تأیید", labelEn: "Pending", color: "text-amber-600" },
  { value: "paid", label: "پرداخت شده", labelEn: "Paid", color: "text-sky-600" },
  { value: "processing", label: "در حال پردازش", labelEn: "Processing", color: "text-violet-600" },
  { value: "shipped", label: "ارسال شده", labelEn: "Shipped", color: "text-indigo-600" },
  { value: "delivered", label: "تحویل شده", labelEn: "Delivered", color: "text-emerald-600" },
  { value: "cancelled", label: "لغو شده", labelEn: "Cancelled", color: "text-rose-600" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "pending", label: "در انتظار پرداخت" },
  { value: "paid", label: "پرداخت شده" },
  { value: "failed", label: "پرداخت ناموفق" },
  { value: "refunded", label: "بازگشت وجه" },
] as const;

export const TICKET_CATEGORIES = [
  { value: "technical", label: "پشتیبانی فنی" },
  { value: "financial", label: "مسائل مالی" },
  { value: "product", label: "سؤال درباره محصول" },
  { value: "general", label: "عمومی" },
] as const;

export const TICKET_PRIORITIES = [
  { value: "low", label: "کم‌اهمیت", color: "text-slate-400" },
  { value: "medium", label: "متوسط", color: "text-amber-500" },
  { value: "high", label: "مهم", color: "text-orange-500" },
  { value: "critical", label: "فوری", color: "text-rose-500" },
] as const;

export const TICKET_STATUSES = [
  { value: "open", label: "باز", color: "text-sky-500" },
  { value: "in_progress", label: "در حال بررسی", color: "text-amber-500" },
  { value: "answered", label: "پاسخ داده شده", color: "text-emerald-500" },
  { value: "closed", label: "بسته شده", color: "text-slate-400" },
] as const;

export const SHIPPING_TYPES = [
  { value: "pickup", label: "دریافت حضوری" },
  { value: "post", label: "پست پیشتاز" },
  { value: "courier", label: "پیک موتوری" },
  { value: "express", label: "ارسال سریع" },
] as const;
