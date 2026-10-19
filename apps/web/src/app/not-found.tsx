import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-canvas px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-brand/10 text-brand">
        <Compass className="size-6" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-ink-strong">Page not found</h1>
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
          This page doesn&apos;t exist, or you don&apos;t have access to it on your current project.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
