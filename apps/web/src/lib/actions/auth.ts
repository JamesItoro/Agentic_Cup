"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAccount } from "@/lib/auth/accounts";
import { PROJECT_COOKIE, SESSION_COOKIE } from "@/lib/auth/session";
import { getMembershipsForUser } from "@/lib/data";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export type LoginState = { error?: string };

/** Stage-A mock sign-in. Replaced by Supabase Auth later. */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const account = findAccount(email, password);
  if (!account) {
    return { error: "Those credentials don't match any account. Check the demo hints below." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, account.userId, COOKIE_OPTS);

  // Default the active project to the user's first membership.
  const memberships = await getMembershipsForUser(account.userId);
  if (memberships[0]) {
    store.set(PROJECT_COOKIE, memberships[0].projectId, COOKIE_OPTS);
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PROJECT_COOKIE);
  redirect("/login");
}

/** Switch the active project, only if the user is actually a member of it. */
export async function setActiveProjectAction(projectId: string) {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) redirect("/login");
  const memberships = await getMembershipsForUser(userId);
  if (!memberships.some((m) => m.projectId === projectId)) {
    return; // never trust a project id the user isn't a member of
  }
  store.set(PROJECT_COOKIE, projectId, COOKIE_OPTS);
}
