"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import { Check, ChevronDown, Menu, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction, setActiveProjectAction } from "@/lib/actions/auth";
import { routeLabel } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Profile, Project, ProjectRole } from "@/types";

interface AppHeaderProps {
  user: Profile;
  projects: Project[];
  activeProjectId: string | null;
  role: ProjectRole | null;
  onOpenMobileNav: () => void;
}

const roleLabel: Record<ProjectRole, string> = {
  member: "Member",
  manager: "Manager",
  admin: "Admin",
};

export function AppHeader({ user, projects, activeProjectId, role, onOpenMobileNav }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0];

  function switchProject(projectId: string) {
    if (projectId === activeProjectId) return;
    startTransition(async () => {
      await setActiveProjectAction(projectId);
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-default bg-surface-card/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onOpenMobileNav}
        className="rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-canvas hover:text-ink-strong md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      {/* Breadcrumb / page title */}
      <div className="hidden min-w-0 items-center gap-2 text-sm md:flex">
        <span className="text-ink-muted">{activeProject?.name ?? "Project"}</span>
        <span className="text-ink-muted/50">/</span>
        <span className="truncate font-medium text-ink-strong">{routeLabel(pathname)}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Project selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border-default bg-surface-card px-3 py-2 text-sm font-medium text-ink-strong transition-colors hover:bg-surface-canvas focus-visible:outline-none",
              isPending && "opacity-60",
            )}
          >
            <Building2 className="size-4 text-ink-muted" />
            <span className="max-w-[9rem] truncate">{activeProject?.name ?? "Select project"}</span>
            <ChevronDown className="size-4 text-ink-muted" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Your projects</DropdownMenuLabel>
            {projects.map((p) => (
              <DropdownMenuItem key={p.id} onSelect={() => switchProject(p.id)}>
                <span className="flex-1 truncate">
                  {p.name}
                  <span className="block text-xs text-ink-muted">{p.client}</span>
                </span>
                {p.id === activeProjectId ? <Check className="size-4 text-brand" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-surface-canvas focus-visible:outline-none">
            <Avatar name={user.fullName} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <div className="flex items-center gap-3 px-2.5 py-2">
              <Avatar name={user.fullName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-strong">{user.fullName}</p>
                <p className="truncate text-xs text-ink-muted">{user.email}</p>
              </div>
            </div>
            {role ? (
              <div className="px-2.5 pb-2">
                <Badge variant="brand">{roleLabel[role]} on this project</Badge>
              </div>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logoutAction()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
