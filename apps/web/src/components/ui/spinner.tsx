import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  /** Accessible label; set to `null` for purely decorative spinners. */
  label?: string | null;
}

export function Spinner({
  className,
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <>
      <LoaderCircle
        aria-hidden
        className={cn("h-4 w-4 animate-spin", className)}
        {...props}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}
