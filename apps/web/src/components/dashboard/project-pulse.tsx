import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Flag,
  GitBranch,
  ShieldAlert,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ProjectUpdate, ProjectUpdateCategory } from "@/types";

const categoryMeta: Record<ProjectUpdateCategory, { icon: LucideIcon; label: string; tone: string }> = {
  blocker: { icon: ShieldAlert, label: "Blocker", tone: "text-danger" },
  risk: { icon: AlertTriangle, label: "Risk", tone: "text-warning" },
  milestone: { icon: Flag, label: "Milestone", tone: "text-success" },
  demo: { icon: CalendarDays, label: "Demo", tone: "text-brand" },
  decision: { icon: GitBranch, label: "Decision", tone: "text-info" },
};

interface ProjectPulseProps {
  updates: ProjectUpdate[];
  docTitleById: Record<string, string>;
}

export function ProjectPulse({ updates, docTitleById }: ProjectPulseProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Project pulse</CardTitle>
        <span className="text-xs text-ink-muted">Owners · blockers · milestones</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {updates.map((u) => {
          const meta = categoryMeta[u.category];
          const source = u.sourceDocumentId ? docTitleById[u.sourceDocumentId] : null;
          return (
            <div key={u.id} className="flex gap-3 border-b border-border-default pb-3 last:border-0 last:pb-0">
              <meta.icon className={`mt-0.5 size-4 shrink-0 ${meta.tone}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {meta.label}
                  </span>
                  {u.verified ? (
                    <Badge variant="neutral">as of {formatDate(u.asOfDate)}</Badge>
                  ) : (
                    <Badge variant="warning">not verified · conflicting sources</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-strong">{u.summary}</p>
                {source && u.sourceDocumentId ? (
                  <Link
                    href={`/knowledge/${u.sourceDocumentId}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
                  >
                    <FileText className="size-3.5" /> {source}
                  </Link>
                ) : (
                  <span className="mt-1 inline-block text-xs text-ink-muted">Source not linked</span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
