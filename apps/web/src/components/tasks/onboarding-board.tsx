"use client";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskItem } from "./task-item";
import { stageMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import type { OnboardingStage, OnboardingTask, TaskStatus } from "@/types";

const STAGES: OnboardingStage[] = ["discover", "access", "learn", "contribute"];

type Filter = "all" | "todo" | "in_progress" | "completed";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

function matches(task: OnboardingTask, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "todo") return task.status === "todo" || task.status === "blocked";
  return task.status === (filter as TaskStatus);
}

export function OnboardingBoard({
  tasks,
  docTitleById,
}: {
  tasks: OnboardingTask[];
  docTitleById: Record<string, string>;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const byStage = useMemo(() => {
    const map: Record<string, OnboardingTask[]> = {};
    for (const s of STAGES) map[s] = tasks.filter((t) => t.stage === s);
    return map;
  }, [tasks]);

  return (
    <Tabs defaultValue="discover">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          {STAGES.map((s) => {
            const count = byStage[s].length;
            const done = byStage[s].filter((t) => t.status === "completed").length;
            return (
              <TabsTrigger key={s} value={s}>
                {stageMeta[s].label}
                <span className="text-xs opacity-70">
                  {done}/{count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-border-default bg-surface-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium transition-colors",
                filter === f.key ? "bg-surface-canvas text-ink-strong" : "text-ink-muted hover:text-ink-strong",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {STAGES.map((s) => {
        const visible = byStage[s].filter((t) => matches(t, filter));
        return (
          <TabsContent key={s} value={s}>
            <div className="mb-3 flex items-center gap-2">
              <p className="text-sm text-ink-muted">{stageMeta[s].blurb}</p>
              <Badge variant="neutral">{visible.length} shown</Badge>
            </div>
            <div className="space-y-3">
              {visible.length > 0 ? (
                visible.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    documentTitle={t.sourceDocumentId ? docTitleById[t.sourceDocumentId] : null}
                  />
                ))
              ) : (
                <EmptyState
                  icon={ListChecks}
                  title="Nothing here"
                  description={`No ${filter === "all" ? "" : FILTERS.find((f) => f.key === filter)?.label.toLowerCase() + " "}tasks in this stage.`}
                />
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
