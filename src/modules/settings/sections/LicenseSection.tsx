/**
 * 🔐 بخش مدیریت لایسنس
 *
 * جریان صحیح:
 * ۱. سایت یک Machine ID تولید می‌کند (خودکار)
 * ۲. اپراتور Machine ID را کپی می‌کند
 * ۳. اپراتور به ابزار HTML می‌رود و لایسنس تولید می‌کند
 * ۴. اپراتور کد لایسنس را در اینجا وارد و فعال می‌کند
 */
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Key, Shield, Copy, CheckCircle, AlertTriangle, Clock, Server, Package, ExternalLink } from "lucide-react";
import { SectionHeader } from "../components/SettingsUI";
import { ALL_MODULES, MODULE_INFO } from "@/convex/license";

/** تولید Machine ID از اثرانگشت مرورگر */
function generateFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Clubinex", 2, 2);
  }
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|");

  // تبدیل به hex
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0") + "-" +
    Date.now().toString(36) + "-" +
    Math.random().toString(36).substring(2, 10);
}

/** بخش مدیریت لایسنس */
export default function LicenseSection() {
  const licenses = useQuery(api.settings.listLicenses);
  const activeLicense = useQuery(api.license.getActiveLicense);
  const machineIdSetting = useQuery(api.license.getMachineId);
  const activateLicense = useMutation(api.license.activateLicense);
  const setMachineId = useMutation(api.license.setMachineId);

  const [licenseKey, setLicenseKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);

  /** تولید و ذخیره Machine ID در صورت عدم وجود — فقط یکبار */
  const generationAttempted = useRef(false);
  useEffect(() => {
    // اگر هنوز لود نشده (undefined) یا قبلا تلاش شده — صبر کن
    if (machineIdSetting === undefined || generationAttempted.current) return;
    // اگر Machine ID وجود ندارد (null یا رشته خالی)
    if (!machineIdSetting) {
      generationAttempted.current = true;
      const newId = generateFingerprint();
      setMachineId({ machineId: newId }).catch(() => {});
    }
  }, [machineIdSetting, setMachineId]);

  /** فعال‌سازی لایسنس */
  const handleActivate = async () => {
    if (!licenseKey.trim()) return toast.error("کد لایسنس را وارد کنید.");
    setActivating(true);
    try {
      await activateLicense({ key: licenseKey.trim() });
      toast.success("✅ لایسنس با موفقیت فعال شد!");
      setLicenseKey("");
    } catch (e: any) {
      toast.error(e?.message ?? "خطا در فعال‌سازی لایسنس");
    } finally {
      setActivating(false);
    }
  };

  /** کپی Machine ID */
  const copyMachineId = () => {
    const id = String(machineIdSetting || "");
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /** وضعیت لایسنس */
  const isExpired = activeLicense?.expiryDate && activeLicense.expiryDate < Date.now();
  const daysRemaining = activeLicense?.expiryDate
    ? Math.max(0, Math.ceil((activeLicense.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  /** گروه‌بندی ماژول‌ها */
  const groupedModules = ALL_MODULES.reduce((acc, mod) => {
    const info = MODULE_INFO[mod] ?? { label: mod, description: "", group: "سایر" };
    if (!acc[info.group]) acc[info.group] = [];
    acc[info.group].push({ id: mod, ...info });
    return acc;
  }, {} as Record<string, Array<{ id: string; label: string; description: string; group: string }>>);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="مدیریت لایسنس"
        description="فعال‌سازی و مدیریت لایسنس نرم‌افزار"
        gradient="from-violet-50 to-indigo-50 border-violet-200/50"
      />

      {/* راهنمای جریان */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 p-6">
        <h3 className="font-bold text-lg text-indigo-800 mb-3">📋 نحوه فعال‌سازی لایسنس</h3>
        <div className="space-y-2 text-sm text-indigo-700">
          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold shrink-0">۱</span>
            <p>شناسه ماشین (Machine ID) خود را از بخش زیر <strong>کپی</strong> کنید.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold shrink-0">۲</span>
            <p>شناسه ماشین را در <strong>ابزار تولید لایسنس</strong> وارد کرده و ماژول‌های مورد نیاز را انتخاب کنید.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold shrink-0">۳</span>
            <p>کد لایسنس تولید شده را در <strong>کادر زیر</strong> وارد کرده و دکمه فعال‌سازی را بزنید.</p>
          </div>
        </div>
      </div>

      {/* وضعیت لایسنس */}
      <div className={`rounded-2xl p-6 border ${
        isExpired
          ? "bg-red-50 border-red-200"
          : activeLicense
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            isExpired ? "bg-red-100" : activeLicense ? "bg-emerald-100" : "bg-amber-100"
          }`}>
            {isExpired ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : activeLicense ? (
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            ) : (
              <Key className="h-6 w-6 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${
              isExpired ? "text-red-800" : activeLicense ? "text-emerald-800" : "text-amber-800"
            }`}>
              {isExpired
                ? "⚠️ لایسنس منقضی شده"
                : activeLicense
                  ? "✅ لایسنس فعال"
                  : "⏳ لایسنس فعال نیست"}
            </h3>
            {activeLicense && (
              <div className="mt-2 space-y-1 text-sm">
                {activeLicense.clientName && (
                  <p className="text-gray-600">مشتری: <span className="font-medium">{activeLicense.clientName}</span></p>
                )}
                <p className="text-gray-600">نوع: <span className="font-medium">{
                  activeLicense.type === "permanent" ? "دائمی" : activeLicense.type === "yearly" ? "سالانه" : "ماهانه"
                }</span></p>
                {daysRemaining !== null && (
                  <p className="text-gray-600 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {daysRemaining > 0 ? `${daysRemaining} روز باقی‌مانده` : "منقضی شده"}
                  </p>
                )}
                {activeLicense.expiryDate && (
                  <p className="text-xs text-gray-500">
                    تاریخ انقضا: {new Date(activeLicense.expiryDate).toLocaleDateString("fa-IR")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* شناسه ماشین — مرحله ۱ */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Server className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">مرحله ۱: شناسه ماشین (Machine ID)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          این شناسه به صورت خودکار تولید شده است. آن را <strong>کپی</strong> کرده و در ابزار تولید لایسنس وارد کنید.
        </p>

        {!machineIdSetting ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            در حال تولید شناسه ماشین...
          </div>
        ) : (
          <div className="flex gap-2">
            <div
              className="flex-1 rounded-xl border bg-muted/50 px-4 py-3 font-mono text-sm break-all select-all"
              dir="ltr"
            >
              {String(machineIdSetting)}
            </div>
            <button
              onClick={copyMachineId}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                copied
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {copied ? (
                <><CheckCircle className="h-4 w-4" /> کپی شد!</>
              ) : (
                <><Copy className="h-4 w-4" /> کپی</>
              )}
            </button>
          </div>
        )}

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm text-indigo-700 flex items-start gap-2">
          <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
          <span>شناسه ماشین را در ابزار تولید لایسنس (<code className="bg-indigo-100 px-1 rounded">tools/license-generator.html</code>) وارد کنید.</span>
        </div>
      </div>

      {/* فعال‌سازی لایسنس — مرحله ۲ */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">مرحله ۲: فعال‌سازی لایسنس</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          کد لایسنس تولید شده توسط ابزار را در کادر زیر وارد کرده و دکمه فعال‌سازی را بزنید.
        </p>

        <div className="flex gap-2">
          <input
            dir="ltr"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="کد لایسنس JWT را اینجا وارد کنید..."
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm font-mono outline-none border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          <button
            onClick={handleActivate}
            disabled={activating || !licenseKey.trim()}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {activating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            فعال‌سازی
          </button>
        </div>
      </div>

      {/* ماژول‌های فعال */}
      {activeLicense && (
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">ماژول‌های فعال</h3>
          </div>

          {Object.entries(groupedModules).map(([group, modules]) => (
            <div key={group}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{group}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {modules.map((mod) => {
                  const isEnabled = activeLicense.modules?.[mod.id] === true || activeLicense.features?.[mod.id] === true;
                  return (
                    <div
                      key={mod.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm ${
                        isEnabled
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${isEnabled ? "bg-emerald-500" : "bg-gray-300"}`} />
                      <span className="font-medium text-xs">{mod.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* لیست لایسنس‌ها */}
      {licenses && licenses.length > 0 && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-bold text-lg">لیست لایسنس‌ها</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">کلید</th>
                <th className="p-3 text-right text-xs font-medium text-muted-foreground">مشتری</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">نوع</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">انقضا</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((l: any) => (
                <tr key={l._id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-3 font-mono text-xs">{l.key}</td>
                  <td className="p-3 text-xs">{l.clientName || "—"}</td>
                  <td className="p-3 text-center text-xs">
                    {l.type === "permanent" ? "دائمی" : l.type === "yearly" ? "سالانه" : "ماهانه"}
                  </td>
                  <td className="p-3 text-center text-xs text-muted-foreground">
                    {l.expiryDate ? new Date(l.expiryDate).toLocaleDateString("fa-IR") : "—"}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                      l.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {l.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
