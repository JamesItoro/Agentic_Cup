import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { profiles } from "@/lib/data/dataset";
import { getMembershipsForUser } from "@/lib/data";
import type { Profile, ProjectRole } from "@/types";

/**
 * Stage-A mock session. A signed Supabase session replaces this later; the
 * surface (getSessionUser / requireUser / active project) stays the same so
 * callers don't change.
 */
export const SESSION_COOKIE = "compass_session";
export const PROJECT_COOKIE = "compass_project";

export interface SessionUser {
  profile: Profile;
}

export async function getSessionUser(): Promise<Profile | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return profiles.find((p) => p.userId === userId) ?? null;
}

/** Redirects to /login when there is no valid session. */
export async function requireUser(): Promise<Profile> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Resolve the active project for the current user. Falls back to the user's
 * first membership. Returns null when the user has no memberships or the cookie
 * points at a project they are not a member of (never trust the cookie alone).
 */
export async function getActiveProjectId(userId: string): Promise<string | null> {
  const memberships = await getMembershipsForUser(userId);
  if (memberships.length === 0) return null;
  const store = await cookies();
  const cookieProject = store.get(PROJECT_COOKIE)?.value;
  const valid = memberships.find((m) => m.projectId === cookieProject);
  return valid?.projectId ?? memberships[0].projectId;
}

export async function getActiveRole(
  userId: string,
  projectId: string,
): Promise<ProjectRole | null> {
  const memberships = await getMembershipsForUser(userId);
  return memberships.find((m) => m.projectId === projectId)?.role ?? null;
}

export interface AppContext {
  user: Profile;
  projectId: string;
  role: ProjectRole;
}

/**
 * Resolve the signed-in user, their active project and role in one call.
 * Redirects to /login when unauthenticated. Returns null projectId handling to
 * the caller only when the user has no memberships at all.
 */
export async function getAppContext(): Promise<AppContext | null> {
  const user = await requireUser();
  const projectId = await getActiveProjectId(user.userId);
  if (!projectId) return null;
  const role = (await getActiveRole(user.userId, projectId)) ?? "member";
  return { user, projectId, role };
}
