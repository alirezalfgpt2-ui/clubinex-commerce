import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, RotateCcw, Package } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "در انتظار بررسی", color: "bg-amber-100 text-amber-700", icon: Package },
  approved: { label: "تایید شده", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  rejected: { label: "رد شده", color: "bg-red-100 text-red-700", icon: XCircle },
  refunded: { label: "بازپرداخت شده", color: "bg-emerald-100 text-emerald-700", icon: RotateCcw },
};

export default function ReturnListPage() {
  const returns = useQuery(api.returnRequests.listAll, {});
  const updateStatus = useMutation(api.returnRequests.updateStatus);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async (status: "approved" | "rejected" | "refunded") => {
    if (!selectedReturn) return;
    setIsProcessing(true);
    try {
      await updateStatus({
        requestId: selectedReturn._id,
        status,
        adminNote: adminNote || undefined,
      });
      toast.success(
        status === "approved"
          ? "درخواست مرجوعی تایید شد"
          : status === "rejected"
            ? "درخواست مرجوعی رد شد"
            : "بازپرداخت انجام شد",
      );
      setSelectedReturn(null);
      setAdminNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در بروزرسانی");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">درخواست‌های مرجوعی کالا</h1>
        <p className="text-sm text-muted-foreground mt-0.5">مدیریت درخواست‌های مرجوعی مشتریان</p>
      </div>

      {!returns ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : returns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RotateCcw className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">هنوز درخواست مرجوعی ثبت نشده است.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => {
            const cfg = statusConfig[r.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Card
                key={r._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedReturn(r);
                  setAdminNote(r.adminNote ?? "");
                }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        سفارش: {r.orderId} — محصول: {r.productId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {r.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cfg.color}>{cfg.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!selectedReturn}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReturn(null);
            setAdminNote("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>جزئیات درخواست مرجوعی</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">شناسه سفارش:</span>
                  <p className="font-medium">{selectedReturn.orderId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">شناسه محصول:</span>
                  <p className="font-medium">{selectedReturn.productId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">شناسه کاربر:</span>
                  <p className="font-medium">{selectedReturn.userId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">وضعیت:</span>
                  <p>
                    <Badge className={statusConfig[selectedReturn.status]?.color}>
                      {statusConfig[selectedReturn.status]?.label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">علت مرجوعی:</span>
                <p className="text-sm mt-1">{selectedReturn.reason}</p>
              </div>
              {selectedReturn.images?.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">تصاویر:</span>
                  <div className="flex gap-2 mt-1">
                    {selectedReturn.images.map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt={`تصویر ${i + 1}`}
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">یادداشت ادمین:</span>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="یادداشت داخلی..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedReturn?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                  رد درخواست
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  تایید مرجوعی
                </Button>
              </>
            )}
            {selectedReturn?.status === "approved" && (
              <Button
                onClick={() => handleStatusUpdate("refunded")}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                بازپرداخت
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
