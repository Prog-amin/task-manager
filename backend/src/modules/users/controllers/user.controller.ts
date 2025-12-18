import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/requireAuth";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";

const service = new UserService(new UserRepository());

export async function me(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await service.me(userId);
  res.json({ user });
}

export async function updateMe(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await service.updateMe(userId, req.body);
  res.json({ user });
}

export async function list(req: Request, res: Response) {
  const _userId = (req as AuthenticatedRequest).userId;
  const users = await service.listUsers();
  res.json({ users });
}
