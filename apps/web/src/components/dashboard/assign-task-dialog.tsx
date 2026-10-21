"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createOnboardingTaskAction } from "@/lib/actions/tasks";
import type { OnboardingStage, TaskPriority } from "@/types";

interface AssignTaskDialogProps {
  assigneeId: string;
  assigneeName: string;
  /** Project documents the task can reference as its source. */
  docs: { id: string; title: string }[];
}

const selectClass =
  "h-10 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface-card px-3 text-sm text-ink-strong focus-visible:outline-none focus-visible:border-brand";

export function AssignTaskDialog({ assigneeId, assigneeName, docs }: AssignTaskDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<OnboardingStage>("discover");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [due, setDue] = useState(""); // yyyy-mm-dd
  const [owner, setOwner] = useState("");
  const [sourceDoc, setSourceDoc] = useState("");

  const firstName = assigneeName.split(" ")[0];

  function reset() {
    setTitle("");
    setDescription("");
    setStage("discover");
    setPriority("medium");
    setDue("");
    setOwner("");
    setSourceDoc("");
  }

  function submit() {
    if (!title.trim()) return;
    setPending(true);
    createOnboardingTaskAction({
      assigneeId,
      title,
      description,
      stage,
      priority,
      dueAt: due ? new Date(due).toISOString() : null,
      ownerName: owner || null,
      sourceDocumentId: sourceDoc || null,
    })
      .then((res) => {
        if (!res.ok) {
          toast({ tone: "error", title: "Couldn't assign the task", description: res.error });
          return;
        }
        toast({
          tone: "success",
          title: "Task assigned",
          description: `"${title.trim()}" was added to ${firstName}'s onboarding.`,
        });
        reset();
        setOpen(false);
        router.refresh();
      })
      .finally(() => setPending(false));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="size-4" /> Assign task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign an onboarding task</DialogTitle>
          <DialogDescription>
            This task is added to {firstName}&apos;s checklist. They can update its status and
            reflect on it like any other.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shadow a client support call"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What should they do, and why does it matter?"
              className="w-full resize-none rounded-[var(--radius-md)] border border-border-strong bg-surface-card px-3 py-2 text-sm text-ink-strong placeholder:text-ink-muted focus-visible:border-brand focus-visible:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-stage">Stage</Label>
              <select id="task-stage" value={stage} onChange={(e) => setStage(e.target.value as OnboardingStage)} className={selectClass}>
                <option value="discover">Discover</option>
                <option value="access">Access</option>
                <option value="learn">Learn</option>
                <option value="contribute">Contribute</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={selectClass}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-owner">Owner (optional)</Label>
              <Input
                id="task-owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Who can help?"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-source">Reference document (optional)</Label>
            <select id="task-source" value={sourceDoc} onChange={(e) => setSourceDoc(e.target.value)} className={selectClass}>
              <option value="">None</option>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!title.trim() || pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Assign task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
