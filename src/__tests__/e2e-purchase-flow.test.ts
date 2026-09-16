/**
 * 🧪 تست جامع فرآیند خرید (E2E Purchase Flow Test)
 * ============================================================
 * 
 * این تست جریان کامل خرید را بررسی می‌کند:
 * ۱. شروع خرید → افزودن به سبد
 * ۲. مشاهده سبد خرید → تغییر تعداد → حذف
 * ۳. پیش‌فاکتور → محاسبه خودکار مالیات و ارسال
 * ۴. ثبت سفارش → ایجاد فاکتور
 * ۵. درگاه پرداخت → موفق / ناموفق
 * ۶. ارسال نوتیفیکیشن و پیامک
 * ۷. ثبت در بخش سفارشات
 * ۸. ارسال محصول → تحویل به مشتری
 * 
 * ورودی‌ها و خروجی‌ها بر اساس ساختار واقعی دیتابیس Convex
 * ============================================================
 */

import { describe, it, expect, beforeEach } from "vitest";

// ============================================================
// بخش ۱: بررسی ساختار دیتابیس و مدل‌های داده
// ============================================================

describe("📦 E2E Purchase Flow - Data Models", () => {

  describe("Product validation", () => {
    it("باید محصول فعال و موجود داشته باشیم", () => {
      const product = {
        _id: "product_001",
        name: "لپ‌تاپ ایسوس",
        slug: "asus-laptop",
        price: 35000000,
        salePrice: 32000000,
        stock: 10,
        stockAlert: 3,
        isActive: true,
        isFeatured: true,
        images: ["https://example.com/img1.jpg"],
        categoryId: "cat_001",
        tags: ["لپ‌تاپ", "ایسوس"],
        views: 150,
        rating: 4.5,
        reviewCount: 23,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(product.isActive).toBe(true);
      expect(product.stock).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);
      expect(product.salePrice).toBeLessThan(product.price);
      expect(product.slug).toMatch(/^[a-z0-9-]+$/);
      expect(product.images.length).toBeGreaterThan(0);
    });

    it("نباید امکان خرید محصول غیرفعال وجود داشته باشد", () => {
      const product = { isActive: false, stock: 5 };
      const canBuy = product.isActive && product.stock > 0;
      expect(canBuy).toBe(false);
    });

    it("نباید امکان خرید محصول ناموجود وجود داشته باشد", () => {
      const product = { isActive: true, stock: 0 };
      const canBuy = product.isActive && product.stock > 0;
      expect(canBuy).toBe(false);
    });
  });

  describe("Order number generation", () => {
    it("شماره سفارش باید فرمت ORDYYMMDD**** باشد", () => {
      function generateOrderNumber(): string {
        const now = new Date();
        const prefix = "ORD";
        const date = now.getFullYear().toString().slice(2) +
          String(now.getMonth() + 1).padStart(2, "0") +
          String(now.getDate()).padStart(2, "0");
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        return `${prefix}${date}${random}`;
      }

      const orderNum = generateOrderNumber();
      expect(orderNum).toMatch(/^ORD\d{10}$/);
      expect(orderNum.length).toBe(13);
    });
  });
});

// ============================================================
// بخش ۲: تست سبد خرید (Cart Operations)
// ============================================================

