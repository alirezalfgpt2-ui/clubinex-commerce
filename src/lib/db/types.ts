// لایه انتزاعی دیتابیس — تایپ‌ها و اینترفیس‌ها
// Database abstraction layer — types and interfaces

/**
 * این اینترفیس‌ها امکان استفاده همزمان از Convex و MySQL را فراهم می‌کنند.
 * این اینترفیس‌ها بر اساس عملیات CRUD پایه هستند.
 *
 * این فایل را به عنوان قرارداد (Contract) در نظر بگیرید.
 * هر بک‌اند باید این اینترفیس‌ها را پیاده‌سازی کند.
 */

// ─── مدل‌های پایه ───

export interface BaseModel {
  _id: string;
  _creationTime?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface User extends BaseModel {
  name?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "operator" | "representative" | "user" | "member";
  isActive: boolean;
  image?: string;
  address?: string;
  postalCode?: string;
  birthDate?: string;
  gender?: string;
}

export interface Product extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  stock: number;
  stockAlert?: number;
  images: string[];
  categoryId: string;
  tags: string[];
  brand?: string;
  weight?: number;
  features?: Record<string, any>;
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  rating?: number;
}

export interface Order extends BaseModel {
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod: string;
  shippingMethod: string;
  address: string;
  postalCode: string;
  notes?: string;
  receiveSms?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Category extends BaseModel {
  name: string;
  slug: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  features?: { key: string; label: string }[];
}

export interface Discount extends BaseModel {
  code: string;
  type: "percentage" | "fixed" | "gift_card";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: number;
  endDate: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  productId?: string;
  categoryId?: string;
  targetUserIds?: string[];
  discountType?: "general" | "welcome" | "birthday" | "loyalty" | "volume";
  volumeDiscounts?: { minQuantity: number; discountPercent: number }[];
}

export interface Notification extends BaseModel {
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
}

export interface Ticket extends BaseModel {
  userId: string;
  subject: string;
  message: string;
  category: "technical" | "financial" | "product" | "general";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "answered" | "closed";
  assigneeId?: string;
  rating?: number;
  ratingFeedback?: string;
}

// ─── اینترفیس Database Abstraction Layer ───

export interface IDatabaseAdapter {
  // ── کاربران ──
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(data: Partial<User>): Promise<string>;
  updateUser(id: string, data: Partial<User>): Promise<void>;
  deleteUser(id: string): Promise<void>;

  // ── محصولات ──
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(data: Partial<Product>): Promise<string>;
  updateProduct(id: string, data: Partial<Product>): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;

  // ── دسته‌بندی‌ها ──
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(data: Partial<Category>): Promise<string>;
  updateCategory(id: string, data: Partial<Category>): Promise<void>;
  deleteCategory(id: string): Promise<void>;

  // ── سفارشات ──
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  createOrder(data: Partial<Order>): Promise<string>;
  updateOrder(id: string, data: Partial<Order>): Promise<void>;

  // ── تخفیف‌ها ──
  getDiscounts(): Promise<Discount[]>;
  getDiscountByCode(code: string): Promise<Discount | null>;
  createDiscount(data: Partial<Discount>): Promise<string>;
  updateDiscount(id: string, data: Partial<Discount>): Promise<void>;
  deleteDiscount(id: string): Promise<void>;

  // ── نوتیفیکیشن‌ها ──
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(data: Partial<Notification>): Promise<string>;
  markNotificationRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;

  // ── تیکت‌ها ──
  getTickets(userId?: string): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | null>;
  createTicket(data: Partial<Ticket>): Promise<string>;
  updateTicket(id: string, data: Partial<Ticket>): Promise<void>;

  // ── گزارش‌ها ──
  getStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalUsers: number;
    totalProducts: number;
  }>;
}

// ─── انواع برای MySQL ───

export interface MySQLConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  charset?: string;
  timezone?: string;
}

export interface QueryResult<T = any> {
  rows: T[];
  affectedRows?: number;
  insertId?: number;
}
