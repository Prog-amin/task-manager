import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { verifyAccessToken } from "../lib/jwt";
import { AppError } from "./errorHandler";

export type AuthenticatedRequest = Request & { userId: string };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.AUTH_COOKIE_NAME];
  if (!token) return next(new AppError("Unauthorized", 401));

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).userId = payload.sub;
    return next();
  } catch {
    return next(new AppError("Unauthorized", 401));
  }
}
