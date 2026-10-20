/**
 * Domain types for Project Compass AI.
 * These mirror the planned Supabase schema (PLAN.md §7) so the mock data layer
 * can be swapped for real Supabase queries without changing component code.
 */

export type ProjectRole = "member" | "manager" | "admin";

export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked";
export type TaskPriority = "high" | "medium" | "low";
/** Self-rated confidence a user records when reflecting on a completed task. */
export type TaskConfidence = "high" | "medium" | "low";

/** Onboarding stages used for the Week-1 journey grouping. */
export type OnboardingStage = "discover" | "access" | "learn" | "contribute";

export type DocumentType =
  | "pdf"
  | "docx"
  | "pptx"
  | "txt"
  | "md"
  | "csv"
  | "json";

export type IndexStatus = "not_indexed" | "queued" | "indexing" | "indexed" | "failed";

export type ProjectUpdateCategory =
  | "blocker"
  | "risk"
  | "milestone"
  | "demo"
  | "decision";

export interface Profile {
  userId: string;
  fullName: string;
  jobTitle: string;
  avatarUrl?: string | null;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: "active" | "mobilising" | "closing";
  startDate: string;
}

export interface Membership {
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface OnboardingTask {
  id: string;
  projectId: string;
  assigneeId: string;
  title: string;
  description: string;
  stage: OnboardingStage;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  ownerName: string | null;
  /** Reference to the source document that motivates the task, when any. */
  sourceDocumentId: string | null;
  /** Free-text note the user leaves on completing the task (Stage A: in-memory). */
  reflectionComment?: string | null;
  /** How confident the user felt after completing the task. */
  reflectionConfidence?: TaskConfidence | null;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: DocumentType;
  /** Storage path placeholder; wired to Supabase Storage in a later stage. */
  storagePath: string;
  ownerName: string;
  updatedAt: string;
  version: number;
  isCurrent: boolean;
  visibility: "project" | "restricted";
  indexStatus: IndexStatus;
  sizeBytes: number;
  topic: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  category: ProjectUpdateCategory;
  summary: string;
  asOfDate: string | null;
  sourceDocumentId: string | null;
  /** When false, surfaced in the UI as "not verified". */
  verified: boolean;
}

export interface TeamContact {
  id: string;
  projectId: string;
  name: string;
  role: string;
  responsibility: string;
  email?: string | null;
  verifiedAt: string | null;
  sourceDocumentId: string | null;
}

/**
 * A member of the delivery team, as recorded in the Team Org Chart.
 * Faithful to the formal role, workstream and reporting line in that document.
 */
export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  /** Formal workstream, e.g. "Conversational AI", "Data & Integration". */
  workstream: string;
  /** Formal reporting line; null for the top of the on-project tree. */
  reportsTo: string | null;
  email?: string | null;
  /** Short grounded responsibility or current focus, where documented. */
  note?: string | null;
  /** True for a workstream lead (or the engagement's leadership). */
  isLead: boolean;
  /** True where the org chart flags the person as on leave. */
  onLeave?: boolean;
  /** Reflects the org chart's "last updated" date. */
  verifiedAt: string | null;
  sourceDocumentId: string | null;
}

export interface KpiSummary {
  tasksCompleted: number;
  tasksTotal: number;
  pendingActions: number;
  docsReviewed: number;
  docsRecommended: number;
  nextMilestone: { label: string; date: string | null } | null;
  progressPct: number;
  daysSinceJoining: number;
}
