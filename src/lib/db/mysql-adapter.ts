// آداپتور MySQL — پیاده‌سازی لایه انتزاعی دیتابیس
// MySQL database adapter

import type {
  IDatabaseAdapter,
  User,
  Product,
  Order,
  Category,
  Discount,
  Notification,
  Ticket,
  MySQLConfig,
  QueryResult,
} from "./types";

/**
 * آداپتور MySQL برای استفاده در محیط‌هایی که Convex نیست.
 * این آداپتور از درایور mysql2 استفاده می‌کند.
 *
 * نحوه استفاده:
 *   import { MySQLAdapter } from "@/lib/db/mysql-adapter";
 *   const db = new MySQLAdapter({ host: "...", ... });
 *   const users = await db.getUsers();
 *
 * نکته: درایور mysql2 باید نصب شود: bun add mysql2
 */

export class MySQLAdapter implements IDatabaseAdapter {
  private config: MySQLConfig;
  private pool: any; // mysql2 Pool

  constructor(config: MySQLConfig) {
    this.config = config;
  }

  // ─── اتصال به دیتابیس ───

  private async getConnection(): Promise<any> {
    if (!this.pool) {
      // Dynamic import to avoid bundling mysql2 when using Convex
      // @ts-ignore — mysql2 is only installed when using MySQL backend
      const mysql = await (Function('return import("mysql2/promise")')() as Promise<any>);
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset || "utf8mb4",
        timezone: this.config.timezone || "+03:30",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return this.pool;
  }

  private async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const conn = await this.getConnection();
    const [rows, meta] = await conn.execute(sql, params);
    const m = meta as any;
    return {
      rows: Array.isArray(rows) ? (rows as T[]) : [],
      affectedRows: m?.affectedRows,
      insertId: m?.insertId,
    };
  }

  // ─── کاربران ───

  async getUsers(): Promise<User[]> {
    const result = await this.query<User>("SELECT * FROM users ORDER BY createdAt DESC");
    return result.rows;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.query<User>("SELECT * FROM users WHERE _id = ?", [id]);
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.query<User>("SELECT * FROM users WHERE email = ?", [email]);
    return result.rows[0] || null;
  }

