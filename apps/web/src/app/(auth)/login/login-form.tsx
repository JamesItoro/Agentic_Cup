"use client";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import { DEMO_PASSWORD, demoAccounts } from "@/lib/auth/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-strong">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Sign in to your onboarding workspace to pick up where you left off.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        {state.error ? (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
          >
            {state.error}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@accenture.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="/reset-password" className="text-xs font-medium text-brand hover:text-brand-hover">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted transition-colors hover:text-ink-strong"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {/* Demo credentials, synthetic accounts only */}
      <div className="mt-6 rounded-[var(--radius-md)] border border-border-default bg-surface-canvas p-3.5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Demo accounts
        </p>
        <ul className="space-y-1.5 text-xs text-ink-muted">
          {demoAccounts.map((a) => (
            <li key={a.userId} className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEmail(a.email)}
                className="truncate text-left font-medium text-ink-strong hover:text-brand"
                title="Use this email"
              >
                {a.email}
              </button>
              <span className="shrink-0">{a.roleLabel}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-muted">
          Password for all: <span className="font-semibold text-ink-strong">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </div>
  );
}
