import { Store, Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAppName } from "@/hooks/use-app-name";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

/** لینک‌های پیش‌فرض */
const DEFAULT_QUICK_LINKS = [
  { label: "فروشگاه", href: "/products" },
  { label: "بلاگ و اخبار", href: "/blog" },
  { label: "مقایسه محصولات", href: "/compare" },
  { label: "ورود / ثبت‌نام", href: "/auth" },
  { label: "پیگیری سفارش", href: "/track-order" },
  { label: "پنل کاربری", href: "/dashboard" },
];
const DEFAULT_POLICY_LINKS = [
  { label: "شرایط استفاده", href: "/legal/terms" },
  { label: "حریم خصوصی", href: "/legal/privacy" },
  { label: "شرایط مرجوعی کالا", href: "/legal/return" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];
const DEFAULT_TRUST_LOGOS = [
  { name: "نماد اعتماد الکترونیکی", url: "https://trustseminister.ir", icon: "🛡️" },
  { name: "ساماندهی وزارت ارشاد", url: "https://samandehi.ir", icon: "✅" },
  { name: "گواهی SSL امن", url: "", icon: "🔒" },
  { name: "مجوز صنفی", url: "", icon: "📋" },
];

export function LandingFooter() {
  const [email, setEmail] = useState("");
  const subscribe = useMutation(api.newsletters.subscribe);
  const sitePhone = useQuery(api.settings.get, { key: "sitePhone" });
  const siteEmail = useQuery(api.settings.get, { key: "siteEmail" });
  const siteAddress = useQuery(api.settings.get, { key: "siteAddress" });
  const footerCopyright = useQuery(api.settings.get, { key: "footerCopyright" });
  const footerQuickLinksData = useQuery(api.settings.get, { key: "footerQuickLinks" });
  const footerPolicyLinksData = useQuery(api.settings.get, { key: "footerPolicyLinks" });
  const footerTrustLogosData = useQuery(api.settings.get, { key: "footerTrustLogos" });

  const quickLinks = useMemo(() =>
    Array.isArray(footerQuickLinksData) ? footerQuickLinksData : DEFAULT_QUICK_LINKS,
    [footerQuickLinksData]
  );
  const policyLinks = useMemo(() =>
    Array.isArray(footerPolicyLinksData) ? footerPolicyLinksData : DEFAULT_POLICY_LINKS,
    [footerPolicyLinksData]
  );
  const trustLogos = useMemo(() =>
    Array.isArray(footerTrustLogosData) ? footerTrustLogosData : DEFAULT_TRUST_LOGOS,
    [footerTrustLogosData]
  );

  const handleSubscribe = async () => {
    if (!email.trim()) { toast.error("ایمیل را وارد کنید."); return; }
    try {
      const result = await subscribe({ email });
      toast.success(result.message);
      setEmail("");
    } catch { toast.error("خطا در عضویت."); }
  };

  const appName = useAppName();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-white mb-1">خبرنامه {appName}</h3>
              <p className="text-sm text-gray-400">از تخفیف‌ها و محصولات جدید باخبر شوید.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل خود را وارد کنید..."
                className="flex-1 md:w-72 h-11 rounded-xl bg-gray-800 border border-gray-700 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition-colors"
              />
              <button onClick={handleSubscribe} className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center bg-primary rounded-xl text-white text-sm font-bold">
                Cx
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">{appName}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              فروشگاه آنلاین هوشمند؛ خریدی ساده، سریع و لذت‌بخش برای همه.
            </p>
            <div className="flex items-center gap-3">
              {["Instagram", "Telegram", "Twitter"].map((s) => (
                <a key={s} href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-colors text-xs font-bold">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm text-white mb-4">دسترسی سریع</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link: any) => (
                <li key={link.href}><Link to={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-bold text-sm text-white mb-4">قانونی و پشتیبانی</h3>
            <ul className="space-y-3 text-sm">
              {policyLinks.map((link: any) => (
                <li key={link.href}><Link to={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm text-white mb-4">تماس با ما</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {String(sitePhone || "۰۲۱-۱۲۳۴۵۶۷۸")}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> {String(siteEmail || "support@clubinex.com")}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{String(siteAddress || "تهران، خیابان ولیعصر، پلاک ۱۲۳")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Logos */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">نمادها و مجوزهای رسمی</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {trustLogos.map((logo: any, i: number) => (
                logo.url ? (
                  <a key={i} href={logo.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700 group-hover:border-primary/50 transition-colors">
                      <span className="text-2xl">{logo.icon}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 group-hover:text-primary transition-colors">{logo.name}</span>
                  </a>
                ) : (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700">
                      <span className="text-2xl">{logo.icon}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{logo.name}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">{String(footerCopyright || `© ۱۴۰۵ ${appName}. تمامی حقوق محفوظ است.`)}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link to="/legal/terms" className="hover:text-primary transition-colors">شرایط استفاده</Link>
            <span>·</span>
            <Link to="/legal/privacy" className="hover:text-primary transition-colors">حریم خصوصی</Link>
            <span>·</span>
            <Link to="/legal/return" className="hover:text-primary transition-colors">مرجوعی</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
