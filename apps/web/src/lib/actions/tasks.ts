"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getActiveProjectId } from "@/lib/auth/session";
import { updateTaskStatus } from "@/lib/data";
import type { TaskStatus } from "@/types";

export type TaskActionResult =
  | { ok: true; status: TaskStatus }
  | { ok: false; error: string };

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
