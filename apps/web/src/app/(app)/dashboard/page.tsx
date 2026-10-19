import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/auth/session";
import {
  getDocuments,
  getKpiSummary,
  getProject,
  getProjectUpdates,
  getTasks,
  getTeamContacts,
} from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { AskLauncher } from "@/components/dashboard/ask-launcher";
import { ProjectPulse } from "@/components/dashboard/project-pulse";
import { DocumentCard } from "@/components/documents/document-card";
import { ContactCard } from "@/components/team/contact-card";
import { TaskItem } from "@/components/tasks/task-item";
import { formatDate } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const ctx = await getAppContext();
  if (!ctx) notFound();
  const { user, projectId } = ctx;

  const [project, kpi, tasks, docs, updates, contacts] = await Promise.all([
    getProject(user.userId, projectId),
    getKpiSummary(user.userId, projectId),
    getTasks(user.userId, projectId),
    getDocuments(user.userId, projectId),
    getProjectUpdates(user.userId, projectId),
    getTeamContacts(user.userId, projectId),
  ]);
  if (!project || !kpi) notFound();

  const docTitleById = Object.fromEntries(docs.map((d) => [d.id, d.title]));
  const upNext = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""))
    .slice(0, 3);
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <Card className="overflow-hidden border-0">
        <div className="relative flex flex-col gap-6 bg-gradient-to-br from-brand-deep via-brand-deep to-brand p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(600px 220px at 90% -20%, rgba(161,0,255,0.5), transparent 60%)",
            }}
          />
          <div className="relative">
            <p className="text-sm text-white/70">{greeting()},</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight md:text-3xl">{firstName}</h1>
            <p className="mt-2 max-w-md text-sm text-white/75">
              Your first weeks on <span className="font-medium text-white">{project.name}</span> for{" "}
              {project.client}.
            </p>
            <p className="mt-1 max-w-md text-sm text-white/75">
              Day {kpi.daysSinceJoining}, here&apos;s where things stand.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="text-ink-strong">
                <Link href="/onboarding">
                  Continue onboarding <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Badge variant="brand" className="bg-white/15 text-white">
                {project.status === "active" ? "Delivery in progress" : project.status}
              </Badge>
            </div>
          </div>
          <div className="relative shrink-0">
            <ProgressRing value={kpi.progressPct} sublabel="onboarding" variant="onDark" />
          </div>
        </div>
      </Card>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile
          icon={CheckCircle2}
          tone="success"
          label="Tasks completed"
          value={`${kpi.tasksCompleted}/${kpi.tasksTotal}`}
          hint={`${kpi.progressPct}% of your checklist`}
        />
        <KpiTile icon={Clock} tone="warning" label="Pending actions" value={kpi.pendingActions} hint="To do, in progress or blocked" />
        <KpiTile icon={FileText} tone="info" label="Docs reviewed" value={kpi.docsReviewed} hint={`${kpi.docsRecommended} in the knowledge hub`} />
        <KpiTile
          icon={CalendarDays}
          tone="brand"
          label={kpi.nextMilestone?.label ?? "Next milestone"}
          value={kpi.nextMilestone?.date ? formatDate(kpi.nextMilestone.date) : "-"}
          hint="Next key checkpoint"
        />
      </div>

      {/* Up next + Ask AI */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Up next</CardTitle>
            <Link href="/onboarding" className="text-xs font-medium text-brand hover:text-brand-hover">
              View all tasks
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upNext.length > 0 ? (
              upNext.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  compact
                  documentTitle={t.sourceDocumentId ? docTitleById[t.sourceDocumentId] : null}
                />
              ))
            ) : (
              <EmptyState icon={ListChecks} title="You're all caught up" description="No outstanding onboarding tasks right now." />
            )}
          </CardContent>
        </Card>

        <AskLauncher />
      </div>

      {/* Pulse + recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectPulse updates={updates} docTitleById={docTitleById} />

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recommended for you</CardTitle>
              <Link href="/knowledge" className="text-xs font-medium text-brand hover:text-brand-hover">
                Knowledge hub
              </Link>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {docs.slice(0, 4).map((d) => (
                <DocumentCard key={d.id} doc={d} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Key contacts</CardTitle>
              <Link href="/team" className="text-xs font-medium text-brand hover:text-brand-hover">
                Team &amp; owners
              </Link>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {contacts.slice(0, 2).map((c) => (
                <ContactCard key={c.id} contact={c} sourceTitle={c.sourceDocumentId ? docTitleById[c.sourceDocumentId] : null} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
