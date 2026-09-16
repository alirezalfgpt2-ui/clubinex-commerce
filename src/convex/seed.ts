import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Auto-assign admin role to the first user (single-seller store)
    const allUsers = await ctx.db.query("users").collect();
    const hasAdmin = allUsers.some((u) => u.role === "admin");
    // همیشه نقش و اطلاعات کاربر را به‌روزرسانی کن
    await ctx.db.patch(userId, {
      role: "admin",
      isActive: true,
      name: user.name || "مدیر سیستم",
      email: user.email || "admin@example.com",
      phone: user.phone || "09123456789",
      nationalCode: user.nationalCode || "0012345678",
      postalCode: user.postalCode || "1234567890",
      address: user.address || "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      gender: user.gender || "male",
      updatedAt: Date.now(),
    });
    user.role = "admin";

    // For single-seller store, allow any authenticated user to seed
    // In multi-tenant, this would check for admin role

    const now = Date.now();
    const day = 86400000;

    // ── Categories ──
    const catPhones = await ctx.db.insert("categories", { name: "موبایل و تبلت", slug: "mobile", description: "گوشی موبایل و تبلت", level: 0, order: 0, isActive: true });
    const catLaptop = await ctx.db.insert("categories", { name: "لپتاپ و کامپیوتر", slug: "laptop", description: "لپتاپ و کامپیوتر", level: 0, order: 1, isActive: true });
    const catClothes = await ctx.db.insert("categories", { name: "پوشاک", slug: "clothes", description: "لباس و پوشاک مردانه و زنانه", level: 0, order: 2, isActive: true });
    const catHome = await ctx.db.insert("categories", { name: "خانه و آشپزخانه", slug: "home", description: "لوازم خانگی", level: 0, order: 3, isActive: true });
    const catPhoneAcc = await ctx.db.insert("categories", { name: "لوازم جانبی موبایل", slug: "phone-accessories", description: "قاب، شارژر و لوازم جانبی", level: 1, order: 0, isActive: true, parentId: catPhones });
    const catSubLaptop = await ctx.db.insert("categories", { name: "لپتاپ گیمینگ", slug: "gaming-laptop", description: "لپتاپ‌های مخصوص بازی", level: 1, order: 0, isActive: true, parentId: catLaptop });

    // ── Brands ──
    const brandSamsung = await ctx.db.insert("brands", { name: "Samsung", slug: "samsung", description: "برند کره‌ای", isActive: true, createdAt: now });
    const brandApple = await ctx.db.insert("brands", { name: "Apple", slug: "apple", description: "برند آمریکایی", isActive: true, createdAt: now });
    const brandNike = await ctx.db.insert("brands", { name: "Nike", slug: "nike", description: "برند ورزشی", isActive: true, createdAt: now });
    const brandDell = await ctx.db.insert("brands", { name: "Dell", slug: "dell", description: "برند آمریکایی", isActive: true, createdAt: now });
    const brandXiaomi = await ctx.db.insert("brands", { name: "Xiaomi", slug: "xiaomi", description: "برند چینی", isActive: true, createdAt: now });

    // ── Products ──
    // Using picsum.photos for placeholder images
    const products = [
      { name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", description: "گوشی پرچم‌دار سامسونگ با دوربین ۲۰۰ مگاپیکسلی، نمایشگر Dynamic AMOLED 2X و قلم S Pen. پردازنده Snapdragon 8 Gen 3 و باتری ۵۰۰۰ میلی‌آمپری.", shortDescription: "گوشی پرچم‌دار سامسونگ", price: 75000000, salePrice: 68000000, stock: 25, stockAlert: 5, images: ["https://picsum.photos/seed/samsung-s24/600/600"], categoryId: catPhoneAcc, tags: ["گوشی", "سامسونگ", "پرچم‌دار"], brand: "Samsung", isFeatured: true, isActive: true, views: 1240, rating: 4.5, reviewCount: 32 },
      { name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", description: "جدیدترین گوشی اپل با تراشه A17 Pro، بدنه تیتانیومی و دوربین پیشرفته. پشتیبانی از USB-C و Dynamic Island.", shortDescription: "جدیدترین آیفون اپل", price: 89000000, stock: 15, stockAlert: 3, images: ["https://picsum.photos/seed/iphone15/600/600"], categoryId: catPhoneAcc, tags: ["گوشی", "اپل", "آیفون"], brand: "Apple", isFeatured: true, isActive: true, views: 2100, rating: 4.8, reviewCount: 56 },
      { name: "Xiaomi 14 Pro", slug: "xiaomi-14-pro", description: "گوشی شیائومی با دوربین Hasselblad، نمایشگر LTPO AMOLED و شارژ سریع ۱۲۰ وات. ارزش خرید بالا.", shortDescription: "گوشی شیائومی با دوربین عالی", price: 32000000, salePrice: 28000000, stock: 40, stockAlert: 10, images: ["https://picsum.photos/seed/xiaomi14/600/600"], categoryId: catPhoneAcc, tags: ["گوشی", "شیائومی"], brand: "Xiaomi", isFeatured: false, isActive: true, views: 870, rating: 4.3, reviewCount: 18 },
      { name: "Dell XPS 15", slug: "dell-xps-15", description: "لپتاپ ۱۵ اینچی Dell با نمایشگر OLED InfinityEdge، پردازنده Intel Core i7 نسل ۱۴ و ۱۶ گیگابایت رم. مناسب کار و طراحی.", shortDescription: "لپتاپ ۱۵ اینچی حرفه‌ای", price: 65000000, salePrice: 58000000, stock: 10, stockAlert: 2, images: ["https://picsum.photos/seed/dell-xps/600/600"], categoryId: catLaptop, tags: ["لپتاپ", "دل"], brand: "Dell", isFeatured: true, isActive: true, views: 650, rating: 4.6, reviewCount: 12 },
      { name: "MacBook Air M3", slug: "macbook-air-m3", description: "لپتاپ سبک و قدرتمند اپل با تراشه M3، ۱۵ اینچ نمایشگر Liquid Retina و ۱۸ ساعت عمر باتری.", shortDescription: "لپتاپ سبک اپل", price: 72000000, stock: 8, stockAlert: 2, images: ["https://picsum.photos/seed/macbook-m3/600/600"], categoryId: catLaptop, tags: ["لپتاپ", "اپل", "مک"], brand: "Apple", isFeatured: true, isActive: true, views: 1580, rating: 4.9, reviewCount: 44 },
      { name: "Nike Air Max 270", slug: "nike-air-max-270", description: "کفش ورزشی نایک با فناوری Air Max و زیره راحت. مناسب پیاده‌روی و ورزش روزمره.", shortDescription: "کفش ورزشی نایک", price: 4500000, salePrice: 3800000, stock: 50, stockAlert: 10, images: ["https://picsum.photos/seed/nike-air/600/600"], categoryId: catClothes, tags: ["کفش", "نایک", "ورزشی"], brand: "Nike", isFeatured: false, isActive: true, views: 920, rating: 4.2, reviewCount: 28 },
      { name: "هودی مردانه کلاسیک", slug: "mens-classic-hoodie", description: "هودی مردانه با پارچه نرم و گرم، مناسب فصل پاییز و زمستان. رنگ‌بندی متنوع.", shortDescription: "هودی مردانه گرم و راحت", price: 1200000, stock: 100, stockAlert: 20, images: ["https://picsum.photos/seed/hoodie/600/600"], categoryId: catClothes, tags: ["هودی", "مردانه"], isFeatured: false, isActive: true, views: 340, rating: 4.0, reviewCount: 8 },
      { name: "قاب گوشی چرمی", slug: "leather-phone-case", description: "قاب چرمی اصل برای آیفون ۱۵ پرو. محافظت کامل از گوشی با ظاهر شیک و حرفه‌ای.", shortDescription: "قاب چرمی آیفون", price: 450000, salePrice: 350000, stock: 200, stockAlert: 30, images: ["https://picsum.photos/seed/phone-case/600/600"], categoryId: catPhoneAcc, tags: ["قاب", "چرمی", "آیفون"], isFeatured: false, isActive: true, views: 560, rating: 4.1, reviewCount: 15 },
      { name: "ظرف پخت و پز ۵ تکه", slug: "cooking-set-5pc", description: "ست ظروف پخت و پز با کیفیت بالا شامل ماهیتابه، قابلمه و درب. مناسب انواع اجاق‌ها.", shortDescription: "ست ۵ تکه آشپزخانه", price: 2800000, salePrice: 2400000, stock: 30, stockAlert: 5, images: ["https://picsum.photos/seed/cooking-set/600/600"], categoryId: catHome, tags: ["آشپزخانه", "ظروف"], isFeatured: false, isActive: true, views: 210, rating: 4.4, reviewCount: 6 },
      { name: "ASUS ROG Strix G16", slug: "asus-rog-strix-g16", description: "لپتاپ گیمینگ ASUS با پردازنده Intel i9، کارت گرافیک RTX 4070، نمایشگر ۱۶ اینچی ۱۶۵ هرتز.", shortDescription: "لپتاپ گیمینگ قدرتمند", price: 95000000, salePrice: 88000000, stock: 5, stockAlert: 1, images: ["https://picsum.photos/seed/asus-rog/600/600"], categoryId: catSubLaptop, tags: ["گیمینگ", "ایسوس"], isFeatured: true, isActive: true, views: 780, rating: 4.7, reviewCount: 22 },
    ];

    const productIds: any[] = [];
    for (const p of products) {
      const pid = await ctx.db.insert("products", { ...p, views: p.views ?? 0, createdAt: now - Math.floor(Math.random() * 30) * day, updatedAt: now });
      productIds.push(pid);
    }

    // ── Shipping Methods ──
    const shipPost = await ctx.db.insert("shippingMethods", { name: "Post", nameFa: "پست پیشتاز", type: "post", cost: 45000, freeShippingMinAmount: 5000000, isActive: true, createdAt: now });
    const shipCourier = await ctx.db.insert("shippingMethods", { name: "Courier", nameFa: "پیک موتوری", type: "courier", cost: 85000, isActive: true, createdAt: now });
    const shipPickup = await ctx.db.insert("shippingMethods", { name: "Pickup", nameFa: "دریافت حضوری", type: "pickup", cost: 0, isActive: true, createdAt: now });

    // ── Discounts ──
    await ctx.db.insert("discounts", { code: "WELCOME10", type: "percentage", value: 10, minOrderAmount: 1000000, startDate: now, endDate: now + 90 * day, usedCount: 0, isActive: true, createdAt: now });
    await ctx.db.insert("discounts", { code: "FLAT500K", type: "fixed", value: 500000, minOrderAmount: 5000000, startDate: now, endDate: now + 60 * day, usageLimit: 100, usedCount: 12, isActive: true, createdAt: now });
    await ctx.db.insert("discounts", { code: "SUMMER25", type: "percentage", value: 25, maxDiscount: 2000000, startDate: now, endDate: now + 30 * day, usageLimit: 50, usedCount: 35, isActive: true, createdAt: now });

    // ── Roles ──
    const existingRoles = await ctx.db.query("roles").collect();
    if (existingRoles.length === 0) {
      await ctx.db.insert("roles", { name: "admin", nameFa: "مدیر ارشد", permissions: ["*"], isSystem: true, isActive: true, createdAt: now, updatedAt: now });
      await ctx.db.insert("roles", { name: "manager", nameFa: "مدیر فروشگاه", permissions: ["products.view", "products.create", "products.edit", "orders.view", "orders.edit", "users.view", "reports.view"], isSystem: true, isActive: true, createdAt: now, updatedAt: now });
      await ctx.db.insert("roles", { name: "operator", nameFa: "اپراتور", permissions: ["orders.view", "tickets.view", "tickets.reply", "users.view"], isSystem: false, isActive: true, createdAt: now, updatedAt: now });
      await ctx.db.insert("roles", { name: "user", nameFa: "کاربر", permissions: ["products.view"], isSystem: true, isActive: true, createdAt: now, updatedAt: now });
    }

    // ── Settings ──
    const settingsData: [string, any, string][] = [
      ["siteName", "Clubinex Commerce", "general"],
      ["siteDescription", "فروشگاه آنلاین هوشمند", "general"],
      ["sitePhone", "۰۲۱-۱۲۳۴۵۶۷۸", "general"],
      ["siteEmail", "support@clubinex.com", "general"],
      ["siteAddress", "تهران، خیابان ولیعصر، پلاک ۱۲۳", "general"],
      ["seoTitle", "Clubinex Commerce — فروشگاه آنلاین", "seo"],
      ["seoDescription", "فروشگاه اینترنتی Clubinex با بهترین قیمت‌ها و ارسال سریع", "seo"],
      ["seoKeywords", "فروشگاه, آنلاین, خرید, تخفیف, Clubinex", "seo"],
      ["instagram", "https://instagram.com/clubinex", "social"],
      ["telegram", "https://t.me/clubinex", "social"],
      ["whatsapp", "۰۹۱۲۱۲۳۴۵۶۷", "social"],
      ["captchaEnabled", false, "captcha"],
      ["contactWorkingHours", "شنبه تا پنج‌شنبه ۹ تا ۱۸", "about"],
      ["aboutStory", "فروشگاه ما از سال ۱۳۹۸ با هدف ارائه بهترین محصولات و خدمات به مشتریان عزیز آغاز به کار کرد. ما با تیمی مجرب و حرفه‌ای، همواره تلاش می‌کنیم تا بهترین تجربه خرید آنلاین را برای شما فراهم کنیم. رضایت مشتریان، سرلوحه کار ماست.", "about"],
      ["aboutStory2", "با بیش از ۵۰ هزار مشتری راضی و بیش از ۱۰ هزار محصول متنوع، ما یکی از معتبرترین فروشگاه‌های آنلاین کشور هستیم. تیم پشتیبانی ما ۲۴ ساعته آماده پاسخگویی به سوالات شماست.", "about"],
      ["aboutStats", [
        { value: "۱۰,۰۰۰+", label: "محصول متنوع" },
        { value: "۵۰,۰۰۰+", label: "مشتری راضی" },
        { value: "۹۹.۹٪", label: "رضایت از خدمات" },
        { value: "۲۴/۷", label: "پشتیبانی" },
      ], "about"],
      ["aboutFeatures", [
        { title: "خرید امن", desc: "پرداخت امن و محافظت از اطلاعات شخصی شما" },
        { title: "ارسال سریع", desc: "ارسال سریع و مطمئن به سراسر کشور" },
        { title: "پشتیبانی ۲۴/۷", desc: "تیم پشتیبانی ما همواره آماده کمک است" },
        { title: "پرداخت آسان", desc: "پرداخت از طریق کلیه کارت‌های بانکی" },
      ], "about"],
      ["departments", [
        { id: "sales", name: "فروش", icon: "ShoppingCart", color: "#10b981" },
        { id: "supply", name: "تامین", icon: "Package", color: "#3b82f6" },
        { id: "support", name: "پشتیبانی", icon: "Headphones", color: "#8b5cf6" },
        { id: "site", name: "سایت", icon: "Globe", color: "#06b6d4" },
        { id: "finance", name: "مالی", icon: "DollarSign", color: "#f59e0b" },
        { id: "hr", name: "نیروی انسانی", icon: "Users", color: "#f43f5e" },
      ], "general"],
    ];
    for (const [key, value, category] of settingsData) {
      const existing = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (!existing) {
        await ctx.db.insert("settings", { key, value, category, isPublic: true, updatedAt: now });
      }
    }

    // ── Notifications ──
    const notifTitles = [
      { title: "خوش آمدید!", message: "به Clubinex Commerce خوش آمدید. از خرید خود لذت ببرید.", type: "system" },
      { title: "سفارش ثبت شد", message: "سفارش شما با موفقیت ثبت و در حال پردازش است.", type: "order" },
      { title: "پرداخت موفق", message: "پرداخت سفارش ORD25080001 با موفقیت انجام شد.", type: "payment" },
      { title: "تخفیف ویژه", message: "کد تخفیف WELCOME10 برای شما فعال شد — ۱۰٪ تخفیف روی اولین خرید!", type: "product" },
      { title: "موجود شدن محصول", message: "محصول مورد نظر شما مجدداً موجود شد.", type: "inventory" },
    ];
    for (let i = 0; i < notifTitles.length; i++) {
      await ctx.db.insert("notifications", { userId, ...notifTitles[i], isRead: i > 2, createdAt: now - i * 2 * 3600000 });
    }

    // ── Tickets ──
    const ticketId = await ctx.db.insert("tickets", { userId, subject: "سؤال درباره زمان ارسال سفارش", message: "سلام، می‌خواستم بدانم سفارش من چه زمانی ارسال می‌شود. شماره سفارش: ORD25080001", category: "general", priority: "medium", status: "open", createdAt: now - day, updatedAt: now - day });
    await ctx.db.insert("ticketReplies", { ticketId, userId, message: "با سلام و احترام. سفارش شما تا ۲۴ ساعت آینده ارسال خواهد شد.", createdAt: now - 12 * 3600000 });

    // ── Bookings ──
    await ctx.db.insert("bookings", { userId, service: "مشاوره خرید تلفنی", date: now + 2 * day, time: "10:00", status: "confirmed", notes: "مشاوره درباره انتخاب لپتاپ", createdAt: now });
    await ctx.db.insert("bookings", { userId, service: "خدمات پس از فروش", date: now + 5 * day, time: "14:30", status: "pending", createdAt: now });
    await ctx.db.insert("bookings", { userId, service: "ملاقات حضوری", date: now + 7 * day, time: "09:00", status: "pending", notes: "بازدید از نمایشگاه", createdAt: now });

    // ── Orders (sample) ──
    const orderStatuses: Array<"pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled"> = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
    const payStatuses: Array<"pending" | "paid" | "failed" | "refunded"> = ["pending", "paid", "paid", "paid", "paid", "failed"];
    for (let i = 0; i < 6; i++) {
      const prodIndex = i % productIds.length;
      const qty = i + 1;
      const price = products[prodIndex].price;
      const total = price * qty;
      await ctx.db.insert("orders", {
        orderNumber: `ORD${25080000 + i}`,
        userId,
        items: [{
          productId: productIds[prodIndex],
          name: products[prodIndex].name,
          quantity: qty,
          price,
          total,
        }],
        subtotal: total,
        tax: Math.round(total * 0.1),
        shippingCost: i < 3 ? 45000 : 0,
        discount: i === 2 ? Math.round(total * 0.1) : 0,
        total: total + Math.round(total * 0.1) + (i < 3 ? 45000 : 0) - (i === 2 ? Math.round(total * 0.1) : 0),
        status: orderStatuses[i],
        paymentStatus: payStatuses[i],
        paymentMethod: i % 2 === 0 ? "درگاه آنلاین" : "کارت به کارت",
        shippingMethod: "پست پیشتاز",
        address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
        postalCode: "۱۲۳۴۵۶۷۸۹۰",
        createdAt: now - (5 - i) * day,
        updatedAt: now - (5 - i) * day,
      });
    }

    // ── Product Views (sample analytics) ──
    for (let i = 0; i < 15; i++) {
      const prodIndex = i % productIds.length;
      await ctx.db.insert("productViews", {
        productId: productIds[prodIndex],
        userId,
        sessionId: `session-${i}-${now}`,
        viewDate: now - Math.floor(Math.random() * 30) * day,
      });
    }

    // ── Audit Logs ──
    await ctx.db.insert("auditLogs", { action: "login", entity: "user", entityId: userId, userId, details: "ورود موفق", createdAt: now });
    await ctx.db.insert("auditLogs", { action: "create", entity: "product", entityId: productIds[0], userId, details: "ایجاد محصول Samsung Galaxy S24 Ultra", createdAt: now - 3600000 });

    // ── Licenses ──
    const existingLicense = await ctx.db.query("licenses").first();
    if (!existingLicense) {
      await ctx.db.insert("licenses", { key: "CLUBINEX-PRO-2026", type: "permanent", isActive: true, features: { products: true, orders: true, tickets: true, chat: true, reports: true, emailTemplates: true, bookings: true, brands: true, settings: true, discounts: true, shipping: true, roles: true }, createdAt: now, updatedAt: now });
    }

    // ── روش‌های ارسال ──
    const existingShipping = await ctx.db.query("shippingMethods").first();
    if (!existingShipping) {
      const shippingMethods = [
        { name: "in-person", nameFa: "حضوری", type: "pickup" as const, icon: "🏠", cost: 0, isActive: true },
        { name: "post-pishtaz", nameFa: "پست پیشتاز", type: "post" as const, icon: "📦", cost: 45000, freeShippingMinAmount: 500000, isActive: true },
        { name: "tipax", nameFa: "تیپاکس", type: "express" as const, icon: "🚚", cost: 65000, isActive: true },
        { name: "chapar", nameFa: "چاپار", type: "express" as const, icon: "🚚", cost: 55000, isActive: true },
        { name: "snappbox", nameFa: "اسنپ‌باکس", type: "express" as const, icon: "⚡", cost: 35000, isActive: true },
        { name: "motor-courier", nameFa: "پیک موتوری", type: "courier" as const, icon: "🏍️", cost: 25000, regions: ["تهران"], isActive: true },
      ];
      for (const sm of shippingMethods) {
        await ctx.db.insert("shippingMethods", { ...sm, createdAt: now });
      }
    }

    // ── دپارتمان‌ها ──
    const existingDepts = await ctx.db.query("settings").filter((q) => q.eq(q.field("key"), "departments")).first();
    if (!existingDepts) {
      await ctx.db.insert("settings", {
        key: "departments",
        value: [
          { id: "sales", name: "فروش", color: "#10b981", isActive: true },
          { id: "support", name: "پشتیبانی", color: "#3b82f6", isActive: true },
          { id: "finance", name: "مالی", color: "#f59e0b", isActive: true },
          { id: "technical", name: "فنی", color: "#8b5cf6", isActive: true },
          { id: "marketing", name: "بازاریابی", color: "#ec4899", isActive: true },
          { id: "hr", name: "منابع انسانی", color: "#14b8a6", isActive: true },
        ],
        category: "general",
        isPublic: true,
        updatedAt: now,
      });
    }

    // ── آدرس سایت برای SEO ──
    const existingAddress = await ctx.db.query("settings").filter((q) => q.eq(q.field("key"), "siteAddress")).first();
    if (!existingAddress) {
      await ctx.db.insert("settings", {
        key: "siteAddress",
        value: "تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۲۳۴، طبقه سوم",
        category: "contact",
        isPublic: true,
        updatedAt: now,
      });
    }

    // ── کاربران تستی ──
    const testUsers = [
      { name: "علی رضایی", email: "ali@test.com", phone: "09121111111", role: "manager", gender: "male", nationalCode: "1111111111", postalCode: "1111111111", address: "تهران، خیابان آزادی" },
      { name: "سارا احمدی", email: "sara@test.com", phone: "09122222222", role: "operator", gender: "female", nationalCode: "2222222222", postalCode: "2222222222", address: "تهران، خیابان ولیعصر" },
      { name: "محمد حسینی", email: "mohammad@test.com", phone: "09123333333", role: "user", gender: "male", nationalCode: "3333333333", postalCode: "3333333333", address: "اصفهان، خیابان چهارباغ" },
      { name: "زهرا کریمی", email: "zahra@test.com", phone: "09124444444", role: "user", gender: "female", nationalCode: "4444444444", postalCode: "4444444444", address: "شیراز، خیابان زند" },
      { name: "امیر نوری", email: "amir@test.com", phone: "09125555555", role: "representative", gender: "male", nationalCode: "5555555555", postalCode: "5555555555", address: "تبریز، خیابان ارک" },
      { name: "مریم محمدی", email: "maryam@test.com", phone: "09126666666", role: "user", gender: "female", nationalCode: "6666666666", postalCode: "6666666666", address: "مشهد، خیابان امام رضا" },
      { name: "حسن عباسی", email: "hassan@test.com", phone: "09127777777", role: "operator", gender: "male", nationalCode: "7777777777", postalCode: "7777777777", address: "اهواز، خیابان کیانپارس" },
      { name: "نیلوفر امیری", email: "niloofar@test.com", phone: "09128888888", role: "user", gender: "female", nationalCode: "8888888888", postalCode: "8888888888", address: "کرمان، خیابان آیت الله کاشانی" },
      { name: "رضا صادقی", email: "reza@test.com", phone: "09129999999", role: "representative", gender: "male", nationalCode: "9999999999", postalCode: "9999999999", address: "قم، خیابان ارم" },
      { name: "الهام جعفری", email: "elham@test.com", phone: "09120000000", role: "user", gender: "female", nationalCode: "0000000000", postalCode: "0000000000", address: "یزد، خیابان قاسم آباد" },
    ];

    // ── اعمال اطلاعات تستی روی کاربران موجود + ایجاد کاربران جدید ──
    const existingUsers = await ctx.db.query("users").collect();
    const existingEmails = new Set(existingUsers.map((u) => (u.email || "").toLowerCase()));
    const existingMap = new Map(existingUsers.map((u) => [((u.email || "").toLowerCase()), u]));
    let patched = 0;
    let created = 0;

    for (const tu of testUsers) {
      const emailLower = tu.email.toLowerCase();
      const existing = existingMap.get(emailLower);
      if (existing) {
        // اعمال اطلاعات تستی روی کاربر موجود
        await ctx.db.patch(existing._id, {
          name: tu.name,
          email: tu.email,
          phone: tu.phone,
          role: tu.role as any,
          gender: tu.gender,
          nationalCode: tu.nationalCode,
          postalCode: tu.postalCode,
          address: tu.address,
          isActive: true,
          updatedAt: Date.now(),
        });
        patched++;
      } else {
        // ایجاد کاربر جدید در جدول users
        await ctx.db.insert("users", {
          name: tu.name,
          email: tu.email,
          phone: tu.phone,
          role: tu.role as any,
          gender: tu.gender,
          nationalCode: tu.nationalCode,
          postalCode: tu.postalCode,
          address: tu.address,
          isActive: true,
          updatedAt: Date.now(),
        });
        created++;
      }
    }

    return { success: true, productsCreated: products.length, usersPatched: patched, usersCreated: created };
  },
});

