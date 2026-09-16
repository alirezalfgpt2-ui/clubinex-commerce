import { Hash, Truck } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش مالیات و عوارض */
export default function TaxSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("tax");

  return (
    <div className="space-y-4">
      <SectionHeader title="مالیات و عوارض" description="نرخ مالیات و عوارض فروشگاه." gradient="from-orange-50 to-amber-50 border-orange-200/50" />
      <Field label="درصد مالیات (%)" placeholder="9" value={getVal("taxRate")} onChange={(v) => setVal("taxRate", v)} icon={Hash} />
      <Field label="مالیات ارسال (%)" placeholder="0" value={getVal("shippingTaxRate")} onChange={(v) => setVal("shippingTaxRate", v)} icon={Truck} />
      <div className="rounded-xl bg-muted/30 border p-4"><p className="text-xs text-muted-foreground">مالیات خودکار روی جمع کل اعمال می‌شود. نرخ پیش‌فرض ۹٪.</p></div>
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
