import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "brand" | "success" | "warning" | "info";
}

const toneClass: Record<NonNullable<KpiTileProps["tone"]>, string> = {
  brand: "bg-brand/10 text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

export function KpiTile({ icon: Icon, label, value, hint, tone = "brand" }: KpiTileProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-10 items-center justify-center rounded-[var(--radius-md)]", toneClass[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none text-ink-strong">{value}</p>
          <p className="mt-1 truncate text-xs font-medium text-ink-muted">{label}</p>
        </div>
      </div>
      {hint ? <p className="mt-3 text-xs text-ink-muted">{hint}</p> : null}
    </Card>
  );
}