export const isSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.length > 0;
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "manager") throw new Error("فقط مدیران می‌توانند دیتابیس را پاک کنند.");

    // ── پاک کردن تمام جدول‌ها ──
    const tables = [
      "products", "categories", "brands", "orders", "cartItems",
      "discounts", "shippingMethods", "notifications", "tickets",
      "ticketReplies", "roles", "messages", "auditLogs",
      "bookings", "licenses", "productViews", "settings",
      "productSections", "heroSlides", "landingFeatures", "footerContent",
      "aboutContact", "chatTheme", "chatFaqItems",
    ];

    for (const tableName of tables) {
      const items = await ctx.db.query(tableName as any).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }

    // ── پاک کردن کاربران (به جز ادمین فعلی) ──
    const allUsers = await ctx.db.query("users").collect();
    for (const u of allUsers) {
      if (u._id !== userId) {
        await ctx.db.delete(u._id);
      } else {
        // ریست کردن ادمین فعلی به حالت پیش‌فرض
        await ctx.db.patch(u._id, {
          name: "مدیر سیستم",
          email: u.email || "admin@example.com",
          phone: "09123456789",
          role: "admin",
          isActive: true,
          nationalCode: "0012345678",
          postalCode: "1234567890",
          address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
          gender: "male",
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true, cleared: tables };
  },
});
