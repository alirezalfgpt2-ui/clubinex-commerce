import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      lastName: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(v.string()),
      phone: v.optional(v.string()),
      nationalCode: v.optional(v.string()),
      address: v.optional(v.string()),
      postalCode: v.optional(v.string()),
      avatar: v.optional(v.string()),
      birthDate: v.optional(v.string()),
      gender: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      isLocked: v.optional(v.boolean()),
      lastLogin: v.optional(v.number()),
      lockScreenTime: v.optional(v.number()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    })
      .index("email", ["email"])
      .index("by_role", ["role"])
      .index("by_isActive", ["isActive"]),

    products: defineTable({
      name: v.string(),
      englishName: v.optional(v.string()),
      slug: v.string(),
      description: v.string(),
      shortDescription: v.optional(v.string()),
      price: v.number(),
      salePrice: v.optional(v.number()),
      stock: v.number(),
      stockAlert: v.optional(v.number()),
      images: v.array(v.string()),
      categoryId: v.id("categories"),
      tags: v.array(v.string()),
      brand: v.optional(v.string()),
      weight: v.optional(v.number()),
      features: v.optional(v.any()),
      trustBadges: v.optional(v.array(v.object({
        icon: v.string(),
        label: v.string(),
        desc: v.string(),
      }))),
      vendorId: v.optional(v.id("vendors")),
      isFeatured: v.boolean(),
      isActive: v.boolean(),
      views: v.number(),
      rating: v.optional(v.number()),
      reviewCount: v.optional(v.number()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      lastPriceUpdate: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_category", ["categoryId"])
      .index("by_isActive", ["isActive"])
      .index("by_isFeatured", ["isFeatured"])
      .index("by_price", ["price"])
      .index("by_views", ["views"]),

    categories: defineTable({
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      parentId: v.optional(v.id("categories")),
      level: v.number(),
      order: v.number(),
      isActive: v.boolean(),
      features: v.optional(v.array(v.object({ key: v.string(), label: v.string() }))),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
    })
      .index("by_parent", ["parentId"])
      .index("by_level", ["level"])
      .index("by_isActive", ["isActive"])
      .index("by_slug", ["slug"]),

    orders: defineTable({
      orderNumber: v.string(),
      userId: v.id("users"),
      items: v.array(
        v.object({
          productId: v.id("products"),
          variantId: v.optional(v.id("productVariants")),
          variantName: v.optional(v.string()),
          name: v.string(),
          quantity: v.number(),
          price: v.number(),
          total: v.number(),
        })
      ),
      subtotal: v.number(),
      tax: v.number(),
      shippingCost: v.number(),
      discount: v.number(),
      total: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled")
      ),
      paymentStatus: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("failed"),
        v.literal("refunded")
      ),
      paymentMethod: v.string(),
      transactionId: v.optional(v.string()),
      shippingMethod: v.string(),
      trackingCode: v.optional(v.string()),
      address: v.string(),
      postalCode: v.string(),
      notes: v.optional(v.string()),
      receiveSms: v.optional(v.boolean()),
      department: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_orderNumber", ["orderNumber"])
      .index("by_status", ["status"])
      .index("by_createdAt", ["createdAt"]),

    cartItems: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      variantId: v.optional(v.id("productVariants")),
      quantity: v.number(),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_product", ["userId", "productId"]),

    discounts: defineTable({
      code: v.string(),
      type: v.union(v.literal("percentage"), v.literal("fixed"), v.literal("gift_card")),
      value: v.number(),
      minOrderAmount: v.optional(v.number()),
      maxDiscount: v.optional(v.number()),
      startDate: v.number(),
      endDate: v.number(),
      usageLimit: v.optional(v.number()),
      usedCount: v.number(),
      isActive: v.boolean(),
      productId: v.optional(v.id("products")),
      categoryId: v.optional(v.id("categories")),
      targetUserIds: v.optional(v.array(v.id("users"))),
      volumeDiscounts: v.optional(v.array(v.object({
        minQuantity: v.number(),
        discountPercent: v.number(),
      }))),
      discountType: v.optional(v.union(
        v.literal("general"),
        v.literal("welcome"),
        v.literal("birthday"),
        v.literal("loyalty"),
        v.literal("volume"),
      )),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    })
      .index("by_code", ["code"])
      .index("by_isActive", ["isActive"]),

    settings: defineTable({
      key: v.string(),
      value: v.any(),
      category: v.string(),
      isPublic: v.boolean(),
      updatedAt: v.number(),
    })
      .index("by_key", ["key"])
      .index("by_category", ["category"]),

    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.string(),
      isRead: v.boolean(),
      link: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_read", ["userId", "isRead"]),

    tickets: defineTable({
      userId: v.id("users"),
      subject: v.string(),
      message: v.string(),
      category: v.union(
        v.literal("technical"),
        v.literal("financial"),
        v.literal("product"),
        v.literal("general")
      ),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical")
      ),
      status: v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("answered"),
        v.literal("closed")
      ),
      assigneeId: v.optional(v.id("users")),
      department: v.optional(v.string()),
      rating: v.optional(v.number()),
      ratingFeedback: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_assignee", ["assigneeId"]),

    ticketReplies: defineTable({
      ticketId: v.id("tickets"),
      userId: v.id("users"),
      message: v.string(),
      attachments: v.optional(v.array(v.string())),
      createdAt: v.number(),
    })
      .index("by_ticket", ["ticketId"]),

    roles: defineTable({
      name: v.string(),
      nameFa: v.string(),
      permissions: v.array(v.string()),
      isSystem: v.boolean(),
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_name", ["name"]),

    brands: defineTable({
      name: v.string(),
      slug: v.string(),
      logo: v.optional(v.string()),
      description: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_isActive", ["isActive"]),

    shippingMethods: defineTable({
      name: v.string(),
      nameFa: v.string(),
      type: v.union(
        v.literal("pickup"),
        v.literal("post"),
        v.literal("courier"),
        v.literal("express")
      ),
      icon: v.optional(v.string()),
      image: v.optional(v.string()),
      cost: v.number(),
      freeShippingMinAmount: v.optional(v.number()),
      regions: v.optional(v.array(v.string())),
      isActive: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_isActive", ["isActive"]),

    pageViews: defineTable({
      path: v.string(),
      date: v.string(),
      viewCount: v.number(),
      uniqueVisitors: v.number(),
    })
      .index("by_path", ["path"])
      .index("by_date", ["date"]),

    productViews: defineTable({
      productId: v.id("products"),
      userId: v.optional(v.id("users")),
      sessionId: v.string(),
      viewDate: v.number(),
    })
      .index("by_product", ["productId"])
      .index("by_viewDate", ["viewDate"]),

    messages: defineTable({
      chatId: v.string(),
      senderId: v.string(),
      receiverId: v.string(),
      body: v.string(),
      attachments: v.optional(v.array(v.string())),
      isRead: v.boolean(),
      readAt: v.optional(v.number()),
      createdAt: v.number(),
      sessionId: v.optional(v.string()),
      senderName: v.optional(v.string()),
      senderEmail: v.optional(v.string()),
      senderPhone: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      chatEnded: v.optional(v.boolean()),
      endedBy: v.optional(v.string()),
      endedAt: v.optional(v.number()),
    })
      .index("by_chatId", ["chatId"])
      .index("by_sender", ["senderId"])
      .index("by_receiver", ["receiverId"]),

    auditLogs: defineTable({
      action: v.string(),
      entity: v.string(),
      entityId: v.string(),
      userId: v.id("users"),
      details: v.optional(v.string()),
      ip: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_entity", ["entity"])
      .index("by_action", ["action"]),

    bookings: defineTable({
      userId: v.id("users"),
      service: v.string(),
      date: v.number(),
      time: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("completed")
      ),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_date", ["date"])
      .index("by_status", ["status"]),

    emailTemplates: defineTable({
      name: v.string(),
      subject: v.string(),
      body: v.string(),
      type: v.string(),
      variables: v.array(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_type", ["type"])
      .index("by_isActive", ["isActive"]),

    wishlists: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      notifyOnStock: v.optional(v.boolean()),
      notifyOnSale: v.optional(v.boolean()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_product", ["userId", "productId"]),

    reviews: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      rating: v.number(),
      title: v.optional(v.string()),
      comment: v.optional(v.string()),
      pros: v.optional(v.array(v.string())),
      cons: v.optional(v.array(v.string())),
      isBuyer: v.optional(v.boolean()),
      likesCount: v.optional(v.number()),
      status: v.optional(v.string()),
      isApproved: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_product", ["productId"])
      .index("by_user", ["userId"])
      .index("by_product_approved", ["productId", "isApproved"]),

    questions: defineTable({
      productId: v.id("products"),
      userId: v.id("users"),
      content: v.string(),
      answers: v.optional(v.array(v.object({
        userId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
        isStoreAdmin: v.boolean()
      }))),
      status: v.string(),
      createdAt: v.number(),
    })
      .index("by_product", ["productId"])
      .index("by_user", ["userId"]),

    productVariants: defineTable({
      productId: v.id("products"),
      type: v.string(),
      value: v.string(),
      colorCode: v.optional(v.string()),
      priceAdjustment: v.number(),
      stock: v.number(),
      sku: v.optional(v.string()),
    })
      .index("by_product", ["productId"]),

    wallets: defineTable({
      userId: v.id("users"),
      balance: v.number(),
      points: v.number(),
    })
      .index("by_user", ["userId"]),

    walletTransactions: defineTable({
      walletId: v.id("wallets"),
      amount: v.number(),
      type: v.union(v.literal("deposit"), v.literal("withdrawal"), v.literal("purchase"), v.literal("reward")),
      description: v.string(),
      createdAt: v.number(),
    })
      .index("by_wallet", ["walletId"]),

    banners: defineTable({
      title: v.string(),
      imageUrl: v.string(),
      link: v.string(),
      position: v.string(),
      isActive: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_isActive", ["isActive"])
      .index("by_position", ["position"]),

    loyaltyPoints: defineTable({
      userId: v.id("users"),
      points: v.number(),
      reason: v.string(),
      orderId: v.optional(v.id("orders")),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"]),

    newsletters: defineTable({
      email: v.string(),
      name: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }).index("by_email", ["email"]),

    loginAttempts: defineTable({
      identifier: v.string(),
      attempts: v.number(),
      lastAttempt: v.number(),
      lockedUntil: v.optional(v.number()),
      createdAt: v.number(),
    }).index("by_identifier", ["identifier"]),

    contentPages: defineTable({
      slug: v.string(),
      title: v.string(),
      titleEn: v.optional(v.string()),
      content: v.string(),
      contentEn: v.optional(v.string()),
      lastUpdated: v.string(),
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_isActive", ["isActive"]),

    translations: defineTable({
      key: v.string(),
      fa: v.string(),
      en: v.string(),
      category: v.optional(v.string()),
      updatedAt: v.number(),
    })
      .index("by_key", ["key"])
      .index("by_category", ["category"]),

    chatRatings: defineTable({
      chatId: v.string(),
      sessionId: v.string(),
      rating: v.number(),
      feedback: v.optional(v.string()),
      guestName: v.optional(v.string()),
      guestEmail: v.optional(v.string()),
      ratedAt: v.number(),
    })
      .index("by_chatId", ["chatId"])
      .index("by_sessionId", ["sessionId"]),

    returnRequests: defineTable({
      orderId: v.id("orders"),
      userId: v.id("users"),
      productId: v.id("products"),
      reason: v.string(),
      images: v.array(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("refunded"),
      ),
      adminNote: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_order", ["orderId"])
      .index("by_status", ["status"]),

    vendors: defineTable({
      userId: v.id("users"),
      storeName: v.string(),
      contactName: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      commissionRate: v.number(),
      status: v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("pending"),
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    inventory: defineTable({
      productId: v.id("products"),
      variantId: v.optional(v.id("productVariants")),
      warehouseId: v.optional(v.id("warehouses")),
      quantity: v.number(),
      reservedQuantity: v.optional(v.number()),
      minStock: v.optional(v.number()),
      maxStock: v.optional(v.number()),
      unit: v.optional(v.string()),
      updatedAt: v.number(),
    })
      .index("by_product", ["productId"])
      .index("by_warehouse", ["warehouseId"])
      .index("by_product_warehouse", ["productId", "warehouseId"]),

    inventoryMovements: defineTable({
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
        v.literal("transfer"),
      ),
      quantity: v.number(),
      referenceId: v.optional(v.string()),
      referenceType: v.optional(v.string()),
      note: v.optional(v.string()),
      userId: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_product", ["productId"])
      .index("by_warehouse", ["warehouseId"])
      .index("by_type", ["type"])
      .index("by_createdAt", ["createdAt"]),

    warehouses: defineTable({
      name: v.string(),
      code: v.string(),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      managerId: v.optional(v.id("users")),
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_code", ["code"])
      .index("by_isActive", ["isActive"]),

    licenses: defineTable({
      key: v.string(),
      type: v.union(
        v.literal("monthly"),
        v.literal("yearly"),
        v.literal("permanent")
      ),
      expiryDate: v.optional(v.number()),
      isActive: v.boolean(),
      features: v.any(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;
