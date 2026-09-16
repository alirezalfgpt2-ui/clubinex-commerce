/**
 * 🎯 ConfirmDialog — جایگزین زیبای browser confirm()
 * نمایش از سمت راست و پایین با انیمیشن، رنگ‌بندی مناسب
 */
import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, Trash2, X, Check } from "lucide-react";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

const VARIANT_STYLES: Record<ConfirmVariant, { bg: string; icon: string; btnBg: string; btnHover: string; border: string }> = {
  danger: {
    bg: "bg-rose-50",
    icon: "text-rose-600",
    btnBg: "bg-rose-600",
    btnHover: "hover:bg-rose-700",
    border: "border-rose-200",
  },
  warning: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    btnBg: "bg-amber-600",
    btnHover: "hover:bg-amber-700",
    border: "border-amber-200",
  },
  info: {
    bg: "bg-sky-50",
    icon: "text-sky-600",
    btnBg: "bg-sky-600",
    btnHover: "hover:bg-sky-700",
    border: "border-sky-200",
  },
};

const VARIANT_ICONS: Record<ConfirmVariant, ReactNode> = {
  danger: <Trash2 className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "تأیید",
    cancelText: "لغو",
    variant: "warning",
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || "تأیید",
        cancelText: options.cancelText || "لغو",
        variant: options.variant || "warning",
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((s) => ({ ...s, isOpen: false, resolve: null }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((s) => ({ ...s, isOpen: false, resolve: null }));
  };

  const variant = state.variant || "warning";
  const styles = VARIANT_STYLES[variant];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-start p-4 sm:items-center sm:justify-end sm:p-6"
            onClick={handleCancel}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Dialog card — slides from right */}
            <motion.div
              initial={{ x: 100, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-sm rounded-2xl border ${styles.border} ${styles.bg} shadow-2xl overflow-hidden`}
            >
              {/* Header */}
              <div className="flex items-start gap-3 p-5 pb-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon} bg-white/80 shadow-sm`}>
                  {VARIANT_ICONS[variant]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{state.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{state.message}</p>
                </div>
                <button onClick={handleCancel} className="shrink-0 p-1 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-5 pb-5 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {state.cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white ${styles.btnBg} ${styles.btnHover} rounded-xl transition-colors`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {state.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

/** Hook for triggering the confirm dialog */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}
