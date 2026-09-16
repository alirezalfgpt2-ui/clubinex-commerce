// صفحه اصلی ماژول دیتابیس — فابریک ایجاد آداپتور
// Database module index — adapter factory

export type { IDatabaseAdapter, User, Product, Order, Category, Discount, Notification, Ticket, MySQLConfig } from "./types";
export { MySQLAdapter } from "./mysql-adapter";
export { ConvexAdapter } from "./convex-adapter";

/**
 * فابریک ایجاد آداپتور دیتابیس.
 * بر اساس متغیر محیطی یکی از آداپتورها را برمی‌گرداند.
 *
 * نحوه استفاده:
 *   import { createDb } from "@/lib/db";
 *   const db = createDb();
 *   const users = await db.getUsers();
 *
 * برای استفاده با MySQL:
 *   DB_BACKEND=mysql
 *   MYSQL_HOST=localhost
 *   MYSQL_PORT=3306
 *   MYSQL_USER=root
 *   MYSQL_PASS=password
 *   MYSQL_DB=store
 */

import type { IDatabaseAdapter } from "./types";

export function createDb(): IDatabaseAdapter {
  const backend = import.meta.env.VITE_DB_BACKEND || "convex";

  if (backend === "mysql") {
    // Dynamic import to avoid bundling mysql2 when using Convex
    // @ts-ignore — mysql2 is only installed when using MySQL backend
    const { MySQLAdapter } = (Function('return import("./mysql-adapter")')() as any);
    return new MySQLAdapter({
      host: import.meta.env.MYSQL_HOST || "localhost",
      port: Number(import.meta.env.MYSQL_PORT || 3306),
      username: import.meta.env.MYSQL_USER || "root",
      password: import.meta.env.MYSQL_PASS || "",
      database: import.meta.env.MYSQL_DB || "store",
    });
  }

  // Default: Convex
  // For Convex, use the React hooks directly in components.
  // This adapter is for non-React contexts (actions, etc.)
  throw new Error(
    "For Convex, use useQuery/useMutation hooks directly in React components. " +
    "The ConvexAdapter is available for non-React contexts."
  );
}
