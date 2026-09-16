import { useSettings } from "../hooks/use-settings";
import { Toggle, SaveButton, SectionHeader } from "../components/SettingsUI";

/** بخش کپچا و محافظت */
export default function CaptchaSection() {
  const { getVal, setVal, handleSaveAll, isSaving } = useSettings("captcha");

  return (
    <div className="space-y-4">
      <SectionHeader title="کپچا و محافظت" description="محافظت از فرم‌ها در برابر ربات‌ها." gradient="from-emerald-50 to-green-50 border-emerald-200/50" />
      <Toggle checked={getVal("captchaEnabled") === true} onChange={() => setVal("captchaEnabled", getVal("captchaEnabled") === true ? false : true)} label="فعال‌سازی کپچا" description="محافظت از فرم ورود در برابر ربات‌ها" />
      <SaveButton onClick={handleSaveAll} loading={isSaving} />
    </div>
  );
}
