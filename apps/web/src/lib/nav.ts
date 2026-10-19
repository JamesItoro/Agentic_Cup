import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  Library,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { ProjectRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When set, only these roles see the item. */
  roles?: ProjectRole[];
}

export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Assistant", href: "/assistant", icon: Sparkles },
  { label: "My Onboarding", href: "/onboarding", icon: ListChecks },
  { label: "Knowledge Hub", href: "/knowledge", icon: Library },
  { label: "Team & Owners", href: "/team", icon: Users },
  { label: "Admin", href: "/admin", icon: ShieldCheck, roles: ["admin"] },
];

export const secondaryNav: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function visibleNav(items: NavItem[], role: ProjectRole | null): NavItem[] {
  return items.filter((i) => !i.roles || (role && i.roles.includes(role)));
}

/** Human label for a route, for breadcrumbs/titles. */
export function routeLabel(pathname: string): string {
  const all = [...primaryNav, ...secondaryNav];
  const match = all.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
  return match?.label ?? "Project Compass AI";
}
