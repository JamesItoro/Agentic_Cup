import { redirect } from "next/navigation";
import { Compass, ShieldCheck, FileSearch, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-deep p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(1200px 500px at 15% -10%, rgba(161,0,255,0.55), transparent 60%), radial-gradient(900px 600px at 110% 110%, rgba(135,0,214,0.45), transparent 55%)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-white/15 backdrop-blur">
            <Compass className="size-5" />
          </span>
          <span className="text-lg font-semibold">Project Compass AI</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            From new joiner to contributing team member, faster.
          </h2>
          <p className="mt-4 text-white/70">
            Your engagement, your onboarding checklist and evidence-backed answers, in one secure,
            project-scoped workspace.
          </p>

          <ul className="mt-8 space-y-3.5 text-sm text-white/85">
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-5 shrink-0 text-white/70" />
              Project-isolated access, you only ever see your engagement.
            </li>
            <li className="flex items-center gap-3">
              <FileSearch className="size-5 shrink-0 text-white/70" />
              Answers cite the source document, page and freshness.
            </li>
            <li className="flex items-center gap-3">
              <Sparkles className="size-5 shrink-0 text-white/70" />
              A personalised first-week plan that tracks real progress.
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Accenture-inspired styling, not an officially approved brand system. Synthetic demo data only.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface-canvas px-6 py-12">
        <LoginForm />
      </div>
    </div>
  );
}
