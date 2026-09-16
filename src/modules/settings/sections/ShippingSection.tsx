import { Truck, Zap } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش تنظیمات ارسال */
export default function ShippingSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("shipping");

  return (
    <div className="space-y-4">
      <SectionHeader title="تنظیمات ارسال" description="هزینه و روش‌های ارسال." gradient="from-teal-50 to-emerald-50 border-teal-200/50" />
      <Field label="هزینه پایه (تومان)" placeholder="0" value={getVal("baseShippingCost")} onChange={(v) => setVal("baseShippingCost", v)} icon={Truck} />
      <Field label="هزینه هر کیلو (تومان)" placeholder="0" value={getVal("perKgShippingCost")} onChange={(v) => setVal("perKgShippingCost", v)} />
      <Field label="ارسال رایگان از (تومان)" placeholder="500000" value={getVal("freeShippingThreshold")} onChange={(v) => setVal("freeShippingThreshold", v)} icon={Zap} />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
