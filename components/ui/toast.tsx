"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "cn";

type ToastVariant = "default" | "success" | "error" | "info";

interface ToastData {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastData, "id">) => void;
  dismiss: (id: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let toastCounter = 0;

const variantStyles: Record<
  ToastVariant,
  { icon: React.ElementType; border: string }
> = {
  default: { icon: Info, border: "border-border" },
  success: { icon: CheckCircle2, border: "border-border" },
  error: { icon: AlertCircle, border: "border-border" },
  info: { icon: Info, border: "border-border" },
};

const iconStyles: Record<ToastVariant, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-500",
  error: "text-destructive",
  info: "text-muted-foreground",
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: number) => void;
}) {
  const { variant = "default", title, description } = toast;
  const { icon: Icon, border } = variantStyles[variant];

  return (
    <div
      role="alert"
      data-slot="toast"
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md",
        "animate-in slide-in-from-bottom-5 fade-in-0 zoom-in-95",
        border
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconStyles[variant])} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => onDismiss(toast.id)}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ title, description, variant, duration = 5000 }: Omit<ToastData, "id">) => {
      const id = ++toastCounter;

      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);

      if (duration > 0) {
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [],
  );

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toastItem) => (
          <ToastCard key={toastItem.id} toast={toastItem} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return ctx;
}
