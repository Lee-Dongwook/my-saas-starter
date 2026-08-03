import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Rendered right-aligned at the bottom — typically Cancel + confirm buttons. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Modal built on the native `<dialog>` element: the browser gives us the top
 * layer, focus trapping, Esc-to-close and `::backdrop` without a dependency.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // `cancel` fires on Esc; `close` covers form-method=dialog submissions.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      // Clicking the backdrop lands on the <dialog> itself, never its children.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "w-[calc(100vw-2rem)] max-w-lg rounded-lg border border-border bg-card p-0 text-card-foreground shadow-lg backdrop:bg-black/50",
        "open:animate-zoom-in",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 p-6 pb-4">
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold leading-none tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <X aria-hidden className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {children ? <div className="px-6 pb-2 text-sm">{children}</div> : null}

      {footer ? (
        <div className="flex justify-end gap-2 p-6 pt-4">{footer}</div>
      ) : null}
    </dialog>
  );
}
