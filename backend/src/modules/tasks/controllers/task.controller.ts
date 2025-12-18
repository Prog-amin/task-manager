import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/requireAuth";
import { validateBody } from "../../../middleware/validate";
import { AppError } from "../../../middleware/errorHandler";
import { NotificationRepository } from "../../notifications/repositories/notification.repository";
import { TaskRepository } from "../repositories/task.repository";
import { TaskService } from "../services/task.service";
import { createTaskDto, listTasksQueryDto, updateTaskDto } from "../dtos/task.dto";

const service = new TaskService(new TaskRepository(), new NotificationRepository());

export const validateCreateTask = validateBody(createTaskDto);
export const validateUpdateTask = validateBody(updateTaskDto);

export async function list(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const parsed = listTasksQueryDto.safeParse(req.query);
  if (!parsed.success) throw new AppError("Invalid query", 400, parsed.error.flatten());

  const tasks = await service.list(userId, parsed.data);
  res.json({ tasks });
}

export async function dashboard(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const data = await service.dashboard(userId);
  res.json(data);
}

export async function get(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const id = req.params.id;
  if (!id) throw new AppError("Task id is required", 400);
  const task = await service.get(userId, id);
  res.json({ task });
}

export async function create(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const task = await service.create(userId, req.body);
  res.status(201).json({ task });
}

export async function update(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const id = req.params.id;
  if (!id) throw new AppError("Task id is required", 400);
  const task = await service.update(userId, id, req.body);
  res.json({ task });
}

export async function remove(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const id = req.params.id;
  if (!id) throw new AppError("Task id is required", 400);
  const result = await service.remove(userId, id);
  res.json(result);
}
