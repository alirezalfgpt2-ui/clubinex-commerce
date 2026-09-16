import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, size = "md", disabled = false }: ToggleSwitchProps) {
  const isSm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        isSm ? "h-4 w-7" : "h-6 w-11",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
          isSm ? "h-3 w-3" : "h-5 w-5",
          // در RTL، منفی به سمت چپ می‌رود (حالت روشن) و ۰ به سمت راست (حالت خاموش)
          checked ? (isSm ? "-translate-x-3" : "-translate-x-5") : "translate-x-0"
        )}
      />
    </button>
  );
}
