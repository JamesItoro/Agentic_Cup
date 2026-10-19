import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

/** Simple initials avatar on a brand-tinted surface. */
export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/12 text-xs font-semibold text-brand select-none",
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
