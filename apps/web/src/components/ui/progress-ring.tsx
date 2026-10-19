import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: React.ReactNode;
  sublabel?: string;
  /** "default" for light surfaces, "onDark" for the purple hero. */
  variant?: "default" | "onDark";
}

/** Accessible SVG progress ring. Colours adapt to the surface via `variant`. */
export function ProgressRing({
  value,
  size = 112,
  strokeWidth = 10,
  className,
  label,
  sublabel,
  variant = "default",
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const onDark = variant === "onDark";
  const trackColor = onDark ? "rgba(255,255,255,0.25)" : "var(--color-border-default)";
  const progressColor = onDark ? "#ffffff" : "var(--color-brand)";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={sublabel ?? "Progress"}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms var(--ease-out-soft)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-xl font-semibold", onDark ? "text-white" : "text-ink-strong")}>
          {label ?? `${clamped}%`}
        </span>
        {sublabel ? (
          <span className={cn("text-xs", onDark ? "text-white/75" : "text-ink-muted")}>{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
