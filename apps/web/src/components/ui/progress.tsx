import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0..100
  className?: string;
  tone?: "brand" | "success";
}

export function Progress({ value, className, tone = "brand" }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-border-default", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", tone === "brand" ? "bg-brand" : "bg-success")}
        style={{ width: `${clamped}%`, transitionTimingFunction: "var(--ease-out-soft)" }}
      />
    </div>
  );
}
