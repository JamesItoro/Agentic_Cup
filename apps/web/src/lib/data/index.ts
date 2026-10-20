import "server-only";
import {
  documents,
  memberships,
  onboardingTasks,
  profiles,
  projectUpdates,
  projects,
  teamContacts,
  teamRoster,
} from "./dataset";
import type {
  Document,
  KpiSummary,
  Membership,
  OnboardingTask,
  Profile,
  Project,
  ProjectUpdate,
  TaskConfidence,
  TaskStatus,
  TeamContact,
  TeamMember,
} from "@/types";

/**
 * Async mock data layer. Every project-scoped accessor requires the requesting
 * userId and verifies membership before returning anything, a non-member gets
 * empty results, never another project's rows. This mirrors the RLS behaviour
 * Supabase will enforce later, so component code stays identical.
 */

/** Mock data resolves immediately. (Kept as a seam for a real async source.) */
const latency = () => Promise.resolve();

/** In-memory task-status overrides, persists task completion for the life of
 * the dev server process (resets on restart, which is fine for the mock stage). */
const taskStatusOverrides = new Map<string, TaskStatus>();

/** In-memory completion reflections (comment + confidence), same lifetime. */
interface Reflection {
  comment: string | null;
  confidence: TaskConfidence | null;
}
const taskReflectionOverrides = new Map<string, Reflection>();

async function isMember(userId: string, projectId: string): Promise<boolean> {
  return memberships.some((m) => m.userId === userId && m.projectId === projectId);
}

export async function getMembershipsForUser(userId: string): Promise<Membership[]> {
  return memberships.filter((m) => m.userId === userId);
}

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  await latency();
  const ids = new Set(memberships.filter((m) => m.userId === userId).map((m) => m.projectId));
  return projects.filter((p) => ids.has(p.id));
}

export async function getProject(userId: string, projectId: string): Promise<Project | null> {
  if (!(await isMember(userId, projectId))) return null;
  return projects.find((p) => p.id === projectId) ?? null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  return profiles.find((p) => p.userId === userId) ?? null;
}

function applyOverride(t: OnboardingTask): OnboardingTask {
  const status = taskStatusOverrides.get(t.id);
  const reflection = taskReflectionOverrides.get(t.id);
  let out = status ? { ...t, status } : t;
  if (reflection) {
    out = {
      ...out,
      reflectionComment: reflection.comment,
      reflectionConfidence: reflection.confidence,
    };
  }
  return out;
}

export async function getTasks(userId: string, projectId: string): Promise<OnboardingTask[]> {
  await latency();
  if (!(await isMember(userId, projectId))) return [];
  return onboardingTasks
    .filter((t) => t.projectId === projectId && t.assigneeId === userId)
    .map(applyOverride);
}

/**
 * Update a task's status. Returns the updated task, or null if the user is not a
 * member or the task is not theirs (authorisation happens server-side, not in
 * the browser).
 */
export async function updateTaskStatus(
  userId: string,
  projectId: string,
  taskId: string,
  status: TaskStatus,
): Promise<OnboardingTask | null> {
  await latency();
  if (!(await isMember(userId, projectId))) return null;
  const task = onboardingTasks.find(
    (t) => t.id === taskId && t.projectId === projectId && t.assigneeId === userId,
  );
  if (!task) return null;
  taskStatusOverrides.set(taskId, status);
  return applyOverride(task);
}

/**
 * Save a completion reflection (comment + confidence) for a task. Authorises the
 * same way as a status update: member of the project and owner of the task.
 */
export async function updateTaskReflection(
  userId: string,
  projectId: string,
  taskId: string,
  comment: string | null,
  confidence: TaskConfidence | null,
): Promise<OnboardingTask | null> {
  await latency();
  if (!(await isMember(userId, projectId))) return null;
  const task = onboardingTasks.find(
    (t) => t.id === taskId && t.projectId === projectId && t.assigneeId === userId,
  );
  if (!task) return null;
  taskReflectionOverrides.set(taskId, { comment: comment?.trim() || null, confidence });
  return applyOverride(task);
}

export async function getDocuments(userId: string, projectId: string): Promise<Document[]> {
  await latency();
  if (!(await isMember(userId, projectId))) return [];
  return documents
    .filter((d) => d.projectId === projectId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDocument(
  userId: string,
  projectId: string,
  docId: string,
): Promise<Document | null> {
  if (!(await isMember(userId, projectId))) return null;
  return documents.find((d) => d.id === docId && d.projectId === projectId) ?? null;
}

export async function getTeamContacts(userId: string, projectId: string): Promise<TeamContact[]> {
  await latency();
  if (!(await isMember(userId, projectId))) return [];
  return teamContacts.filter((t) => t.projectId === projectId);
}

/** The full delivery-team roster from the Team Org Chart. Members-only data. */
export async function getTeamRoster(userId: string, projectId: string): Promise<TeamMember[]> {
  await latency();
  if (!(await isMember(userId, projectId))) return [];
  return teamRoster.filter((m) => m.projectId === projectId);
}

export async function getProjectUpdates(userId: string, projectId: string): Promise<ProjectUpdate[]> {
  await latency();
  if (!(await isMember(userId, projectId))) return [];
  return projectUpdates.filter((u) => u.projectId === projectId);
}

export interface ProjectMember {
  profile: Profile;
  role: Membership["role"];
  joinedAt: string;
}

/** Members of a project with their profile and role. Members-only data. */
export async function getProjectMembers(userId: string, projectId: string): Promise<ProjectMember[]> {
  await latency();
  if (!(await isMember(userId, projectId))) return [];
  return memberships
    .filter((m) => m.projectId === projectId)
    .map((m) => ({
      profile: profiles.find((p) => p.userId === m.userId)!,
      role: m.role,
      joinedAt: m.joinedAt,
    }))
    .filter((m) => m.profile);
}

/** Compute dashboard KPIs from the user's actual task/document records. */
export async function getKpiSummary(userId: string, projectId: string): Promise<KpiSummary | null> {
  if (!(await isMember(userId, projectId))) return null;
  const tasks = await getTasks(userId, projectId);
  const docs = await getDocuments(userId, projectId);
  const updates = await getProjectUpdates(userId, projectId);

  const tasksTotal = tasks.length;
  const tasksCompleted = tasks.filter((t) => t.status === "completed").length;
  const pendingActions = tasks.filter(
    (t) => t.status === "todo" || t.status === "in_progress" || t.status === "blocked",
  ).length;
  // "Docs reviewed" proxied by completed tasks that reference a document.
  const reviewedDocIds = new Set(
    tasks.filter((t) => t.status === "completed" && t.sourceDocumentId).map((t) => t.sourceDocumentId),
  );

  const membership = memberships.find((m) => m.userId === userId && m.projectId === projectId);
  const daysSinceJoining = membership
    ? Math.max(0, Math.round((Date.now() - new Date(membership.joinedAt).getTime()) / 86_400_000))
    : 0;

  const demo = updates.find((u) => u.category === "demo");
  const nextMilestone = demo
    ? { label: "CTO demo", date: demo.asOfDate }
    : { label: "No scheduled milestone", date: null };

  return {
    tasksCompleted,
    tasksTotal,
    pendingActions,
    docsReviewed: reviewedDocIds.size,
    docsRecommended: docs.length,
    nextMilestone,
    progressPct: tasksTotal === 0 ? 0 : Math.round((tasksCompleted / tasksTotal) * 100),
    daysSinceJoining,
  };
}
