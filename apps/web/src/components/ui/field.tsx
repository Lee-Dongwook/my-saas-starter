import { useId } from "react";

import { cn } from "@/lib/cn";

import { Label } from "./label";

export interface FieldProps {
  label?: React.ReactNode;
  /** Validation message; its presence switches the field into the error state. */
  error?: string | null;
  /** Helper text shown when there is no error. */
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  /**
   * Receives the ids/ARIA wiring to spread onto the control, so the label,
   * hint and error message stay associated without callers repeating it.
   */
  children: (props: {
    id: string;
    invalid: boolean;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}

export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      {children({
        id,
        invalid: Boolean(error),
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
