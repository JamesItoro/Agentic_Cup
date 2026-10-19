import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/auth/session";
import { getDocuments, getKpiSummary, getTasks } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { OnboardingBoard } from "@/components/tasks/onboarding-board";

export default async function OnboardingPage() {
  const ctx = await getAppContext();
  if (!ctx) notFound();
  const { user, projectId } = ctx;

  const [tasks, docs, kpi] = await Promise.all([
    getTasks(user.userId, projectId),
    getDocuments(user.userId, projectId),
    getKpiSummary(user.userId, projectId),
  ]);
  const docTitleById = Object.fromEntries(docs.map((d) => [d.id, d.title]));

  return (
    <div>
      <PageHeader
        title="My onboarding"
        description="Your personalised path from discovering the engagement to making your first contribution."
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-5 p-5 sm:flex-row">
          <ProgressRing value={kpi?.progressPct ?? 0} sublabel="complete" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-ink-muted">
              You&apos;ve completed <span className="font-semibold text-ink-strong">{kpi?.tasksCompleted ?? 0}</span> of{" "}
              <span className="font-semibold text-ink-strong">{kpi?.tasksTotal ?? 0}</span> onboarding tasks.
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Progress is calculated from your real task records, complete a task to watch it move.
            </p>
          </div>
        </CardContent>
      </Card>

      <OnboardingBoard tasks={tasks} docTitleById={docTitleById} />
    </div>
  );
}