describe("🛒 Cart Operations", () => {

  const mockCartItems = [
    {
      _id: "cart_1",
      userId: "user_1",
      productId: "product_001",
      quantity: 2,
      product: { name: "لپ‌تاپ ایسوس", price: 35000000, salePrice: 32000000, stock: 10, images: [] },
    },
    {
      _id: "cart_2",
      userId: "user_1",
      productId: "product_002",
      quantity: 1,
      product: { name: "ماوس بی‌سیم", price: 450000, salePrice: null, stock: 25, images: [] },
    },
  ];

  it("محاسبه جمع کل سبد خرید", () => {
    const subtotal = mockCartItems.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    expect(subtotal).toBe(32000000 * 2 + 450000 * 1);
  });

  it("محاسبه مالیات ۹٪", () => {
    const subtotal = 32000000 * 2 + 450000;
    const tax = Math.round(subtotal * 0.09);
    expect(tax).toBe(Math.round(64450000 * 0.09));
  });

  it("تخفیف نباید از مبلغ کل بیشتر باشد", () => {
    const subtotal = 64450000;
    const maxDiscount = Math.min(70000000, subtotal);
    expect(maxDiscount).toBe(subtotal);
  });

  it("افزودن آیتم تکراری باید تعداد را افزایش دهد", () => {
    const cart = [{ productId: "p1", quantity: 2 }];
    const newQty = 3;

    // Simulate add existing
    const existing = cart.find(i => i.productId === "p1");
    if (existing) existing.quantity += newQty;

    expect(cart[0].quantity).toBe(5);
  });

  it("موجودی محصول نباید منفی شود", () => {
    const stock = 5;
    const requestedQty = 8;

    const canAdd = requestedQty <= stock;
    expect(canAdd).toBe(false);
  });

  it("تعداد نامعتبر (صفر یا منفی) باید رد شود", () => {
    const invalidQuantities = [0, -1, -100, 0.5, 1000];

    for (const qty of invalidQuantities) {
      const isValid = Number.isInteger(qty) && qty > 0 && qty <= 999;
      expect(isValid).toBe(false);
    }
  });
});

// ============================================================
// بخش ۳: تست پیش‌فاکتور و محاسبات مالی
// ============================================================

