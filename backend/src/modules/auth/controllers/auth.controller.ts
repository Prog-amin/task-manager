import type { Request, Response } from "express";

import { clearAuthCookie, setAuthCookie } from "../../../lib/cookies";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "../services/auth.service";

const service = new AuthService(new AuthRepository());

export async function register(req: Request, res: Response) {
  const result = await service.register(req.body);
  setAuthCookie(res, result.token);
  res.status(201).json({ user: result.user });
}

export async function login(req: Request, res: Response) {
  const result = await service.login(req.body);
  setAuthCookie(res, result.token);
  res.status(200).json({ user: result.user });
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(200).json({ ok: true });
}
