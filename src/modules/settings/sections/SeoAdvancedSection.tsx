/**
 * 🔍 تنظیمات سئوی پیشرفته
 * — متاتگ‌های Open Graph
 * — تنظیمات sitemap.xml
 * — متاتگ‌های Twitter Card
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Globe, Save, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SeoAdvancedSection() {
  const settings = useQuery(api.settings.get, { key: "seoAdvanced" });
  const updateSettings = useMutation(api.settings.set);

  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogUrl, setOgUrl] = useState("");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [twitterSite, setTwitterSite] = useState("");
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [sitemapIncludeProducts, setSitemapIncludeProducts] = useState(true);
  const [sitemapIncludeBlog, setSitemapIncludeBlog] = useState(true);
  const [robotsTxt, setRobotsTxt] = useState("User-agent: *\nAllow: /");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.value) {
      const v = settings.value;
      setOgTitle(v.ogTitle ?? "");
      setOgDescription(v.ogDescription ?? "");
      setOgImage(v.ogImage ?? "");
      setOgUrl(v.ogUrl ?? "");
      setTwitterCard(v.twitterCard ?? "summary_large_image");
      setTwitterSite(v.twitterSite ?? "");
      setSitemapEnabled(v.sitemapEnabled ?? true);
      setSitemapIncludeProducts(v.sitemapIncludeProducts ?? true);
      setSitemapIncludeBlog(v.sitemapIncludeBlog ?? true);
      setRobotsTxt(v.robotsTxt ?? "User-agent: *\nAllow: /");
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        key: "seoAdvanced",
        category: "seo",
        value: {
          ogTitle, ogDescription, ogImage, ogUrl,
          twitterCard, twitterSite,
          sitemapEnabled, sitemapIncludeProducts, sitemapIncludeBlog,
          robotsTxt,
        },
      });
      toast.success("تنظیمات سئو ذخیره شد.");
    } catch {
      toast.error("خطا در ذخیره.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Open Graph */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> متاتگ Open Graph
        </h4>
        <p className="text-xs text-muted-foreground">تنظیمات نمایش لینک سایت در شبکه‌های اجتماعی</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">OG Title</label>
            <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} className="clay-input w-full h-9 text-sm" placeholder="عنوان در شبکه اجتماعی" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">OG URL</label>
            <input value={ogUrl} onChange={(e) => setOgUrl(e.target.value)} className="clay-input w-full h-9 text-sm" placeholder="https://example.com" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">OG Description</label>
          <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} className="clay-input w-full h-20 text-sm resize-y" placeholder="توضیحات در شبکه اجتماعی" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">OG Image URL</label>
          <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="clay-input w-full h-9 text-sm" placeholder="https://example.com/og-image.jpg" />
        </div>
      </div>

      {/* Twitter Card */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Twitter Card</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">نوع کارت</label>
            <select value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)} className="clay-input w-full h-9 text-sm">
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Twitter Site</label>
            <input value={twitterSite} onChange={(e) => setTwitterSite(e.target.value)} className="clay-input w-full h-9 text-sm" placeholder="@yourbrand" />
          </div>
        </div>
      </div>

      {/* Sitemap */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">sitemap.xml</h4>
        {[
          { label: "فعال‌سازی sitemap.xml", value: sitemapEnabled, onChange: setSitemapEnabled },
          { label: "شامل محصولات", value: sitemapIncludeProducts, onChange: setSitemapIncludeProducts },
          { label: "شامل مقالات بلاگ", value: sitemapIncludeBlog, onChange: setSitemapIncludeBlog },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <span className="text-sm">{item.label}</span>
            <button
              onClick={() => item.onChange(!item.value)}
              className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.value ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Robots.txt */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">robots.txt</h4>
        <textarea value={robotsTxt} onChange={(e) => setRobotsTxt(e.target.value)} className="clay-input w-full h-24 text-sm font-mono resize-y" />
      </div>

      <button onClick={handleSave} disabled={saving} className="clay-button flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        ذخیره تنظیمات سئو
      </button>
    </div>
  );
}
