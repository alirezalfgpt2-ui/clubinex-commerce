import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { ArrowRight, Loader2, Mail, UserX, Home } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Captcha } from "@/components/Captcha";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const rateLimitCheck = useQuery(api.rateLimit.checkLoginRateLimit, emailValue ? { identifier: emailValue } : "skip");
  const recordAttempt = useMutation(api.rateLimit.recordLoginAttempt);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaVerified) {
      setError("لطفاً کد امنیتی را صحیح وارد کنید.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      if (rateLimitCheck && !rateLimitCheck.allowed) {
        setError(`حساب شما قفل شده است. لطفاً ${rateLimitCheck.retryAfter} ثانیه صبر کنید.`);
        setIsLoading(false);
        return;
      }
      await signIn("email-otp", formData);
      await recordAttempt({ identifier: email, success: false }).catch(() => {});
      setStep({ email });
      setIsLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "ارسال کد تأیید با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const stepEmail = typeof step === "object" ? step.email : "unknown";
      await signIn("email-otp", formData);
      await recordAttempt({ identifier: stepEmail, success: true }).catch(() => {});
      // navigate(redirect); // Removed to rely on useEffect and avoid race condition
    } catch {
      const stepEmail = typeof step === "object" ? step.email : "unknown";
      await recordAttempt({ identifier: stepEmail, success: false }).catch(() => {});
      setError("کد تأیید واردشده صحیح نیست.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Wrap signIn in a timeout so the UI never hangs indefinitely.
      // In some environments the Convex HTTP action call may not resolve
      // (e.g. unreachable backend, broken WebSocket transport).
      const signInPromise = signIn("anonymous");
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("اتصال به سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.")), 15000),
      );
      const result = await Promise.race([signInPromise, timeoutPromise]);
      if (result?.signingIn) {
        navigate(redirect);
      } else {
        setError("ورود به عنوان مهمان انجام نشد. لطفاً دوباره تلاش کنید.");
        setIsLoading(false);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "ورود به عنوان مهمان ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="clay-card w-full max-w-[420px] overflow-hidden"
      >
        <button onClick={() => navigate("/")} className="absolute top-4 right-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors z-10">
          <Home className="h-4 w-4" />
          بازگشت به خانه
        </button>

        {step === "signIn" ? (
          <>
            <div className="p-8 pb-0 text-center">
              <div className="flex justify-center mb-4">
                <div className="clay-icon flex h-16 w-16 items-center justify-center bg-primary/10 cursor-pointer" onClick={() => navigate("/")}>
                  <img src={logo} alt="Clubinex" width={40} height={40} className="rounded-lg" />
                </div>
              </div>
              <h2 className="text-xl font-bold">خوش آمدید به Clubinex</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                ایمیل خود را وارد کنید تا وارد حساب شوید یا حساب جدید بسازید.
              </p>
            </div>
            <form onSubmit={handleEmailSubmit}>
              <div className="p-8 space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="email"
                    placeholder="email@example.com"
                    type="email"
                    className="clay-input pl-9 h-11"
                    disabled={isLoading}
                    onChange={(e) => setEmailValue(e.target.value)}
                    required
                  />
                </div>
                <Captcha onVerify={setCaptchaVerified} />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="clay-button w-full h-11 text-sm font-semibold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>ارسال کد تأیید <ArrowRight className="mr-2 h-4 w-4" /></>}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">یا</span></div>
                </div>
                <Button type="button" variant="outline" className="clay-surface w-full h-11 text-sm" onClick={handleGuestLogin} disabled={isLoading}>
                  <UserX className="mr-2 h-4 w-4" /> ورود به عنوان مهمان
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="p-8 pb-0 text-center">
              <h2 className="text-xl font-bold">تأیید هویت</h2>
              <p className="text-sm text-muted-foreground mt-1">
                کد ۶ رقمی ارسال‌شده به <span className="font-medium text-foreground">{step.email}</span> را وارد کنید.
              </p>
            </div>
            <form onSubmit={handleOtpSubmit}>
              <div className="p-8 space-y-4">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />
                <div className="flex justify-center">
                  <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        (e.target as HTMLElement).closest("form")?.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <p className="text-sm text-muted-foreground text-center">
                  کدی دریافت نکردید؟{" "}
                  <button type="button" className="p-0 h-auto text-primary underline bg-transparent border-none cursor-pointer text-sm" onClick={() => setStep("signIn")}>
                    ارسال مجدد
                  </button>
                </p>
                <Button type="submit" className="clay-button w-full h-11 text-sm font-semibold" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "در حال تأیید..." : "تأیید و ورود"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("signIn")} disabled={isLoading} className="w-full text-sm">
                  تغییر آدرس ایمیل
                </Button>
              </div>
            </form>
          </>
        )}

        <div className="py-3 px-6 text-[11px] text-center text-muted-foreground bg-muted/50 border-t">
          Clubinex Commerce — خریدی مطمئن و لذت‌بخش
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
