import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border-strong bg-surface-card/60 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink-strong">{title}</p>
        {description ? <p className="mx-auto max-w-sm text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
