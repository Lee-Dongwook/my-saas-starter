import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/cn";

export type ToastVariant = "default" | "success" | "warning" | "destructive";

export interface Toast {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  variant: ToastVariant;
}

export type ToastInput = Omit<Toast, "id" | "variant"> & {
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss; `0` keeps the toast until dismissed. */
  duration?: number;
};

interface ToastContextValue {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-popover text-popover-foreground",
  success: "border-success/30 bg-popover text-popover-foreground",
  warning: "border-warning/40 bg-popover text-popover-foreground",
  destructive: "border-destructive/30 bg-popover text-popover-foreground",
};

const variantIcon = {
  default: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  destructive: CircleAlert,
} as const;

const iconColor: Record<ToastVariant, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ duration = 5000, variant = "default", ...rest }: ToastInput) => {
      const id = `toast-${(counter.current += 1)}`;
      setToasts((current) => [...current, { id, variant, ...rest }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // `polite` so toasts are announced without interrupting the user.
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4"
      >
        {toasts.map((item) => {
          const Icon = variantIcon[item.variant];
          return (
            <div
              key={item.id}
              role={item.variant === "destructive" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex animate-slide-in-from-top gap-3 rounded-md border p-4 shadow-lg",
                variantStyles[item.variant],
              )}
            >
              <Icon
                aria-hidden
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  iconColor[item.variant],
                )}
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{item.title}</p>
                {item.description ? (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <X aria-hidden className="size-4" />
                <span className="sr-only">Dismiss</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}
