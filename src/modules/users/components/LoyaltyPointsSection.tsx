import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/** بخش امتیازات وفاداری */
export function LoyaltyPointsSection() {
  const balance = useQuery(api.loyaltyPoints.getBalance);
  const history = useQuery(api.loyaltyPoints.getHistory);

  return (
    <div className="clay-card p-6 space-y-4">
      <h2 className="font-bold text-sm">⭐ امتیازات وفاداری</h2>
      <div className="clay-surface p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">موجودی امتیاز</p>
          <p className="text-2xl font-bold text-primary">{(balance ?? 0).toLocaleString("fa-IR")}</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">ارزش تقریبی</p>
          <p className="text-lg font-bold">{((balance ?? 0) * 10).toLocaleString("fa-IR")} تومان</p>
        </div>
      </div>
      {history && history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">تاریخچه امتیازات</p>
          {history.slice(0, 10).map((h: any) => (
            <div key={h._id} className="flex items-center justify-between text-xs py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="font-medium">{h.reason}</p>
                <p className="text-muted-foreground text-[10px]">{new Date(h.createdAt).toLocaleDateString("fa-IR")}</p>
              </div>
              <span className={`font-bold ${h.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {h.points > 0 ? "+" : ""}{h.points.toLocaleString("fa-IR")}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">💡 به ازای هر ۱۰,۰۰۰ تومان خرید، ۱ امتیاز دریافت کنید.</p>
    </div>
  );
}
