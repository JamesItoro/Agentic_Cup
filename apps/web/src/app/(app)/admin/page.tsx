import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { AlertTriangle, FileText, ShieldCheck, Database, ScrollText } from "lucide-react";
import { getAppContext } from "@/lib/auth/session";
import {
  getDocuments,
  getProject,
  getProjectMembers,
  getProjectUpdates,
} from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { InviteDialog } from "@/components/admin/invite-dialog";
import { indexStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/utils";

const roleBadge = { member: "neutral", manager: "info", admin: "brand" } as const;

export default async function AdminPage() {
  const ctx = await getAppContext();
  if (!ctx) notFound();
  // Authorise server-side, never rely on the nav hiding this route.
  if (ctx.role !== "admin") redirect("/dashboard");
  const { user, projectId } = ctx;

  const [project, members, docs, updates] = await Promise.all([
    getProject(user.userId, projectId),
    getProjectMembers(user.userId, projectId),
    getDocuments(user.userId, projectId),
    getProjectUpdates(user.userId, projectId),
  ]);
  if (!project) notFound();

  const conflicts = updates.filter((u) => !u.verified);
  const indexedCount = docs.filter((d) => d.indexStatus === "indexed").length;

  return (
    <div>
      <PageHeader
        title="Admin console"
        description={`Manage ${project.name}, memberships, content and ingestion.`}
        actions={<InviteDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <ShieldCheck className="size-5 text-brand" />
          <p className="mt-2 text-2xl font-semibold text-ink-strong">{members.length}</p>
          <p className="text-xs text-ink-muted">Project members</p>
        </Card>
        <Card className="p-4">
          <Database className="size-5 text-info" />
          <p className="mt-2 text-2xl font-semibold text-ink-strong">
            {indexedCount}/{docs.length}
          </p>
          <p className="text-xs text-ink-muted">Documents indexed</p>
        </Card>
        <Card className="p-4">
          <AlertTriangle className="size-5 text-warning" />
          <p className="mt-2 text-2xl font-semibold text-ink-strong">{conflicts.length}</p>
          <p className="text-xs text-ink-muted">Conflicts to review</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Memberships & roles</CardTitle>
            <CardDescription>Who has access to this project, and at what level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.map((m) => (
              <div key={m.profile.userId} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border-default p-3">
                <Avatar name={m.profile.fullName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-strong">{m.profile.fullName}</p>
                  <p className="truncate text-xs text-ink-muted">{m.profile.email}</p>
                </div>
                <Badge variant={roleBadge[m.role]}>{m.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Conflicts to review */}
        <Card>
          <CardHeader>
            <CardTitle>Conflicts requiring review</CardTitle>
            <CardDescription>Assertions where sources disagree or aren&apos;t verified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {conflicts.length > 0 ? (
              conflicts.map((c) => (
                <div key={c.id} className="rounded-[var(--radius-md)] border border-warning/30 bg-warning-soft p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-warning" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-warning">Needs a single source of truth</span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-strong">{c.summary}</p>
                  {c.sourceDocumentId ? (
                    <Link href={`/knowledge/${c.sourceDocumentId}`} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover">
                      <FileText className="size-3.5" /> Review source
                    </Link>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-muted">No open conflicts.</p>
            )}
          </CardContent>
        </Card>

        {/* Ingestion status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Content & ingestion</CardTitle>
            <CardDescription>Document sources and their indexing status. Indexing runs in the AI stage.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-border-default">
              {docs.map((d, i) => (
                <div key={d.id} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? "border-t border-border-default" : ""}`}>
                  <FileText className="size-4 text-ink-muted" />
                  <Link href={`/knowledge/${d.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink-strong hover:text-brand">
                    {d.title}
                  </Link>
                  <span className="hidden text-xs text-ink-muted sm:block">updated {formatDate(d.updatedAt)}</span>
                  <Badge variant={indexStatusMeta[d.indexStatus].variant}>{indexStatusMeta[d.indexStatus].label}</Badge>
                </div>
              ))}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <ScrollText className="size-3.5" /> All admin actions are recorded to the audit trail (wired server-side in a later stage).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
