import { Link, useParams } from "react-router";
import { ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SEO } from "@/components/SEO";

/** محتوای پیش‌فرض اگر دیتابیس خالی باشد */
const FALLBACK_CONTENT: Record<string, { title: string; titleEn?: string; lastUpdated: string; sections: { heading: string; content: string }[] }> = {
  terms: {
    title: "قوانین و مقررات",
    titleEn: "Terms & Conditions",
    lastUpdated: "۱۴۰۳/۰۶/۰۱",
    sections: [
      { heading: "شرایط عمومی", content: "استفاده از وب‌سایت به معنای پذیرش این قوانین و مقررات است. این قوانین ممکن است در هر زمان به‌روزرسانی شوند و کاربران موظف به بررسی دوره‌ای آن‌ها هستند." },
      { heading: "ثبت‌نام و حساب کاربری", content: "کاربران با ثبت‌نام در سایت اعلام می‌کنند که اطلاعات صحیح و واقعی ارائه داده‌اند. مسئولیت حفظ محرمانگی رمز عبور بر عهده کاربر است." },
      { heading: "شرایط خرید", content: "قیمت‌های درج‌شده به ریال می‌باشد. سفارش پس از تأیید و پرداخت موفق قطعی می‌شود. حق لغو سفارشات مشکوک برای فروشگاه محفوظ است." },
      { heading: "پرداخت", content: "پرداخت‌ها از طریق درگاه‌های بانکی مجاز انجام می‌شود. تمامی اطلاعات پرداخت رمزنگاری شده و نزد ما محفوظ می‌ماند." },
      { heading: "ارسال و تحویل", content: "زمان تقریبی ارسال کالا ۱ تا ۳ روز کاری پس از تأیید سفارش است. هزینه ارسال بر اساس روش انتخابی و وزن بسته محاسبه می‌شود." },
    ],
  },
  privacy: {
    title: "سیاست حفظ حریم خصوصی",
    titleEn: "Privacy Policy",
    lastUpdated: "۱۴۰۳/۰۶/۰۱",
    sections: [
      { heading: "جمع‌آوری اطلاعات", content: "ما فقط اطلاعاتی را جمع‌آوری می‌کنیم که برای ارائه خدمات ضروری است، از جمله نام، ایمیل، شماره تماس و آدرس ارسال." },
      { heading: "استفاده از اطلاعات", content: "اطلاعات شما صرفاً برای پردازش سفارشات، بهبود خدمات و ارتباط با شما استفاده می‌شود. اطلاعات شخصی شما به هیچ وجه به اشخاص ثالث فروخته نمی‌شود." },
      { heading: "امنیت اطلاعات", content: "ما از پروتکل‌های رمزنگاری SSL و اقدامات امنیتی لازم برای محافظت از اطلاعات شما استفاده می‌کنیم." },
      { heading: "کوکی‌ها", content: "از کوکی‌ها برای بهبود تجربه کاربری و ذخیره تنظیمات شما استفاده می‌شود. می‌توانید استفاده از کوکی‌ها را در مرورگر خود غیرفعال کنید." },
      { heading: "حقوق کاربران", content: "شما حق دسترسی، اصلاح و حذف اطلاعات شخصی خود را دارید. برای استفاده از این حقوق با ما تماس بگیرید." },
    ],
  },
  return: {
    title: "شرایط مرجوعی و استرداد کالا",
    titleEn: "Return Policy",
    lastUpdated: "۱۴۰۳/۰۶/۰۱",
    sections: [
      { heading: "مهلت مرجوعی", content: "بر اساس قانون حمایت از حقوق مصرف‌کنندگان، کالاهای خریداری‌شده تا ۷ روز پس از تحویل قابل مرجوع هستند، مشروط به سالم بودن بسته‌بندی و عدم استفاده از کالا." },
      { heading: "شرایط مرجوعی", content: "کالا باید در بسته‌بندی اصلی، بدون آسیب‌دیدگی و همراه با تمامی متعلقات ارسال شود. کالاهای بهداشتی و شخصی‌سازی‌شده غیرقابل مرجوع هستند." },
      { heading: "فرآیند مرجوعی", content: "برای مرجوع کردن کالا، از طریق بخش پشتیبانی یا تیکت اقدام کنید. پس از تأیید درخواست، کالا از شما دریافت و مبلغ ظرف ۳ تا ۵ روز کاری مسترد می‌شود." },
      { heading: "هزینه مرجوعی", content: "در صورت وجود نقص فنی یا اشتباه در ارسال، هزینه مرجوعی بر عهده فروشگاه است. در غیر این صورت، هزینه ارسال مجدد بر عهده خریدار خواهد بود." },
    ],
  },
};

