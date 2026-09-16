import { CalendarClock } from "lucide-react";
import { useSettings } from "../hooks/use-settings";
import { Field, Toggle, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش قفل خودکار صفحه */
export default function LockscreenSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("lockscreen");

  return (
    <div className="space-y-4">
      <SectionHeader title="قفل خودکار صفحه" description="قفل خودکار پس از مدت زمان مشخص." gradient="from-slate-50 to-gray-100 border-slate-200/50" />
      <Toggle checked={getVal("lockscreenEnabled") !== false} onChange={() => setVal("lockscreenEnabled", getVal("lockscreenEnabled") === false ? true : false)} label="فعال‌سازی قفل خودکار" />
      <Field label="زمان قفل (دقیقه)" placeholder="10" value={getVal("lockscreenTimeout") || "10"} onChange={(v) => setVal("lockscreenTimeout", v)} icon={CalendarClock} />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
