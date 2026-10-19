import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface-card px-3 text-sm text-ink-strong",
          "placeholder:text-ink-muted/70 transition-colors",
          "focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
