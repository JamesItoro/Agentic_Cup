"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LogOut } from "lucide-react";
import { primaryNav, secondaryNav, visibleNav } from "@/lib/nav";
import { logoutAction } from "@/lib/actions/auth";
import type { ProjectRole } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: ProjectRole | null;
  onNavigate?: () => void;
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const primary = visibleNav(primaryNav, role);

  return (
    <div className="flex h-full flex-col bg-surface-sidebar text-white/80">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-brand">
          <Compass className="size-5 text-white" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Compass AI</p>
          <p className="text-[11px] text-white/45">Onboarding Portal</p>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary">
        {primary.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-white/65 hover:bg-surface-sidebar-muted hover:text-white",
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Secondary + sign out */}
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        {secondaryNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-surface-sidebar-muted text-white" : "text-white/65 hover:bg-surface-sidebar-muted hover:text-white",
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-surface-sidebar-muted hover:text-white"
          >
            <LogOut className="size-[18px] shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