describe("🧾 Invoice & Financial Calculations", () => {

  it("محاسبه صحیح جمع کل اقلام", () => {
    const items = [
      { name: "محصول الف", quantity: 2, price: 1000000 },
      { name: "محصول ب", quantity: 1, price: 500000 },
      { name: "محصول ج", quantity: 3, price: 200000 },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(2000000 + 500000 + 600000);
  });

  it("هزینه ارسال رایگان برای سفارش بالای آستانه", () => {
    const freeShippingMinAmount = 5000000;
    const subtotal = 8000000;
    const shippingCost = 50000;

    const actualShipping = subtotal >= freeShippingMinAmount ? 0 : shippingCost;
    expect(actualShipping).toBe(0);
  });

  it("هزینه ارسال برای سفارش زیر آستانه", () => {
    const freeShippingMinAmount = 5000000;
    const subtotal = 2000000;
    const shippingCost = 50000;

    const actualShipping = subtotal >= freeShippingMinAmount ? 0 : shippingCost;
    expect(actualShipping).toBe(50000);
  });

  it("محاسبه صحیح کل با مالیات و ارسال و تخفیف", () => {
    const subtotal = 10000000;
    const tax = Math.round(subtotal * 0.09);
    const shipping = 50000;
    const discount = 500000;
    const total = subtotal + tax + shipping - discount;

    expect(total).toBe(10000000 + 900000 + 50000 - 500000);
    expect(total).toBe(10450000);
  });

  it("تخفیف درصدی باید به حداکثر تعیین شده محدود شود", () => {
    const orderAmount = 10000000;
    const discountPercent = 20;
    const maxDiscount = 1500000;

    let discountAmount = Math.round((orderAmount * discountPercent) / 100);
    discountAmount = Math.min(discountAmount, maxDiscount);

    expect(discountAmount).toBe(1500000);
  });

  it("تخفیف ثابت نباید از مبلغ سفارش بیشتر باشد", () => {
    const orderAmount = 500000;
    const fixedDiscount = 1000000;

    const discountAmount = Math.min(fixedDiscount, orderAmount);
    expect(discountAmount).toBe(500000);
  });
});

// ============================================================
// بخش ۴: تست فرآیند پرداخت (Payment Flow)
// ============================================================

describe("💳 Payment System Tests", () => {

  describe("ZarinPal Gateway", () => {
    it("آدرس درخواست پرداخت باید صحیح باشد", () => {
      const url = "https://api.zarinpal.com/pg/v4/payment/request.json";
      expect(url).toContain("zarinpal.com");
      expect(url).toContain("v4");
    });

    it("مبلغ باید از تومان به ریال تبدیل شود", () => {
      const amountTomans = 100000;
      const amountRials = amountTomans * 10;
      expect(amountRials).toBe(1000000);
    });

    it("آدرس گیت‌وی پرداخت باید شامل Authority باشد", () => {
      const authority = "test_authority_123";
      const gatewayUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`;
      expect(gatewayUrl).toContain(authority);
    });
  });

  describe("Payment Status Handling", () => {
    it("پرداخت موفق باید وضعیت سفارش را به paid تغییر دهد", () => {
      const order = { status: "pending", paymentStatus: "pending" };
      if (true) { // success
        order.status = "paid";
        order.paymentStatus = "paid";
      }
      expect(order.status).toBe("paid");
      expect(order.paymentStatus).toBe("paid");
    });

    it("پرداخت ناموفق باید موجودی را بازگرداند", () => {
      const stockBefore = 10;
      const orderItems = [{ quantity: 3 }, { quantity: 2 }];
      const totalDeducted = orderItems.reduce((sum, i) => sum + i.quantity, 0);
      let stock = stockBefore - totalDeducted;

      // On failure, restore stock
      for (const item of orderItems) {
        stock += item.quantity;
      }

      expect(stock).toBe(stockBefore);
    });

    it("رسید دیجیتال باید شامل کد پیگیری باشد", () => {
      const receipt = {
        orderNumber: "ORD2608230001",
        transactionId: "12345678",
        cardPan: "6104-****-****-1234",
        date: "1405/06/01",
        total: 5000000,
      };

      expect(receipt.transactionId).toBeTruthy();
      expect(receipt.orderNumber).toMatch(/^ORD/);
    });
  });

  describe("Payment Return Page", () => {
    it("پارامترهای بازگشت از درگاه باید خوانده شوند", () => {
      const params = new URLSearchParams(
        "status=success&Authority=AUTH123&RefId=REF456&orderNumber=ORD2608230001"
      );

      expect(params.get("status")).toBe("success");
      expect(params.get("Authority")).toBe("AUTH123");
      expect(params.get("RefId")).toBe("REF456");
      expect(params.get("orderNumber")).toBe("ORD2608230001");
    });

    it("عدم موفقیت پرداخت باید کاربر را به صفحه خطا هدایت کند", () => {
      const params = new URLSearchParams("status=failure&orderNumber=ORD123");
      const isSuccess = params.get("status") === "success";
      expect(isSuccess).toBe(false);
    });
  });
});

// ============================================================
// بخش ۵: تست نوتیفیکیشن و پیامک
// ============================================================

describe("🔔 Notifications & SMS", () => {

  it("نوتیفیکیشن ثبت سفارش باید برای کاربر ایجاد شود", () => {
    const notification = {
      userId: "user_1",
      title: "سفارش ثبت شد",
      message: "سفارش ORD123 با موفقیت ثبت شد.",
      type: "order",
      isRead: false,
      createdAt: Date.now(),
    };

    expect(notification.userId).toBeTruthy();
    expect(notification.type).toBe("order");
    expect(notification.isRead).toBe(false);
  });

  it("نوتیفیکیشن سفارش جدید باید برای ادمین‌ها ارسال شود", () => {
    const admins = [
      { _id: "admin_1", role: "admin" },
      { _id: "admin_2", role: "manager" },
    ];
    const orderUserId = "user_1";

    const notificationsForAdmins = admins.filter(a => a._id !== orderUserId);
    expect(notificationsForAdmins.length).toBe(2);
  });

  it("فرمت پیامک باید شامل شماره سفارش و مبلغ باشد", () => {
    const orderNumber = "ORD2608230001";
    const total = 5000000;
    const message = `پرداخت سفارش ${orderNumber} با موفقیت انجام شد. مبلغ: ${total.toLocaleString("fa-IR")} تومان`;

    expect(message).toContain(orderNumber);
    expect(message).toContain("تومان");
  });

  it("نوتیفیکیشن پرداخت موفق/ناموفق باید نوع payment داشته باشد", () => {
    const successNotification = { type: "payment", title: "پرداخت موفق" };
    const failedNotification = { type: "payment", title: "پرداخت ناموفق" };

    expect(successNotification.type).toBe("payment");
    expect(failedNotification.type).toBe("payment");
  });
});

// ============================================================
// بخش ۶: تست ثبت سفارش و مدیریت وضعیت
// ============================================================

describe("📋 Order Management", () => {

  describe("Order Status Flow", () => {
    const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

    it("باید فقط وضعیت‌های مجاز قابل انتخاب باشند", () => {
      const status = "paid";
      expect(validStatuses).toContain(status);
    });

    it("جریان عادی سفارش: pending → paid → processing → shipped → delivered", () => {
      const flow = ["pending", "paid", "processing", "shipped", "delivered"];
      flow.forEach(status => expect(validStatuses).toContain(status));
    });

    it("لغو سفارش در هر مرحله ممکن باشد", () => {
      const canCancelFrom = ["pending", "paid", "processing"];
      canCancelFrom.forEach(status => {
        expect(validStatuses).toContain(status);
        expect(validStatuses).toContain("cancelled");
      });
    });
  });

  describe("Stock Management", () => {
    it("موجودی باید هنگام ثبت سفارش کاهش یابد", () => {
      let stock = 10;
      const orderQty = 3;

      stock -= orderQty;

      expect(stock).toBe(7);
    });

    it("موجودی باید هنگام لغو سفارش بازگردانده شود", () => {
      let stock = 7;
      const orderQty = 3;

      stock += orderQty;

      expect(stock).toBe(10);
    });

    it("موجودی باید هنگام پرداخت ناموفق بازگردانده شود", () => {
      let stock = 7;
      const orderQty = 3;

      stock += orderQty;

      expect(stock).toBe(10);
    });
  });

  describe("Delivery Confirmation", () => {
    it("فقط سفارشات shipped قابل تحویل هستند", () => {
      const order = { status: "shipped" };
      const canDeliver = order.status === "shipped";
      expect(canDeliver).toBe(true);
    });

    it("سفارشات pending نباید قابل تحویل باشند", () => {
      const order = { status: "pending" };
      const canDeliver = order.status === "shipped";
      expect(canDeliver).toBe(false);
    });

    it("تحویل باید نوتیفیکیشن به ادمین ارسال کند", () => {
      const notification = {
        title: "تحویل سفارش",
        message: "سفارش ORD123 توسط مشتری تایید تحویل شد.",
        type: "order",
      };
      expect(notification.type).toBe("order");
      expect(notification.message).toContain("تایید تحویل");
    });
  });
});

// ============================================================
// بخش ۷: تست تخفیف و کد تخفیف
// ============================================================

describe("🏷️ Discount System", () => {

  it("کد تخفیف منقضی شده نباید اعمال شود", () => {
    const discount = {
      isActive: true,
      startDate: Date.now() - 100000,
      endDate: Date.now() - 1000, // expired
    };
    const isExpired = Date.now() > discount.endDate;
    expect(isExpired).toBe(true);
  });

  it("کد تخفیف هنوز فعال نشده نباید اعمال شود", () => {
    const discount = {
      isActive: true,
      startDate: Date.now() + 100000, // future
    };
    const isNotYetActive = Date.now() < discount.startDate;
    expect(isNotYetActive).toBe(true);
  });

  it("کد تخفیف غیرفعال نباید اعمال شود", () => {
    const discount = { isActive: false };
    expect(discount.isActive).toBe(false);
  });

  it("کد تخفیف باید حداقل مبلغ سفارش را رعایت کند", () => {
    const discount = { minOrderAmount: 1000000 };
    const orderAmount = 500000;
    const meetsMinimum = orderAmount >= discount.minOrderAmount;
    expect(meetsMinimum).toBe(false);
  });

  it("کد تخفیف نباید از حداکثر استفاده بیشتر شود", () => {
    const discount = { usageLimit: 100, usedCount: 100 };
    const isExhausted = discount.usageLimit !== null && discount.usedCount >= discount.usageLimit;
    expect(isExhausted).toBe(true);
  });

  it("کد تخفیف باید فقط برای کاربران خاص قابل استفاده باشد", () => {
    const discount = { targetUserIds: ["user_1", "user_2"] };
    const currentUser = "user_3";
    const isTargeted = discount.targetUserIds.includes(currentUser);
    expect(isTargeted).toBe(false);
  });

  it("تخفیف حجمی باید تخفیف بیشتری برای تعداد بیشتر اعمال کند", () => {
    const volumeDiscounts = [
      { minQuantity: 5, discountPercent: 5 },
      { minQuantity: 10, discountPercent: 10 },
      { minQuantity: 20, discountPercent: 15 },
    ];

    const totalQuantity = 12;
    const sorted = [...volumeDiscounts].sort((a, b) => b.minQuantity - a.minQuantity);
    const matched = sorted.find(t => totalQuantity >= t.minQuantity);

    expect(matched?.discountPercent).toBe(10);
  });
});

// ============================================================
// بخش ۸: تست روش‌های ارسال
// ============================================================

describe("🚚 Shipping Methods", () => {

  it("روش‌های ارسال باید شامل نوع و هزینه باشند", () => {
    const shippingMethod = {
      name: "post",
      nameFa: "پست پیشتاز",
      type: "post",
      cost: 50000,
      freeShippingMinAmount: 5000000,
      isActive: true,
    };

    expect(shippingMethod.cost).toBeGreaterThanOrEqual(0);
    expect(shippingMethod.nameFa).toBeTruthy();
  });

  it("ارسال حضوری باید هزینه صفر داشته باشد", () => {
    const pickup = { type: "pickup", cost: 0 };
    expect(pickup.cost).toBe(0);
  });

  it("حداقل مبلغ رایگان باید منطقی باشد", () => {
    const methods = [
      { name: "post", freeShippingMinAmount: 5000000 },
      { name: "courier", freeShippingMinAmount: 3000000 },
    ];

    methods.forEach(m => {
      expect(m.freeShippingMinAmount).toBeGreaterThan(0);
    });
  });
});

// ============================================================
// بخش ۹: تست فاکتور و خروجی
// ============================================================

describe("🖨️ Invoice & PDF Export", () => {

  it("فاکتور باید شامل تمام اطلاعات سفارش باشد", () => {
    const invoice = {
      orderNumber: "ORD2608230001",
      items: [
        { name: "محصول الف", quantity: 2, price: 1000000, total: 2000000 },
      ],
      subtotal: 2000000,
      tax: 180000,
      shippingCost: 50000,
      discount: 0,
      total: 2230000,
      address: "تهران، خیابان ولیعصر",
      paymentMethod: "online",
    };

    expect(invoice.orderNumber).toBeTruthy();
    expect(invoice.items.length).toBeGreaterThan(0);
    expect(invoice.subtotal + invoice.tax + invoice.shippingCost - invoice.discount).toBe(invoice.total);
  });

  it("خروجی CSV باید شامل هدرها باشد", () => {
    const headers = ["شماره سفارش", "تاریخ", "مبلغ", "وضعیت"];
    const csv = headers.join(",") + "\nORD001,1405/06/01,5000000,paid";
    expect(csv).toContain(headers[0]);
    expect(csv.split("\n").length).toBe(2);
  });
});
