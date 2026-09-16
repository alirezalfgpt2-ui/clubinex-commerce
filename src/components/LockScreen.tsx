import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface LockScreenProps {
  onUnlock: () => void;
  lockTimeout?: number; // minutes
}

export function LockScreen({ onUnlock, lockTimeout = 5 }: LockScreenProps) {
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => setLastActivity(Date.now());
    events.forEach((e) => document.addEventListener(e, handleActivity));
    return () => events.forEach((e) => document.removeEventListener(e, handleActivity));
  }, []);

  // Auto-lock after inactivity
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = (Date.now() - lastActivity) / (1000 * 60);
      if (elapsed >= lockTimeout) {
        // Lock the screen
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [lastActivity, lockTimeout]);

  const handleUnlock = () => {
    // Simple check - in production, verify against stored password
    if (password.length > 0) {
      onUnlock();
      setPassword("");
      setError("");
    } else {
      setError("لطفاً رمز عبور را وارد کنید");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="clay-card w-full max-w-sm p-8 text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold">صفحه قفل شده</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.name || user?.email || "کاربر"}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="رمز عبور را وارد کنید"
              className="clay-input w-full p-3 pr-10 pl-10 text-sm outline-none text-center"
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleUnlock}
            className="clay-button w-full py-2.5 text-sm font-semibold"
          >
            باز کردن قفل
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 mx-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          خروج از حساب
        </button>
      </motion.div>
    </motion.div>
  );
}
