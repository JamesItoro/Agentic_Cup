"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  CircleDot,
  RotateCcw,
  Lock,
  FileText,
  User,
  CalendarClock,
  Loader2,
  MessageSquareText,
  Pencil,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { saveTaskReflectionAction, updateTaskStatusAction } from "@/lib/actions/tasks";
import { confidenceMeta, priorityMeta, taskStatusMeta } from "@/lib/status";
import { formatDate, relativeDays, cn } from "@/lib/utils";
import type { OnboardingTask, TaskConfidence, TaskStatus } from "@/types";

interface TaskItemProps {
  task: OnboardingTask;
  documentTitle?: string | null;
  compact?: boolean;
}

const CONFIDENCE_OPTIONS: { key: TaskConfidence; label: string; active: string }[] = [
  { key: "high", label: "High", active: "border-success/40 bg-success-soft text-success" },
  { key: "medium", label: "Medium", active: "border-warning/40 bg-warning-soft text-warning" },
  { key: "low", label: "Low", active: "border-danger/40 bg-danger-soft text-danger" },
];

export function TaskItem({ task, documentTitle, compact = false }: TaskItemProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isPending, startTransition] = useTransition();

  // Reflection state
  const [comment, setComment] = useState<string>(task.reflectionComment ?? "");
  const [confidence, setConfidence] = useState<TaskConfidence | null>(
    task.reflectionConfidence ?? null,
  );
  const [editing, setEditing] = useState(false);
  const [draftComment, setDraftComment] = useState("");
  const [draftConfidence, setDraftConfidence] = useState<TaskConfidence | null>(null);
  const [isSaving, startSaving] = useTransition();

  const done = status === "completed";
  const blocked = status === "blocked";
  const meta = taskStatusMeta[status];
  const hasReflection = Boolean(comment.trim() || confidence);

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
        // Invite a reflection the first time a task is completed.
        if (next === "completed" && !hasReflection) openEditor();
      }
    });
  }

  function openEditor() {
    setDraftComment(comment);
    setDraftConfidence(confidence);
    setEditing(true);
  }

  function saveReflection() {
    const nextComment = draftComment.trim();
    const nextConfidence = draftConfidence;
    // optimistic
    setComment(nextComment);
    setConfidence(nextConfidence);
    setEditing(false);
    startSaving(async () => {
      const res = await saveTaskReflectionAction(task.id, nextComment, nextConfidence);
      if (!res.ok) {
        toast({ tone: "error", title: "Couldn't save your note", description: res.error });
      } else {
        toast({ tone: "success", title: "Reflection saved", description: task.title });
      }
    });
  }

  const canSave = Boolean(draftComment.trim() || draftConfidence);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-border-default bg-surface-card p-3.5 transition-colors",
        done && "bg-surface-canvas/60",
      )}
    >
      <div className="flex items-start gap-3">
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
          ) : (
            <Check className="size-3" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("text-sm font-medium text-ink-strong", done && "text-ink-muted line-through")}>
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

      {/* Reflection: available once the task is complete */}
      {!compact && done ? (
        <div className="mt-3 pl-8">
          {editing ? (
            <div className="rounded-[var(--radius-md)] border border-border-default bg-surface-card p-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-strong">
                <MessageSquareText className="size-3.5 text-brand" /> How did it go?
              </label>
              <textarea
                value={draftComment}
                onChange={(e) => setDraftComment(e.target.value)}
                rows={2}
                placeholder="A quick note, what you learned or anything to flag for the team…"
                className="mt-2 w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface-canvas px-2.5 py-2 text-sm text-ink-strong placeholder:text-ink-muted focus-visible:border-brand focus-visible:outline-none"
              />
              <div className="mt-3">
                <p className="text-xs font-medium text-ink-muted">How confident do you feel?</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {CONFIDENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      aria-pressed={draftConfidence === opt.key}
                      onClick={() =>
                        setDraftConfidence(draftConfidence === opt.key ? null : opt.key)
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        draftConfidence === opt.key
                          ? opt.active
                          : "border-border-default text-ink-muted hover:border-border-strong hover:text-ink-strong",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" onClick={saveReflection} disabled={!canSave || isSaving}>
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save reflection
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : hasReflection ? (
            <div className="rounded-[var(--radius-md)] border border-border-default bg-surface-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <MessageSquareText className="size-3.5 text-brand" /> Your reflection
                </p>
                <button
                  onClick={openEditor}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
                >
                  <Pencil className="size-3" /> Edit
                </button>
              </div>
              {comment.trim() ? (
                <p className="mt-2 flex gap-1.5 text-sm text-ink-strong">
                  <Quote className="mt-0.5 size-3.5 shrink-0 text-ink-muted" />
                  <span>{comment}</span>
                </p>
              ) : null}
              {confidence ? (
                <div className="mt-2">
                  <Badge variant={confidenceMeta[confidence].variant}>
                    {confidenceMeta[confidence].label}
                  </Badge>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              onClick={openEditor}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-border-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
            >
              <MessageSquareText className="size-3.5" /> Add a note &amp; confidence rating
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
