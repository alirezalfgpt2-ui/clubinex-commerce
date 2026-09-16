import { useState, useMemo, Suspense } from "react";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
import { SECTION_GROUPS, getSectionById } from "../sections/index";

/* ═══════════════════════════════════════════════════════════════
 *  صفحه اصلی تنظیمات — کانتاینر سبک
 *  بخش‌ها به صورت lazy-loaded از فایل‌های جداگانه لود می‌شوند
 * ═══════════════════════════════════════════════════════════════ */

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  // فیلتر بخش‌ها بر اساس جستجو
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return SECTION_GROUPS;
    const q = searchQuery.toLowerCase();
    return SECTION_GROUPS
      .map((g) => ({
        ...g,
        items: g.items.filter((id) => {
          const s = getSectionById(id);
          return s && (s.label.includes(q) || s.desc.includes(q));
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [searchQuery]);

  const currentSection = getSectionById(activeSection);

  return (
    <div className="space-y-6">
      {/* ── عنوان صفحه ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تنظیمات فروشگاه</h1>
        <p className="text-sm text-muted-foreground mt-0.5">پیکربندی بخش‌های مختلف</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        {/* ── سایدبار تنظیمات ── */}
        <div className="rounded-2xl border bg-card overflow-hidden lg:sticky lg:top-6 lg:max-h-[calc(100vh-100px)] flex flex-col">
          {/* جستجو */}
          <div className="p-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو..."
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-muted/50 text-xs outline-none focus:bg-muted focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* لیست بخش‌ها */}
          <div className="p-2 overflow-y-auto sidebar-scroll flex-1 min-h-0">
            {filteredGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((id) => {
                    const section = getSectionById(id);
                    if (!section) return null;
                    const isActive = activeSection === id;
                    const Icon = section.icon;
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveSection(id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                          isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-primary/15" : "bg-muted/50"}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{section.label}</span>
                        {isActive && <ChevronLeft className="h-3 w-3 mr-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── محتوا ── */}
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          {currentSection && (
            <div className="space-y-4">
              {/* هدر بخش */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <currentSection.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{currentSection.label}</h2>
                  <p className="text-xs text-muted-foreground">{currentSection.desc}</p>
                </div>
              </div>
              {/* کامپوننت بخش با lazy loading */}
              <Suspense fallback={<SectionLoader />}>
                <currentSection.component />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
