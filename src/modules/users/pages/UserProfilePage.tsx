import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { formatJalaliDate, isoToJalali, jalaliToIso } from "@/lib/jalali";
import { JalaliDatePicker } from "@/components/ui/JalaliDatePicker";
import { ROLES_FA } from "@/config/constants";
import { LoyaltyPointsSection } from "@/modules/users/components/LoyaltyPointsSection";
import { OrderHistorySection } from "@/modules/users/components/OrderHistorySection";
import { WalletSection } from "@/modules/users/components/WalletSection";

/** رنگ‌های آواتار */
const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
];

export default function UserProfilePage() {
  const user = useQuery(api.users.currentUser);
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [avatar, setAvatar] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // همگام‌سازی فرم هنگام بارگذاری اطلاعات کاربر
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLastName((user as any).lastName || "");
      setPhone(user.phone || "");
      setNationalCode(user.nationalCode || "");
      setAddress(user.address || "");
      setPostalCode(user.postalCode || "");
      setAvatar(user.avatar || "");
      setGender((user as any).gender || "");
      const raw = (user as any).birthDate || "";
      // If stored as ISO (YYYY-MM-DD), convert to Jalali for display
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        setBirthDate(isoToJalali(raw));
      } else {
        setBirthDate(raw);
      }
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const birthDateIso = birthDate ? (birthDate.includes("/") ? jalaliToIso(birthDate) : birthDate) : "";
      await updateProfile({ name, lastName, phone, nationalCode, address, postalCode, avatar, gender, birthDate: birthDateIso });
      toast.success("پروفایل با موفقیت ذخیره شد.");
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e?.message || "خطا در ذخیره‌سازی.");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("حجم تصویر حداکثر ۲ مگابایت باشد."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setAvatar(ev.target?.result as string); toast.success("تصویر پروفایل آپلود شد."); };
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const fullName = [name, lastName].filter(Boolean).join(" ") || "کاربر";
  const initial = name?.[0] || lastName?.[0] || user.email?.[0] || "ک";
  const colorIndex = (user._id?.charCodeAt?.(0) || 0) % AVATAR_COLORS.length;
  const roleLabel = ROLES_FA[user.role || ""] || user.role || "کاربر";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* هدر پروفایل */}
      <div className="clay-card overflow-hidden">
        <div className={`h-32 bg-gradient-to-r ${AVATAR_COLORS[colorIndex]} relative`}>
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 relative z-10">
            {/* آواتار */}
            <div className="relative group">
              {avatar ? (
                <img src={avatar} alt={fullName} className="w-24 h-24 rounded-2xl object-cover border-4 border-card shadow-lg" />
              ) : (
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[colorIndex]} flex items-center justify-center text-3xl font-bold text-white border-4 border-card shadow-lg`}>
                  {initial}
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" title="تغییر تصویر">
                <span className="text-white text-xs font-medium">📷 تغییر</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            {/* اطلاعات */}
            <div className="flex-1 text-center sm:text-right pb-1">
              <h1 className="text-xl font-bold">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{roleLabel}</span>
                {user.isActive !== false && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">فعال</span>}
              </div>
            </div>
            <button onClick={() => setIsEditing(!isEditing)} className={`clay-button px-4 py-2 text-sm font-semibold transition-colors ${isEditing ? "bg-muted text-foreground" : ""}`}>
              {isEditing ? "انصراف" : "✏️ ویرایش پروفایل"}
            </button>
          </div>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "تاریخ عضویت", value: user.createdAt ? formatJalaliDate(user.createdAt) : "—" },
          { label: "آخرین ورود", value: user.lastLogin ? formatJalaliDate(user.lastLogin) : "—" },
          { label: "وضعیت حساب", value: user.isActive !== false ? "فعال" : "غیرفعال" },
          { label: "جنسیت", value: gender === "male" ? "مرد" : gender === "female" ? "زن" : "تعریف نشده" },
        ].map((stat) => (
          <div key={stat.label} className="clay-card p-4 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-xs font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* فرم اطلاعات شخصی */}
      <div className="clay-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">اطلاعات شخصی</h2>
          {isEditing && <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">در حال ویرایش</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">نام</label>
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} placeholder="نام" className={`clay-input w-full p-3 text-sm outline-none ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">نام خانوادگی</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} placeholder="نام خانوادگی" className={`clay-input w-full p-3 text-sm outline-none ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">📧 ایمیل</label>
            <input value={user.email || ""} disabled className="clay-input w-full p-3 text-sm outline-none opacity-60 cursor-not-allowed" dir="ltr" />
            <p className="text-[10px] text-muted-foreground mt-1">ایمیل قابل تغییر نیست</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">📱 تلفن</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} placeholder="۰۹۱۲۱۲۳۴۵۶۷" className={`clay-input w-full p-3 text-sm outline-none ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`} dir="ltr" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">🔢 کد ملی</label>
            <input value={nationalCode} onChange={(e) => setNationalCode(e.target.value)} disabled={!isEditing} placeholder="۱۲۳۴۵۶۷۸۹۰" className={`clay-input w-full p-3 text-sm outline-none ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`} dir="ltr" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block"> جنسیت</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} disabled={!isEditing} className={`clay-input w-full p-3 text-sm outline-none ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}>
              <option value="">انتخاب کنید</option>
              <option value="male">مرد</option>
              <option value="female">زن</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">🎂 تاریخ تولد</label>
          <JalaliDatePicker value={birthDate} onChange={setBirthDate} disabled={!isEditing} className={`max-w-xs ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">📍 آدرس</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditing} placeholder="آدرس کامل..." rows={3} className={`clay-input w-full p-3 text-sm outline-none resize-none ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">📮 کد پستی</label>
          <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={!isEditing} placeholder="۱۲۳۴۵۶۷۸۹۰" className={`clay-input w-full p-3 text-sm outline-none max-w-xs ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`} dir="ltr" />
        </div>

        {isEditing && (
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">🖼 آدرس تصویر پروفایل (اختیاری)</label>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://example.com/avatar.jpg" className="clay-input w-full p-3 text-sm outline-none" dir="ltr" />
            <p className="text-[10px] text-muted-foreground mt-1">یا از بالای صفحه روی تصویر پروفایل کلیک کنید</p>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-3 pt-3 border-t border-border/50">
            <button onClick={handleSave} className="clay-button px-6 py-2.5 text-sm font-semibold">💾 ذخیره تغییرات</button>
            <button onClick={() => { setIsEditing(false); if (user) { setName(user.name || ""); setLastName((user as any).lastName || ""); } }} className="clay-button px-4 py-2.5 text-sm bg-muted text-foreground">انصراف</button>
          </div>
        )}
      </div>

      {/* امنیت حساب */}
      <div className="clay-card p-6 space-y-4">
        <h2 className="font-bold text-sm">🔐 امنیت حساب</h2>
        <div className="clay-surface p-4">
          <p className="text-sm font-medium mb-2">تغییر رمز عبور</p>
          <p className="text-xs text-muted-foreground mb-3">رمز عبور خود را با استفاده از ایمیل تغییر دهید. یک لینک بازنشانی به ایمیل شما ارسال می‌شود.</p>
          <a href="/auth" className="clay-button px-4 py-2 text-xs inline-flex items-center gap-2">🔑 تغییر رمز عبور از طریق ایمیل</a>
        </div>
      </div>

      {/* سابقه خرید */}
      <OrderHistorySection />

      {/* کیف پول */}
      <WalletSection />

      {/* امتیازات وفاداری */}
      <LoyaltyPointsSection />

      {/* نشست‌های فعال */}
      <div className="clay-card p-6 space-y-4">
        <h2 className="font-bold text-sm">📱 نشست‌های فعال</h2>
        <div className="clay-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="clay-icon flex h-10 w-10 items-center justify-center bg-emerald-100 text-emerald-600">🌐</div>
              <div>
                <p className="text-sm font-medium">مرورگر فعلی</p>
                <p className="text-[11px] text-muted-foreground">اکنون فعال</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">فعال</span>
          </div>
        </div>
      </div>
    </div>
  );
}
