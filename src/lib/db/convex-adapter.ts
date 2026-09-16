// آداپتور Convex — پیاده‌سازی لایه انتزاعی دیتابیس با Convex
// Convex adapter implementing the database abstraction layer

import type {
  IDatabaseAdapter,
  User,
  Product,
  Order,
  Category,
  Discount,
  Notification,
  Ticket,
} from "./types";

/**
 * آداپتور Convex — از APIهای موجود Convex استفاده می‌کند.
 *
 * نکته: این آداپتور در سمت کلاینت اجرا می‌شود و به صورت مستقیم
 * از useQuery/useMutation استفاده نمی‌کند — بلکه مستقیماً API
 * های Convex را فراخوانی می‌کند.
 *
 * برای استفاده در React components، از hooks استفاده کنید:
 *   import { useQuery } from "convex/react";
 *   import { api } from "@/convex/_generated/api";
 */

// این آداپتور فقط type-safe wrapper است و نیاز به اتصال Convex client دارد
export class ConvexAdapter implements IDatabaseAdapter {
  private client: any;

  constructor(convexClient: any) {
    this.client = convexClient;
  }

  // ─── کاربران ───

  async getUsers(): Promise<User[]> {
    const result = await this.client.query("users:list");
    return result || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.client.query("users:getById", { userId: id });
    return result || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // Convex doesn't have a direct getUserByEmail query
    const result = await this.client.query("users:list");
    return result?.find((u: User) => u.email === email) || null;
  }

  async createUser(data: Partial<User>): Promise<string> {
    const result = await this.client.mutation("users:create", data);
    return result;
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    await this.client.mutation("users:update", { userId: id, ...data });
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.mutation("users:remove", { userId: id });
  }

  // ─── محصولات ───

  async getProducts(): Promise<Product[]> {
    const result = await this.client.query("products:list");
    return result || [];
  }

  async getProductById(id: string): Promise<Product | null> {
    const result = await this.client.query("products:getById", { productId: id });
    return result || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const result = await this.client.query("products:getBySlug", { slug });
    return result || null;
  }

  async createProduct(data: Partial<Product>): Promise<string> {
    const result = await this.client.mutation("products:create", data);
    return result;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    await this.client.mutation("products:update", { productId: id, ...data });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.client.mutation("products:remove", { productId: id });
  }

  async searchProducts(query: string): Promise<Product[]> {
    const result = await this.client.query("products:search", { q: query });
    return result || [];
  }

  // ─── دسته‌بندی‌ها ───

  async getCategories(): Promise<Category[]> {
    const result = await this.client.query("categories:list");
    return result || [];
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const result = await this.client.query("categories:getById", { categoryId: id });
    return result || null;
  }

  async createCategory(data: Partial<Category>): Promise<string> {
    const result = await this.client.mutation("categories:create", data);
    return result;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    await this.client.mutation("categories:update", { categoryId: id, ...data });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.client.mutation("categories:remove", { categoryId: id });
  }

  // ─── سفارشات ───

  async getOrders(): Promise<Order[]> {
    const result = await this.client.query("orders:list");
    return result || [];
  }

  async getOrderById(id: string): Promise<Order | null> {
    const result = await this.client.query("orders:getById", { orderId: id });
    return result || null;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const result = await this.client.query("orders:listByUser");
    return result || [];
  }

  async createOrder(data: Partial<Order>): Promise<string> {
    const result = await this.client.mutation("orders:create", data);
    return result;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<void> {
    await this.client.mutation("orders:updateStatus", { orderId: id, status: data.status! });
  }

  // ─── تخفیف‌ها ───

  async getDiscounts(): Promise<Discount[]> {
    const result = await this.client.query("discounts:list");
    return result || [];
  }

  async getDiscountByCode(code: string): Promise<Discount | null> {
    const result = await this.client.query("discounts:getByCode", { code });
    return result || null;
  }

  async createDiscount(data: Partial<Discount>): Promise<string> {
    const result = await this.client.mutation("discounts:create", data);
    return result;
  }

  async updateDiscount(id: string, data: Partial<Discount>): Promise<void> {
    await this.client.mutation("discounts:update", { discountId: id, ...data });
  }

  async deleteDiscount(id: string): Promise<void> {
    await this.client.mutation("discounts:remove", { discountId: id });
  }

  // ─── نوتیفیکیشن‌ها ───

  async getNotifications(userId: string): Promise<Notification[]> {
    const result = await this.client.query("notifications:list");
    return result || [];
  }

  async createNotification(data: Partial<Notification>): Promise<string> {
    const result = await this.client.mutation("notifications:create", data);
    return result;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.client.mutation("notifications:markAsRead", { notificationId: id });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.client.mutation("notifications:remove", { notificationId: id });
  }

  // ─── تیکت‌ها ───

  async getTickets(userId?: string): Promise<Ticket[]> {
    const result = await this.client.query("tickets:list");
    return result || [];
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const result = await this.client.query("tickets:getById", { ticketId: id });
    return result || null;
  }

  async createTicket(data: Partial<Ticket>): Promise<string> {
    const result = await this.client.mutation("tickets:create", data);
    return result;
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<void> {
    await this.client.mutation("tickets:updateStatus", { ticketId: id, status: data.status! });
  }

  // ─── گزارش‌ها ───

  async getStats() {
    const [orders, users, products] = await Promise.all([
      this.client.query("orders:getStats"),
      this.client.query("users:list"),
      this.client.query("products:list"),
    ]);

    return {
      totalRevenue: orders?.totalRevenue || 0,
      totalOrders: orders?.totalOrders || 0,
      pendingOrders: orders?.pendingOrders || 0,
      deliveredOrders: orders?.deliveredOrders || 0,
      totalUsers: users?.length || 0,
      totalProducts: products?.length || 0,
    };
  }
}
