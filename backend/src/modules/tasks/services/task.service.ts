import type { TaskPriority, TaskStatus } from "../../../generated/prisma";

import { AppError } from "../../../middleware/errorHandler";
import { getIo } from "../../../socket/io";
import { userRoom } from "../../../socket/auth";
import { prisma } from "../../../lib/prisma";
import { NotificationRepository } from "../../notifications/repositories/notification.repository";
import type { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from "../dtos/task.dto";
import { TaskRepository } from "../repositories/task.repository";

export class TaskService {
  constructor(
    private readonly repo: TaskRepository,
    private readonly notifications: NotificationRepository,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    if (dto.assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: dto.assignedToId } });
      if (!assignee) throw new AppError("Assignee not found", 400);
    }

    const task = await this.repo.create({
      title: dto.title,
      description: dto.description,
      dueDate: new Date(dto.dueDate),
      priority: dto.priority as TaskPriority,
      status: dto.status as TaskStatus,
      creatorId: userId,
      assignedToId: dto.assignedToId ?? null,
    });

    if (task.assignedToId) {
      const notification = await this.notifications.create({
        userId: task.assignedToId,
        taskId: task.id,
        type: "TASK_ASSIGNED",
        message: `You have been assigned: ${task.title}`,
      });

      getIo().to(userRoom(task.assignedToId)).emit("notification", notification);
    }

    getIo().emit("task:created", task);

    return task;
  }

  list(userId: string, query: ListTasksQueryDto) {
    return this.repo.listVisible({
      userId,
      ...(query.status ? { status: query.status as TaskStatus } : {}),
      ...(query.priority ? { priority: query.priority as TaskPriority } : {}),
      ...(query.sortDueDate ? { sortDueDate: query.sortDueDate } : {}),
    });
  }

  async get(userId: string, taskId: string) {
    const task = await this.repo.findVisibleById(taskId, userId);
    if (!task) throw new AppError("Task not found", 404);
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.repo.findVisibleById(taskId, userId);
    if (!existing) throw new AppError("Task not found", 404);

    const isCreator = existing.creatorId === userId;
    const isAssignee = existing.assignedToId === userId;

    if (!isCreator && !isAssignee) throw new AppError("Forbidden", 403);

    if (!isCreator && dto.assignedToId !== undefined) {
      throw new AppError("Only the creator can change assignee", 403);
    }

    if (isCreator && dto.assignedToId !== undefined && dto.assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: dto.assignedToId } });
      if (!assignee) throw new AppError("Assignee not found", 400);
    }

    const data: Parameters<TaskRepository["update"]>[1] = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueDate !== undefined) data.dueDate = new Date(dto.dueDate);
    if (dto.priority !== undefined) data.priority = dto.priority as TaskPriority;
    if (dto.status !== undefined) data.status = dto.status as TaskStatus;
    if (dto.assignedToId !== undefined) data.assignedToId = dto.assignedToId;

    const updated = await this.repo.update(taskId, data);

    if (isCreator && dto.assignedToId !== undefined && dto.assignedToId !== existing.assignedToId) {
      if (dto.assignedToId) {
        const notification = await this.notifications.create({
          userId: dto.assignedToId,
          taskId: updated.id,
          type: "TASK_ASSIGNED",
          message: `You have been assigned: ${updated.title}`,
        });

        getIo().to(userRoom(dto.assignedToId)).emit("notification", notification);
      }
    }

    getIo().emit("task:updated", updated);

    return updated;
  }

  async remove(userId: string, taskId: string) {
    const existing = await this.repo.findVisibleById(taskId, userId);
    if (!existing) throw new AppError("Task not found", 404);

    if (existing.creatorId !== userId) throw new AppError("Only creator can delete", 403);

    await this.repo.delete(taskId);
    getIo().emit("task:deleted", { id: taskId });

    return { ok: true };
  }

  dashboard(userId: string) {
    return this.repo.dashboard(userId);
  }
}
