import type { LucideIcon } from "lucide-react";

/** کارت آمار — نمایش عدد، آیکون و روند */
interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  color: string;
  trend?: string;
}

export function MetricCard({ icon: Icon, title, value, color, trend }: MetricCardProps) {
  return (
    <div className="clay-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold tracking-tight mt-1">{value}</p>
          {trend && <p className="text-[10px] text-emerald-600 mt-0.5">{trend}</p>}
        </div>
        <div className={`clay-icon flex h-10 w-10 items-center justify-center ${color} rounded-xl`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
