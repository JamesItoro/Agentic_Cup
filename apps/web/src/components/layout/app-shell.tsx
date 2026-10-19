"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { AppHeader } from "./app-header";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Profile, Project, ProjectRole } from "@/types";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: Profile;
  projects: Project[];
  activeProjectId: string | null;
  role: ProjectRole | null;
  children: React.ReactNode;
}

export function AppShell({ user, projects, activeProjectId, role, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider>
        <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="fixed inset-y-0 left-0 w-64">
              <Sidebar role={role} />
            </div>
          </aside>

          {/* Mobile drawer */}
          {mobileOpen ? (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-ink-strong/50"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute inset-y-0 left-0 w-72 shadow-[var(--shadow-pop)]">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-white/70 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="size-5" />
                </button>
                <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          ) : null}

          {/* Main column */}
          <div className={cn("flex min-w-0 flex-1 flex-col")}>
            <AppHeader
              user={user}
              projects={projects}
              activeProjectId={activeProjectId}
              role={role}
              onOpenMobileNav={() => setMobileOpen(true)}
            />
            {/* key on the route so the gentle entrance replays on navigation,
                without a route-level template/Suspense boundary. */}
            <main
              key={pathname}
              className="animate-page mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8 md:py-8"
            >
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}
