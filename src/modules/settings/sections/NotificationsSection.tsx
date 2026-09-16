import { useSettings } from "../hooks/use-settings";
import { Toggle, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش تنظیمات اعلانات */
export default function NotificationsSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("notifications");

  return (
    <div className="space-y-4">
      <SectionHeader title="تنظیمات اعلانات" description="نحوه ارسال اعلانات." gradient="from-indigo-50 to-blue-50 border-indigo-200/50" />
      <Toggle checked={getVal("notifEmail") !== false} onChange={() => setVal("notifEmail", getVal("notifEmail") === false ? true : false)} label="اعلان ایمیلی" description="ارسال ایمیل هنگام ثبت سفارش" />
      <Toggle checked={getVal("notifSms") !== false} onChange={() => setVal("notifSms", getVal("notifSms") === false ? true : false)} label="اعلان پیامکی" description="ارسال SMS هنگام ثبت سفارش" />
      <Toggle checked={getVal("notifSales") !== false} onChange={() => setVal("notifSales", getVal("notifSales") === false ? true : false)} label="اعلان به تیم فروش" description="اطلاع‌رسانی به ادمین‌ها" />
      <Toggle checked={getVal("notifLowStock") !== false} onChange={() => setVal("notifLowStock", getVal("notifLowStock") === false ? true : false)} label="هشدار موجودی کم" />
      <Toggle checked={getVal("notifPriceOld") !== false} onChange={() => setVal("notifPriceOld", getVal("notifPriceOld") === false ? true : false)} label="هشدار قیمت بروز نشده" />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
