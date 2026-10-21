import Link from "next/link";
import {
  Users,
  ListChecks,
  Lock,
  CheckCircle2,
  MessageSquareText,
  CalendarClock,
  User as UserIcon,
  FileText,
  Quote,
} from "lucide-react";
import { getDocuments, getProject, getTeamOnboarding } from "@/lib/data";
import type { JoinerOnboarding } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { AssignTaskDialog } from "@/components/dashboard/assign-task-dialog";
import { confidenceMeta, priorityMeta } from "@/lib/status";
import { formatDate, relativeDays } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

interface ManagerDashboardProps {
  userId: string;
  projectId: string;
  fullName: string;
}

/**
 * The project lead's landing view: onboarding progress for every new joiner on
 * the project, with the ability to assign new tasks. Replaces the new-joiner
 * dashboard for managers and admins.
 */
export async function ManagerDashboard({ userId, projectId, fullName }: ManagerDashboardProps) {
  const [project, joiners, docs] = await Promise.all([
    getProject(userId, projectId),
    getTeamOnboarding(userId, projectId),
    getDocuments(userId, projectId),
  ]);

  const firstName = fullName.split(" ")[0];
  const docOptions = docs.map((d) => ({ id: d.id, title: d.title }));

  const totalTasks = joiners.reduce((n, j) => n + j.tasksTotal, 0);
  const totalCompleted = joiners.reduce((n, j) => n + j.tasksCompleted, 0);
  const openBlockers = joiners.reduce((n, j) => n + j.blocked, 0);
  const reflectionsLogged = joiners.reduce((n, j) => n + j.reflections.length, 0);
  const avgProgress =
    joiners.length === 0
      ? 0
      : Math.round(joiners.reduce((n, j) => n + j.progressPct, 0) / joiners.length);

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
              Onboarding across{" "}
              <span className="font-medium text-white">{project?.name ?? "your project"}</span> at a
              glance.
            </p>
            <p className="mt-1 max-w-md text-sm text-white/75">
              {joiners.length === 0
                ? "No new joiners are currently onboarding."
                : `You're tracking ${joiners.length} new ${joiners.length === 1 ? "joiner" : "joiners"}.`}
            </p>
          </div>
          {joiners.length > 0 ? (
            <div className="relative shrink-0">
              <ProgressRing value={avgProgress} sublabel="avg progress" variant="onDark" />
            </div>
          ) : null}
        </div>
      </Card>

      {/* Team summary tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile icon={Users} tone="brand" label="New joiners" value={joiners.length} hint="Members onboarding on this project" />
        <KpiTile icon={CheckCircle2} tone="success" label="Tasks completed" value={`${totalCompleted}/${totalTasks}`} hint="Across all joiners" />
        <KpiTile icon={Lock} tone="warning" label="Open blockers" value={openBlockers} hint="Tasks waiting on someone" />
        <KpiTile icon={MessageSquareText} tone="info" label="Reflections logged" value={reflectionsLogged} hint="Notes & confidence recorded" />
      </div>

      {/* Per-joiner tracking */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">New joiners</h2>
        {joiners.length === 0 ? (
          <Card>
            <CardContent className="pt-5">
              <EmptyState
                icon={Users}
                title="No new joiners yet"
                description="When someone is added to this project as a member, their onboarding progress will appear here."
              />
            </CardContent>
          </Card>
        ) : (
          joiners.map((j) => (
            <JoinerCard key={j.profile.userId} joiner={j} docOptions={docOptions} />
          ))
        )}
      </div>
    </div>
  );
}

function JoinerCard({
  joiner: j,
  docOptions,
}: {
  joiner: JoinerOnboarding;
  docOptions: { id: string; title: string }[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 border-b border-border-default">
        <div className="flex items-center gap-3">
          <Avatar name={j.profile.fullName} className="size-11" />
          <div className="min-w-0">
            <CardTitle className="truncate">{j.profile.fullName}</CardTitle>
            <p className="truncate text-sm text-ink-muted">{j.profile.jobTitle}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Day {j.daysSinceJoining} · joined {relativeDays(j.joinedAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <ProgressRing value={j.progressPct} size={72} strokeWidth={8} sublabel="done" />
          <AssignTaskDialog assigneeId={j.profile.userId} assigneeName={j.profile.fullName} docs={docOptions} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Stat chips */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Completed" value={`${j.tasksCompleted}/${j.tasksTotal}`} />
          <Stat label="In progress" value={j.inProgress} />
          <Stat label="Blocked" value={j.blocked} tone={j.blocked > 0 ? "danger" : undefined} />
          <Stat label="Docs reviewed" value={j.docsReviewed} />
        </div>

        {/* Blocked on */}
        {j.blockedTasks.length > 0 ? (
          <Section icon={Lock} title="Blocked on">
            <ul className="space-y-1.5">
              {j.blockedTasks.map((t) => (
                <li key={t.id} className="flex items-start gap-2 text-sm text-ink-strong">
                  <Lock className="mt-0.5 size-3.5 shrink-0 text-danger" />
                  <span>
                    {t.title}
                    {t.ownerName ? (
                      <span className="text-ink-muted"> — waiting on {t.ownerName}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* Up next */}
        {j.upNext.length > 0 ? (
          <Section icon={ListChecks} title="Working on next">
            <ul className="space-y-1.5">
              {j.upNext.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-strong">
                  <span>{t.title}</span>
                  <Badge variant={priorityMeta[t.priority].variant}>{priorityMeta[t.priority].label}</Badge>
                  {t.dueAt ? (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                      <CalendarClock className="size-3.5" /> Due {formatDate(t.dueAt)} ({relativeDays(t.dueAt)})
                    </span>
                  ) : null}
                  {t.ownerName ? (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                      <UserIcon className="size-3.5" /> {t.ownerName}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : (
          <p className="text-sm text-ink-muted">All onboarding tasks complete. Nothing outstanding.</p>
        )}

        {/* Reflections */}
        {j.reflections.length > 0 ? (
          <Section icon={MessageSquareText} title="Reflections & confidence">
            <div className="space-y-2.5">
              {j.reflections.map((r) => (
                <div key={r.taskId} className="rounded-[var(--radius-md)] border border-border-default bg-surface-canvas/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                      {r.taskTitle}
                    </p>
                    {r.confidence ? (
                      <Badge variant={confidenceMeta[r.confidence].variant}>
                        {confidenceMeta[r.confidence].label}
                      </Badge>
                    ) : null}
                  </div>
                  {r.comment ? (
                    <p className="mt-1.5 flex gap-1.5 text-sm text-ink-strong">
                      <Quote className="mt-0.5 size-3.5 shrink-0 text-ink-muted" />
                      <span>{r.comment}</span>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "danger";
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-default bg-surface-canvas/60 px-3 py-2.5">
      <p className={`text-lg font-semibold leading-none ${tone === "danger" ? "text-danger" : "text-ink-strong"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-ink-muted">{label}</p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <Icon className="size-3.5 text-brand" /> {title}
      </p>
      {children}
    </div>
  );
}
