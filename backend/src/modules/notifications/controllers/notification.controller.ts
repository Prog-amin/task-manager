import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/requireAuth";
import { AppError } from "../../../middleware/errorHandler";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationService } from "../services/notification.service";

const service = new NotificationService(new NotificationRepository());

export async function listMyNotifications(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const notifications = await service.listForUser(userId);
  res.json({ notifications });
}

export async function markRead(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const id = req.params.id;
  if (!id) throw new AppError("Notification id is required", 400);
  const updated = await service.markRead(userId, id);
  res.json({ notification: updated });
}
