import { Link } from "react-router";
import { ArrowRight, Mail, Phone, MapPin, Shield, Truck, Headphones, CreditCard } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAppName } from "@/hooks/use-app-name";
import { SEO } from "@/components/SEO";
import { useMemo } from "react";

const DEFAULT_STATS = [
  { value: "۱۰,۰۰۰+", label: "محصول متنوع" },
  { value: "۵۰,۰۰۰+", label: "مشتری راضی" },
  { value: "۹۹.۹٪", label: "رضایت از خدمات" },
  { value: "۲۴/۷", label: "پشتیبانی" },
];
const DEFAULT_FEATURES = [
  { title: "خرید امن", desc: "پرداخت امن و محافظت از اطلاعات شخصی شما" },
  { title: "ارسال سریع", desc: "ارسال سریع و مطمئن به سراسر کشور" },
  { title: "پشتیبانی ۲۴/۷", desc: "تیم پشتیبانی ما همواره آماده کمک است" },
  { title: "پرداخت آسان", desc: "پرداخت از طریق کلیه کارت‌های بانکی" },
];
const FEATURE_ICONS = [Shield, Truck, Headphones, CreditCard];

export default function AboutPage() {
  const appName = useAppName();
  const aboutStory = useQuery(api.settings.get, { key: "aboutStory" });
  const aboutStory2 = useQuery(api.settings.get, { key: "aboutStory2" });
  const aboutStatsData = useQuery(api.settings.get, { key: "aboutStats" });
  const aboutFeaturesData = useQuery(api.settings.get, { key: "aboutFeatures" });
  const sitePhone = useQuery(api.settings.get, { key: "sitePhone" });
  const siteEmail = useQuery(api.settings.get, { key: "siteEmail" });
  const siteAddress = useQuery(api.settings.get, { key: "siteAddress" });

  const stats = useMemo(() => Array.isArray(aboutStatsData) ? aboutStatsData : DEFAULT_STATS, [aboutStatsData]);
  const features = useMemo(() => {
    const f = Array.isArray(aboutFeaturesData) ? aboutFeaturesData : DEFAULT_FEATURES;
    return f.map((item: {title: string, desc: string}, i: number) => ({ ...item, IconComponent: FEATURE_ICONS[i % FEATURE_ICONS.length] }));
  }, [aboutFeaturesData]);

  return (
    <>
      <SEO title={`درباره ما | ${appName}`} description="آشنایی با تیم و اهداف فروشگاه" />

    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold">{appName}</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowRight className="h-4 w-4" /> بازگشت به خانه
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">درباره {appName}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {String(aboutStory || `فروشگاه اینترنتی هوشمند با تجربه خریدی ساده، سریع و لذت‌بخش`)}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">داستان ما</h2>
          <p className="text-muted-foreground leading-relaxed">
            {String(aboutStory || `${appName} با هدف ایجاد تجربه خرید آنلاین متفاوت برای کاربران ایرانی تأسیس شد.`)}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {String(aboutStory2 || "تیم ما متشکل از متخصصان حوزه فناوری و تجارت الکترونیک است.")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s: {value: string, label: string}) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f: {title: string, desc: string, IconComponent: any}) => (
            <div key={f.title} className="clay-card p-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="clay-icon flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <f.IconComponent className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">ارتباط با ما</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{String(siteEmail || "support@clubinex.com")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{String(sitePhone || "۰۲۱-۱۲۳۴۵۶۷۸")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{String(siteAddress || "تهران، خیابان ولیعصر")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {appName}. تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
    </>
  );
}
