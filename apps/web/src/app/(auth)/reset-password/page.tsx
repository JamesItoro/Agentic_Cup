"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    // Mock: a real reset email is wired up with Supabase Auth later.
    setTimeout(() => {
      setPending(false);
      setSent(true);
    }, 700);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-brand">
            <Compass className="size-5 text-white" />
          </span>
          <span className="text-base font-semibold text-ink-strong">Project Compass AI</span>
        </div>

        {sent ? (
          <div className="space-y-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
              <MailCheck className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-ink-strong">Check your inbox</h1>
              <p className="mt-1.5 text-sm text-ink-muted">
                If an account exists for that address, we&apos;ve sent a link to reset your password.
                The link expires in 60 minutes.
              </p>
            </div>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-ink-strong">Reset your password</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Enter your work email and we&apos;ll send you a secure reset link.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" placeholder="you@accenture.com" required autoComplete="email" />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? "Sending…" : "Send reset link"}
              </Button>
            </form>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink-strong"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
