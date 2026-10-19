import { AppShell } from "@/components/layout/app-shell";
import { requireUser, getActiveProjectId, getActiveRole } from "@/lib/auth/session";
import { getProjectsForUser } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const projects = await getProjectsForUser(user.userId);
  const activeProjectId = await getActiveProjectId(user.userId);
  const role = activeProjectId ? await getActiveRole(user.userId, activeProjectId) : null;

  return (
    <AppShell user={user} projects={projects} activeProjectId={activeProjectId} role={role}>
      {children}
    </AppShell>
  );
}
