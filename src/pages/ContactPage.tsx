import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAppName } from "@/hooks/use-app-name";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

export default function ContactPage() {
  const appName = useAppName();
  const sitePhone = useQuery(api.settings.get, { key: "sitePhone" });
  const siteEmail = useQuery(api.settings.get, { key: "siteEmail" });
  const siteAddress = useQuery(api.settings.get, { key: "siteAddress" });
  const workingHours = useQuery(api.settings.get, { key: "contactWorkingHours" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("لطفاً تمام فیلدها را پر کنید.");
      return;
    }
    setIsSubmitting(true);
    // Simulate sending
    setTimeout(() => {
      toast.success("پیام شما با موفقیت ارسال شد.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <SEO title={`تماس با ما | ${appName}`} description="ارتباط با ما برای پشتیبانی و سوالات" />
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold">{appName}</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowRight className="h-4 w-4" /> بازگشت به خانه
          </Link>
        </div>
      </header>

      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">تماس با ما</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            ما همواره آماده شنیدن نظرات، پیشنهادات و سؤالات شما هستیم.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-bold text-lg">اطلاعات تماس</h2>
            {[
              { icon: Phone, label: "تلفن", value: String(sitePhone || "۰۲۱-۱۲۳۴۵۶۷۸"), dir: "ltr" as const },
              { icon: Mail, label: "ایمیل", value: String(siteEmail || "support@clubinex.com") },
              { icon: MapPin, label: "آدرس", value: String(siteAddress || "تهران، خیابان ولیعصر، پلاک ۱۲۳") },
              { icon: Clock, label: "ساعات کاری", value: String(workingHours || "شنبه تا پنج‌شنبه ۹ تا ۱۸") },
            ].map((item) => (
              <div key={item.label} className="clay-card p-4 flex items-start gap-3">
                <div className="clay-icon flex h-10 w-10 items-center justify-center bg-primary/10 text-primary shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground" dir={item.dir}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="clay-card p-6 space-y-4">
              <h2 className="font-bold text-lg">ارسال پیام</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">نام</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="نام شما" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ایمیل</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="clay-input w-full p-3 text-sm outline-none" placeholder="email@example.com" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">موضوع</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="clay-input w-full p-3 text-sm outline-none" placeholder="موضوع پیام..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">پیام</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="clay-input w-full p-3 text-sm outline-none resize-none" placeholder="متن پیام خود را بنویسید..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="clay-button px-6 py-3 text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4" /> {isSubmitting ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {appName}. تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
    </>
  );
}
