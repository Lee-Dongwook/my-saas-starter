import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

import { cn } from "@/lib/cn";

import { Input, type InputProps } from "./input";

/** Password field with a show/hide toggle. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type">
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        // Purely visual affordance; the input itself stays the labelled control.
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? (
          <EyeOff aria-hidden className="size-4" />
        ) : (
          <Eye aria-hidden className="size-4" />
        )}
        <span className="sr-only">
          {visible ? "Hide password" : "Show password"}
        </span>
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
