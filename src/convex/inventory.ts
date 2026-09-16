import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Get inventory for a product */
export const getByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
  },
});

/** Get inventory by warehouse */
export const getByWarehouse = query({
  args: { warehouseId: v.id("warehouses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_warehouse", (q) => q.eq("warehouseId", args.warehouseId))
      .collect();
  },
});

/** List all inventory items with product info */
export const listAll = query({
  args: {
    search: v.optional(v.string()),
    warehouseId: v.optional(v.id("warehouses")),
  },
  handler: async (ctx, args) => {
    let items;
    if (args.warehouseId) {
      items = await ctx.db
        .query("inventory")
        .withIndex("by_warehouse", (idx) =>
          idx.eq("warehouseId", args.warehouseId!)
        )
        .collect();
    } else {
      items = await ctx.db.query("inventory").collect();
    }

    // Enrich with product and warehouse info
    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const warehouse = item.warehouseId
          ? await ctx.db.get(item.warehouseId)
          : null;
        return {
          ...item,
          productName: product?.name ?? "نامشخص",
          productSku: (product as any)?.sku ?? "",
          warehouseName: warehouse?.name ?? "انبار مرکزی",
        };
      })
    );

    if (args.search) {
      const s = args.search.toLowerCase();
      return enriched.filter(
        (e) =>
          e.productName.toLowerCase().includes(s) ||
          e.warehouseName.toLowerCase().includes(s)
      );
    }
    return enriched;
  },
});

/** Get total stock for a product across all warehouses */
export const getTotalStock = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
});

/** Create or update inventory record */
export const upsert = mutation({
  args: {
    productId: v.id("products"),
    variantId: v.optional(v.id("productVariants")),
    warehouseId: v.optional(v.id("warehouses")),
    quantity: v.number(),
    minStock: v.optional(v.number()),
    maxStock: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find existing inventory for this product/warehouse combo
    let existing = null;
    const allByProduct = await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    existing = allByProduct.find(
      (item) => item.warehouseId === (args.warehouseId ?? null)
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: args.quantity,
        minStock: args.minStock,
        maxStock: args.maxStock,
        unit: args.unit,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("inventory", {
      productId: args.productId,
      variantId: args.variantId,
      warehouseId: args.warehouseId,
      quantity: args.quantity,
      reservedQuantity: 0,
      minStock: args.minStock,
      maxStock: args.maxStock,
      unit: args.unit,
      updatedAt: Date.now(),
    });
  },
});

/** Record inventory movement (in/out/purchase/sale/return/adjustment/transfer) */
export const recordMovement = mutation({
  args: {
    productId: v.id("products"),
    variantId: v.optional(v.id("productVariants")),
    warehouseId: v.optional(v.id("warehouses")),
    type: v.union(
      v.literal("in"),
      v.literal("out"),
      v.literal("purchase"),
      v.literal("sale"),
      v.literal("return"),
      v.literal("adjustment"),
      v.literal("transfer")
    ),
    quantity: v.number(),
    referenceId: v.optional(v.string()),
    referenceType: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Record the movement
    const movementId = await ctx.db.insert("inventoryMovements", {
      ...args,
      userId,
      createdAt: Date.now(),
    });

    // Update inventory quantity
    let inventoryItem = null;
    const allByProduct = await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    inventoryItem = allByProduct.find(
      (item) => item.warehouseId === (args.warehouseId ?? null)
    );

    const isPositive =
      args.type === "in" ||
      args.type === "purchase" ||
      args.type === "return" ||
      args.type === "adjustment";
    const delta = isPositive ? args.quantity : -args.quantity;

    if (inventoryItem) {
      const newQty = Math.max(0, inventoryItem.quantity + delta);
      await ctx.db.patch(inventoryItem._id, {
        quantity: newQty,
        updatedAt: Date.now(),
      });
    } else if (delta > 0) {
      await ctx.db.insert("inventory", {
        productId: args.productId,
        variantId: args.variantId,
        warehouseId: args.warehouseId,
        quantity: delta,
        reservedQuantity: 0,
        updatedAt: Date.now(),
      });
    }

    return { movementId };
  },
});

/** Get movement history for a product */
export const getMovements = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("inventoryMovements")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .take(limit);
  },
});

/** List all movements */
export const listMovements = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("in"),
        v.literal("out"),
        v.literal("purchase"),
        v.literal("sale"),
        v.literal("return"),
        v.literal("adjustment"),
        v.literal("transfer")
      )
    ),
    warehouseId: v.optional(v.id("warehouses")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    let movements;
    if (args.type) {
      movements = await ctx.db
        .query("inventoryMovements")
        .withIndex("by_type", (idx) => idx.eq("type", args.type!))
        .order("desc")
        .take(limit);
    } else if (args.warehouseId) {
      movements = await ctx.db
        .query("inventoryMovements")
        .withIndex("by_warehouse", (idx) =>
          idx.eq("warehouseId", args.warehouseId!)
        )
        .order("desc")
        .take(limit);
    } else {
      movements = await ctx.db
        .query("inventoryMovements")
        .order("desc")
        .take(limit);
    }

    return Promise.all(
      movements.map(async (m) => {
        const product = await ctx.db.get(m.productId);
        const warehouse = m.warehouseId
          ? await ctx.db.get(m.warehouseId)
          : null;
        const user = await ctx.db.get(m.userId);
        return {
          ...m,
          productName: product?.name ?? "نامشخص",
          warehouseName: warehouse?.name ?? "—",
          userName: user?.name ?? "—",
        };
      })
    );
  },
});

/** Get stock summary: total value, low-stock items count */
export const getStockSummary = query({
  args: {},
  handler: async (ctx) => {
    const allInventory = await ctx.db.query("inventory").collect();
    const products = await ctx.db.query("products").collect();
    const productMap = new Map(products.map((p) => [p._id, p]));

    const totalItems = allInventory.reduce((sum, i) => sum + i.quantity, 0);
    const lowStockItems = allInventory.filter(
      (i) => i.minStock !== undefined && i.quantity <= i.minStock!
    ).length;
    const warehouses = await ctx.db
      .query("warehouses")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    const activeWarehouses = warehouses.length;

    return {
      totalItems,
      totalRecords: allInventory.length,
      lowStockItems,
      activeWarehouses: activeWarehouses,
    };
  },
});
