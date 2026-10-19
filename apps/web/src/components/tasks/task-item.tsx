"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, CircleDot, RotateCcw, Lock, FileText, User, CalendarClock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateTaskStatusAction } from "@/lib/actions/tasks";
import { priorityMeta, taskStatusMeta } from "@/lib/status";
import { formatDate, relativeDays, cn } from "@/lib/utils";
import type { OnboardingTask, TaskStatus } from "@/types";

interface TaskItemProps {
  task: OnboardingTask;
  documentTitle?: string | null;
  compact?: boolean;
}

export function TaskItem({ task, documentTitle, compact = false }: TaskItemProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isPending, startTransition] = useTransition();

  const done = status === "completed";
  const blocked = status === "blocked";
  const meta = taskStatusMeta[status];

  function toggle() {
    const next: TaskStatus = done ? "todo" : "completed";
    const previous = status;
    setStatus(next); // optimistic
    startTransition(async () => {
      const res = await updateTaskStatusAction(task.id, next);
      if (!res.ok) {
        setStatus(previous); // rollback
        toast({ tone: "error", title: "Couldn't update task", description: res.error });
      } else {
        toast({
          tone: "success",
          title: next === "completed" ? "Task completed" : "Task reopened",
          description: task.title,
        });
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-md)] border border-border-default bg-surface-card p-3.5 transition-colors",
        done && "bg-surface-canvas/60",
      )}
    >
      <button
        onClick={toggle}
        disabled={isPending || blocked}
        aria-pressed={done}
        aria-label={done ? `Reopen ${task.title}` : `Mark ${task.title} complete`}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          done
            ? "border-success bg-success text-white"
            : "border-border-strong text-transparent hover:border-brand",
          blocked && "cursor-not-allowed opacity-50",
        )}
      >
        {isPending ? (
          <Loader2 className="size-3 animate-spin text-ink-muted" />
        ) : done ? (
          <Check className="size-3" />
        ) : (
          <Check className="size-3" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("text-sm font-medium text-ink-strong", done && "line-through text-ink-muted")}>
            {task.title}
          </p>
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {!compact ? <Badge variant={priorityMeta[task.priority].variant}>{priorityMeta[task.priority].label}</Badge> : null}
        </div>

        {!compact ? <p className="mt-1 text-sm text-ink-muted">{task.description}</p> : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          {task.ownerName ? (
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" /> {task.ownerName}
            </span>
          ) : null}
          {task.dueAt ? (
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3.5" /> Due {formatDate(task.dueAt)} ({relativeDays(task.dueAt)})
            </span>
          ) : null}
          {documentTitle && task.sourceDocumentId ? (
            <Link
              href={`/knowledge/${task.sourceDocumentId}`}
              className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-hover"
            >
              <FileText className="size-3.5" /> {documentTitle}
            </Link>
          ) : null}
        </div>

        {blocked ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-danger">
            <Lock className="size-3.5" /> Blocked: waiting on access approval from {task.ownerName ?? "the owner"}.
          </p>
        ) : null}
      </div>

      {!compact && !blocked ? (
        <Button variant="ghost" size="sm" onClick={toggle} disabled={isPending} className="shrink-0">
          {done ? <RotateCcw className="size-4" /> : <CircleDot className="size-4" />}
          {done ? "Reopen" : "Complete"}
        </Button>
      ) : null}
    </div>
  );
}
