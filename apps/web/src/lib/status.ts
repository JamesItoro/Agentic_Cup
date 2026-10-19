import type { BadgeProps } from "@/components/ui/badge";
import type { IndexStatus, TaskPriority, TaskStatus } from "@/types";

type Variant = NonNullable<BadgeProps["variant"]>;

export const taskStatusMeta: Record<TaskStatus, { label: string; variant: Variant }> = {
  todo: { label: "To do", variant: "neutral" },
  in_progress: { label: "In progress", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  blocked: { label: "Blocked", variant: "danger" },
};

export const priorityMeta: Record<TaskPriority, { label: string; variant: Variant }> = {
  high: { label: "High", variant: "danger" },
  medium: { label: "Medium", variant: "warning" },
  low: { label: "Low", variant: "neutral" },
};

export const indexStatusMeta: Record<IndexStatus, { label: string; variant: Variant }> = {
  not_indexed: { label: "Not indexed", variant: "neutral" },
  queued: { label: "Queued", variant: "info" },
  indexing: { label: "Indexing", variant: "info" },
  indexed: { label: "Indexed", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
};

export const stageMeta: Record<string, { label: string; blurb: string }> = {
  discover: { label: "Discover", blurb: "Understand the engagement" },
  access: { label: "Access", blurb: "Get the keys you need" },
  learn: { label: "Learn", blurb: "Build working knowledge" },
  contribute: { label: "Contribute", blurb: "Make your first impact" },
};
