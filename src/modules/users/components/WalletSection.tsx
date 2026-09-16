import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatJalaliDate } from "@/lib/jalali";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WalletSection() {
  const wallet = useQuery((api as any).wallets.getMyWallet);
  const transactions = useQuery((api as any).wallets.getMyTransactions);
  const addBalance = useMutation((api as any).wallets.addBalance);

  const [amountToAdd, setAmountToAdd] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddBalance = async () => {
    const amount = parseInt(amountToAdd);
    if (!amount || amount <= 0) {
      toast.error("مبلغ معتبری وارد کنید");
      return;
    }
    try {
      await addBalance({ amount });
      toast.success("موجودی کیف پول با موفقیت افزایش یافت.");
      setAmountToAdd("");
      setIsAdding(false);
    } catch (e) {
      toast.error("خطا در افزایش موجودی");
    }
  };

  if (wallet === undefined || transactions === undefined) {
    return (
      <div className="clay-card p-6 flex items-center justify-center min-h-[200px]">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="clay-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-primary" />
        <h2 className="font-bold text-sm">کیف پول من</h2>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">موجودی فعلی</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-primary">{(wallet?.balance || 0).toLocaleString("fa-IR")}</span>
            <span className="text-sm text-gray-500 mb-1">تومان</span>
          </div>
        </div>
        
        {isAdding ? (
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
            <input 
              type="number" 
              value={amountToAdd} 
              onChange={(e) => setAmountToAdd(e.target.value)} 
              placeholder="مبلغ به تومان" 
              className="text-sm px-3 py-2 outline-none w-32"
            />
            <button onClick={handleAddBalance} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">پرداخت</button>
            <button onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-bold">انصراف</button>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> افزایش موجودی
          </button>
        )}
      </div>

      <div>
        <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-gray-400" />
          تاریخچه تراکنش‌ها
        </h3>
        
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((t: any) => (
              <div key={t._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'deposit' || t.type === 'reward' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'deposit' || t.type === 'reward' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.description}</p>
                    <p className="text-[10px] text-gray-400">{formatJalaliDate(t.createdAt)}</p>
                  </div>
                </div>
                <div className={`text-sm font-extrabold flex items-center gap-1 ${t.type === 'deposit' || t.type === 'reward' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'deposit' || t.type === 'reward' ? '+' : '-'}
                  {t.amount.toLocaleString("fa-IR")}
                  <span className="text-[10px] font-normal text-gray-500">تومان</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-400">تراکنشی ثبت نشده است</p>
          </div>
        )}
      </div>
    </div>
  );
}
