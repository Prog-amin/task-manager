export type User = {
  id: string;
  email: string;
  name: string;
};

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  type: "TASK_ASSIGNED";
  message: string;
  readAt: string | null;
  createdAt: string;
  userId: string;
  taskId: string | null;
};
