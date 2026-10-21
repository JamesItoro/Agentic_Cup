"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getActiveProjectId } from "@/lib/auth/session";
import { createOnboardingTask, updateTaskReflection, updateTaskStatus } from "@/lib/data";
import type { OnboardingStage, TaskConfidence, TaskPriority, TaskStatus } from "@/types";

export type TaskActionResult =
  | { ok: true; status: TaskStatus }
  | { ok: false; error: string };

export type ReflectionActionResult = { ok: true } | { ok: false; error: string };

export type CreateTaskResult = { ok: true } | { ok: false; error: string };

/**
 * Update an onboarding task's status. Authorises server-side: the user must be
 * signed in and a member of the active project, and the task must be theirs.
 */
export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<TaskActionResult> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return { ok: false, error: "Not signed in." };

  const projectId = await getActiveProjectId(userId);
  if (!projectId) return { ok: false, error: "No active project." };

  const updated = await updateTaskStatus(userId, projectId, taskId, status);
  if (!updated) return { ok: false, error: "You can't update that task." };

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true, status: updated.status };
}

/**
 * Save a completion reflection (comment + confidence rating) for a task.
 * Authorises server-side the same way as a status change.
 */
export async function saveTaskReflectionAction(
  taskId: string,
  comment: string,
  confidence: TaskConfidence | null,
): Promise<ReflectionActionResult> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return { ok: false, error: "Not signed in." };

  const projectId = await getActiveProjectId(userId);
  if (!projectId) return { ok: false, error: "No active project." };

  const updated = await updateTaskReflection(userId, projectId, taskId, comment, confidence);
  if (!updated) return { ok: false, error: "You can't update that task." };

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true };
}

export interface CreateTaskInput {
  assigneeId: string;
  title: string;
  description: string;
  stage: OnboardingStage;
  priority: TaskPriority;
  /** ISO date, or null for no due date. */
  dueAt: string | null;
  ownerName: string | null;
  sourceDocumentId: string | null;
}

/**
 * Create an onboarding task for a new joiner. Authorises server-side: the caller
 * must be signed in and a manager/admin of the active project, and the assignee
 * must be a member of it (enforced in the data layer, never trusted from the UI).
 */
export async function createOnboardingTaskAction(
  input: CreateTaskInput,
): Promise<CreateTaskResult> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return { ok: false, error: "Not signed in." };

  const projectId = await getActiveProjectId(userId);
  if (!projectId) return { ok: false, error: "No active project." };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "A task title is required." };

  const created = await createOnboardingTask(userId, projectId, {
    assigneeId: input.assigneeId,
    title,
    description: input.description.trim(),
    stage: input.stage,
    priority: input.priority,
    dueAt: input.dueAt,
    ownerName: input.ownerName?.trim() || null,
    sourceDocumentId: input.sourceDocumentId,
  });
  if (!created) return { ok: false, error: "You can't assign tasks on this project." };

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { ok: true };
}
