import { forwardRef } from "react";

import { cn } from "@/lib/cn";

/**
 * Native checkbox styled with `appearance-none` + a CSS-drawn tick, so it keeps
 * form semantics (labels, `required`, react-hook-form registration) for free.
 */
export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-input bg-background transition-colors",
      "checked:border-primary checked:bg-primary",
      "checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%2220 6 9 17 4 12%22/%3E%3C/svg%3E')] checked:bg-[length:14px_14px] checked:bg-center checked:bg-no-repeat",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));

Checkbox.displayName = "Checkbox";
