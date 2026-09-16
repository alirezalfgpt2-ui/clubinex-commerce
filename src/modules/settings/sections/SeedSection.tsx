import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Database, Crown, Loader2 } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { SectionHeader } from "../components/SettingsUI";

/** پاک کردن پیشوند خطای Convex */
function cleanError(msg: string): string {
  return msg.replace(/^(Server Error\s*)?(Uncaught Error:\s*)?/i, "").trim() || "خطای ناشناخته";
}

/** بخش داده‌های تستی */
export default function SeedSection() {
  const seedAll = useMutation(api.seed.seedAll);
  const clearAll = useMutation(api.seed.clearAll);
  const makeAdmin = useMutation(api.users.makeAdmin);
  const confirmDialog = useConfirm();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isMakingAdmin, setIsMakingAdmin] = useState(false);

  return (
    <div className="space-y-4">
      <SectionHeader title="داده‌های تستی" description="ایجاد یا حذف داده‌های نمونه." gradient="from-primary/5 to-accent/5 border-primary/10" />

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <p className="text-sm font-medium">ایجاد داده‌های نمونه</p>
        <ul className="text-xs text-muted-foreground space-y-1"><li>• ۱۰ محصول، ۶ دسته‌بندی، ۵ برند</li><li>• ۳ کد تخفیف، ۳ روش ارسال</li><li>• نوتیفیکشن، تیکت، رزرو، نقش‌ها</li></ul>
        <button onClick={async () => { setIsSeeding(true); try { const r = await seedAll(); toast.success(`ایجاد شد (${r.productsCreated} محصول)`); } catch (e: any) { toast.error(cleanError(e?.message || "خطا")); } finally { setIsSeeding(false); } }} disabled={isSeeding} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
          {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} {isSeeding ? "..." : "ایجاد داده‌ها"}
        </button>
      </div>

      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-3">
        <p className="text-sm font-medium text-destructive">پاک کردن دیتابیس</p>
        <p className="text-xs text-muted-foreground">تمام داده‌های تستی پاک می‌شوند.</p>
        <button onClick={async () => { if (!await confirmDialog({ title: "پاک کردن دیتابیس", message: "⚠️ تمام داده‌های تستی پاک می‌شوند. این عمل غیرقابل بازگشت است!", variant: "danger" })) return; setIsClearing(true); try { await clearAll(); toast.success("پاک شد."); } catch (e: any) { toast.error(cleanError(e?.message || "خطا")); } finally { setIsClearing(false); } }} disabled={isClearing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
          {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : "🗑️ پاک کردن"}
        </button>
      </div>

      <div className="rounded-xl border bg-amber-50/50 p-5 space-y-3">
        <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /><p className="text-sm font-medium">تبدیل به ادمین</p></div>
        <p className="text-xs text-muted-foreground">دسترسی کامل به تمام بخش‌ها.</p>
        <button onClick={async () => { setIsMakingAdmin(true); try { await makeAdmin(); toast.success("ادمین شدید!"); } catch (e: any) { toast.error(cleanError(e?.message || "خطا")); } finally { setIsMakingAdmin(false); } }} disabled={isMakingAdmin} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
          {isMakingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Crown className="h-4 w-4" /> تبدیل به ادمین</>}
        </button>
      </div>
    </div>
  );
}
