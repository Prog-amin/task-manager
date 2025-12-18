import { api } from "./api";
import type { Task, TaskPriority, TaskStatus } from "../types";

export async function createTask(input: {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId?: string;
}) {
  const { data } = await api.post<{ task: Task }>("/tasks", input);
  return data.task;
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId: string | null;
  }>,
) {
  const { data } = await api.patch<{ task: Task }>(`/tasks/${id}`, input);
  return data.task;
}

export async function deleteTask(id: string) {
  const { data } = await api.delete<{ ok: true }>(`/tasks/${id}`);
  return data.ok;
}

export async function dashboard() {
  const { data } = await api.get<{ assignedToMe: Task[]; createdByMe: Task[]; overdue: Task[] }>(
    "/tasks/dashboard",
  );
  return data;
}
