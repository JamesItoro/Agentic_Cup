"use client";
import * as React from "react";
import { CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const toneMeta: Record<ToastTone, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: "text-success" },
  error: { icon: AlertTriangle, className: "text-danger" },
  info: { icon: Info, className: "text-brand" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
        aria-live="polite"
        role="region"
      >
        {toasts.map((t) => {
          const Icon = toneMeta[t.tone].icon;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border border-border-default bg-surface-card p-3.5 shadow-[var(--shadow-pop)]"
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", toneMeta[t.tone].className)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-strong">{t.title}</p>
                {t.description ? <p className="mt-0.5 text-sm text-ink-muted">{t.description}</p> : null}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="rounded p-0.5 text-ink-muted transition-colors hover:text-ink-strong"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