  async createUser(data: Partial<User>): Promise<string> {
    const now = Date.now();
    const result = await this.query(
      "INSERT INTO users (name, lastName, email, phone, role, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.name || "", data.lastName || "", data.email, data.phone || "", data.role || "user", data.isActive !== false ? 1 : 0, now]
    );
    return String(result.insertId);
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.lastName !== undefined) { fields.push("lastName = ?"); values.push(data.lastName); }
    if (data.phone !== undefined) { fields.push("phone = ?"); values.push(data.phone); }
    if (data.role !== undefined) { fields.push("role = ?"); values.push(data.role); }
    if (data.isActive !== undefined) { fields.push("isActive = ?"); values.push(data.isActive ? 1 : 0); }
    if (fields.length === 0) return;
    values.push(id);
    await this.query(`UPDATE users SET ${fields.join(", ")}, updatedAt = ? WHERE _id = ?`, [...values, Date.now(), id]);
  }

  async deleteUser(id: string): Promise<void> {
    await this.query("DELETE FROM users WHERE _id = ?", [id]);
  }

  // ─── محصولات ───

  async getProducts(): Promise<Product[]> {
    const result = await this.query<Product>("SELECT * FROM products ORDER BY createdAt DESC");
    return result.rows;
  }

  async getProductById(id: string): Promise<Product | null> {
    const result = await this.query<Product>("SELECT * FROM products WHERE _id = ?", [id]);
    return result.rows[0] || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const result = await this.query<Product>("SELECT * FROM products WHERE slug = ?", [slug]);
    return result.rows[0] || null;
  }

  async createProduct(data: Partial<Product>): Promise<string> {
    const now = Date.now();
    const result = await this.query(
      `INSERT INTO products (name, slug, description, price, stock, images, categoryId, tags, isActive, isFeatured, views, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.slug, data.description || "", data.price || 0, data.stock || 0,
       JSON.stringify(data.images || []), data.categoryId || "", JSON.stringify(data.tags || []),
       data.isActive !== false ? 1 : 0, data.isFeatured ? 1 : 0, 0, now]
    );
    return String(result.insertId);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.price !== undefined) { fields.push("price = ?"); values.push(data.price); }
    if (data.stock !== undefined) { fields.push("stock = ?"); values.push(data.stock); }
    if (fields.length === 0) return;
    values.push(id);
    await this.query(`UPDATE products SET ${fields.join(", ")}, updatedAt = ? WHERE _id = ?`, [...values, Date.now(), id]);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.query("DELETE FROM products WHERE _id = ?", [id]);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const result = await this.query<Product>(
      "SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR brand LIKE ?",
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return result.rows;
  }

  // ─── دسته‌بندی‌ها ───

  async getCategories(): Promise<Category[]> {
    const result = await this.query<Category>("SELECT * FROM categories ORDER BY level, name");
    return result.rows;
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const result = await this.query<Category>("SELECT * FROM categories WHERE _id = ?", [id]);
    return result.rows[0] || null;
  }

  async createCategory(data: Partial<Category>): Promise<string> {
    const now = Date.now();
    const result = await this.query(
      "INSERT INTO categories (name, slug, parentId, level, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [data.name, data.slug || "", data.parentId || null, data.level || 0, data.isActive !== false ? 1 : 0, now]
    );
    return String(result.insertId);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.isActive !== undefined) { fields.push("isActive = ?"); values.push(data.isActive ? 1 : 0); }
    if (fields.length === 0) return;
    values.push(id);
    await this.query(`UPDATE categories SET ${fields.join(", ")}, updatedAt = ? WHERE _id = ?`, [...values, Date.now(), id]);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.query("DELETE FROM categories WHERE _id = ?", [id]);
  }

  // ─── سفارشات ───

  async getOrders(): Promise<Order[]> {
    const result = await this.query<Order>("SELECT * FROM orders ORDER BY createdAt DESC");
    return result.rows;
  }

  async getOrderById(id: string): Promise<Order | null> {
    const result = await this.query<Order>("SELECT * FROM orders WHERE _id = ?", [id]);
    return result.rows[0] || null;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const result = await this.query<Order>("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC", [userId]);
    return result.rows;
  }

  async createOrder(data: Partial<Order>): Promise<string> {
    const now = Date.now();
    const orderNumber = `ORD${Date.now().toString(36).toUpperCase()}`;
    const result = await this.query(
      `INSERT INTO orders (orderNumber, userId, items, subtotal, tax, shippingCost, discount, total, status, paymentStatus, paymentMethod, shippingMethod, address, postalCode, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, data.userId, JSON.stringify(data.items || []), data.subtotal || 0,
       data.tax || 0, data.shippingCost || 0, data.discount || 0, data.total || 0,
       "pending", "pending", data.paymentMethod || "online", data.shippingMethod || "",
       data.address || "", data.postalCode || "", data.notes || "", now]
    );
    return String(result.insertId);
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.status !== undefined) { fields.push("status = ?"); values.push(data.status); }
    if (data.paymentStatus !== undefined) { fields.push("paymentStatus = ?"); values.push(data.paymentStatus); }
    if (fields.length === 0) return;
    values.push(id);
    await this.query(`UPDATE orders SET ${fields.join(", ")}, updatedAt = ? WHERE _id = ?`, [...values, Date.now(), id]);
  }

  // ─── تخفیف‌ها ───

  async getDiscounts(): Promise<Discount[]> {
    const result = await this.query<Discount>("SELECT * FROM discounts ORDER BY createdAt DESC");
    return result.rows;
  }

  async getDiscountByCode(code: string): Promise<Discount | null> {
    const result = await this.query<Discount>("SELECT * FROM discounts WHERE code = ?", [code.toUpperCase()]);
    return result.rows[0] || null;
  }

  async createDiscount(data: Partial<Discount>): Promise<string> {
    const now = Date.now();
    const result = await this.query(
      `INSERT INTO discounts (code, type, value, minOrderAmount, startDate, endDate, usageLimit, usedCount, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.code?.toUpperCase(), data.type, data.value, data.minOrderAmount || null,
       data.startDate, data.endDate, data.usageLimit || null, 0, 1, now]
    );
    return String(result.insertId);
  }

  async updateDiscount(id: string, data: Partial<Discount>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.isActive !== undefined) { fields.push("isActive = ?"); values.push(data.isActive ? 1 : 0); }
    if (data.usedCount !== undefined) { fields.push("usedCount = ?"); values.push(data.usedCount); }
    if (fields.length === 0) return;
    values.push(id);
    await this.query(`UPDATE discounts SET ${fields.join(", ")}, updatedAt = ? WHERE _id = ?`, [...values, Date.now(), id]);
  }

  async deleteDiscount(id: string): Promise<void> {
    await this.query("DELETE FROM discounts WHERE _id = ?", [id]);
  }

  // ─── نوتیفیکیشن‌ها ───

  async getNotifications(userId: string): Promise<Notification[]> {
    const result = await this.query<Notification>(
      "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
    return result.rows;
  }

  async createNotification(data: Partial<Notification>): Promise<string> {
    const now = Date.now();
    const result = await this.query(
      "INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [data.userId, data.title || "", data.message || "", data.type || "info", 0, now]
    );
    return String(result.insertId);
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.query("UPDATE notifications SET isRead = 1 WHERE _id = ?", [id]);
  }

  async deleteNotification(id: string): Promise<void> {
    await this.query("DELETE FROM notifications WHERE _id = ?", [id]);
  }

  // ─── تیکت‌ها ───

  async getTickets(userId?: string): Promise<Ticket[]> {
    if (userId) {
      const result = await this.query<Ticket>(
        "SELECT * FROM tickets WHERE userId = ? ORDER BY createdAt DESC",
        [userId]
      );
      return result.rows;
    }
    const result = await this.query<Ticket>("SELECT * FROM tickets ORDER BY createdAt DESC");
    return result.rows;
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const result = await this.query<Ticket>("SELECT * FROM tickets WHERE _id = ?", [id]);
    return result.rows[0] || null;
  }

  async createTicket(data: Partial<Ticket>): Promise<string> {
    const now = Date.now();
    const result = await this.query(
      `INSERT INTO tickets (userId, subject, message, category, priority, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.userId, data.subject, data.message, data.category || "general",
       data.priority || "medium", "open", now, now]
    );
    return String(result.insertId);
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.status !== undefined) { fields.push("status = ?"); values.push(data.status); }
    if (data.rating !== undefined) { fields.push("rating = ?"); values.push(data.rating); }
    if (fields.length === 0) return;
    values.push(id);
    await this.query(`UPDATE tickets SET ${fields.join(", ")}, updatedAt = ? WHERE _id = ?`, [...values, Date.now(), id]);
  }

  // ─── گزارش‌ها ───

  async getStats() {
    const ordersResult = await this.query<{ total: number; revenue: number }>("SELECT COUNT(*) as total, SUM(total) as revenue FROM orders WHERE paymentStatus = 'paid'");
    const pendingResult = await this.query<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const deliveredResult = await this.query<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'");
    const usersResult = await this.query<{ count: number }>("SELECT COUNT(*) as count FROM users");
    const productsResult = await this.query<{ count: number }>("SELECT COUNT(*) as count FROM products");

    const ordersRow = ordersResult.rows[0];
    const pendingRow = pendingResult.rows[0];
    const deliveredRow = deliveredResult.rows[0];
    const usersRow = usersResult.rows[0];
    const productsRow = productsResult.rows[0];

    return {
      totalRevenue: ordersRow?.revenue || 0,
      totalOrders: ordersRow?.total || 0,
      pendingOrders: pendingRow?.count || 0,
      deliveredOrders: deliveredRow?.count || 0,
      totalUsers: usersRow?.count || 0,
      totalProducts: productsRow?.count || 0,
    };
  }

  // �── بستن اتصال ───

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