/** تبدیل محتوای HTML به بخش‌های ساختاری */
function parseHtmlContent(html: string): { heading: string; content: string }[] {
  if (!html) return [];
  // اگر شامل تگ‌های h2/h3 باشد، تقسیم کن
  const parts = html.split(/<h[23][^>]*>(.*?)<\/h[23]>/gi);
  if (parts.length <= 1) {
    return [{ heading: "", content: html }];
  }
  const sections: { heading: string; content: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({
      heading: parts[i].replace(/<[^>]+>/g, ""),
      content: parts[i + 1]?.replace(/<[^>]+>/g, "").trim() || "",
    });
  }
  return sections;
}

/** نگاشت slug پارامتر به slug دیتابیس */
const SLUG_MAP: Record<string, string> = {
  terms: "terms",
  privacy: "privacy",
  return: "return",
  // پشتیبانی از نام قبلی
  returns: "return",
};

export default function LegalPage() {
  const { type } = useParams<{ type: string }>();
  const slug = SLUG_MAP[type || "terms"] || type || "terms";

  // تلاش برای خواندن از دیتابیس
  const dbPage = useQuery(api.contentPages.getBySlug, { slug });
  // فallback از دیتابیس با slug عمومی
  const fallbackDb = useQuery(api.contentPages.getBySlug, { slug: "terms" });

  // انتخاب محتوا: دیتابیس > فallback دیتابیس > فallback استاتیک
  const staticContent = FALLBACK_CONTENT[type || "terms"];

  let title = staticContent?.title || "صفحه قانونی";
  let titleEn = staticContent?.titleEn;
  let lastUpdated = staticContent?.lastUpdated || "";
  let sections: { heading: string; content: string }[] = staticContent?.sections || [];

  // اگر از دیتابیس محتوا آمد، استفاده کن
  if (dbPage && dbPage.isActive) {
    title = dbPage.title;
    titleEn = dbPage.titleEn || titleEn;
    lastUpdated = dbPage.lastUpdated;
    sections = dbPage.content
      ? (dbPage.content.includes("<h") ? parseHtmlContent(dbPage.content) : [{ heading: "", content: dbPage.content }])
      : sections;
  } else if (fallbackDb && fallbackDb.isActive) {
    title = fallbackDb.title;
    titleEn = fallbackDb.titleEn || titleEn;
    lastUpdated = fallbackDb.lastUpdated;
    sections = fallbackDb.content
      ? (fallbackDb.content.includes("<h") ? parseHtmlContent(fallbackDb.content) : [{ heading: "", content: fallbackDb.content }])
      : sections;
  }

  if (!title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-bold">صفحه یافت نشد</p>
          <Link to="/" className="px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            بازگشت به خانه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold">{titleEn || "Store"}</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowRight className="h-4 w-4" /> بازگشت به خانه
          </Link>
        </div>
      </header>

      <main className="py-16 container mx-auto px-4 max-w-3xl">
        <SEO title={`${title} | فروشگاه`} description={sections[0]?.content?.slice(0, 160) || title} />
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8">آخرین به‌روزرسانی: {lastUpdated}</p>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
              {section.heading && <h2 className="font-bold text-lg mb-3">{section.heading}</h2>}
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} فروشگاه. تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
  );
}
