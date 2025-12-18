import type { Response } from "express";

import { env } from "../config/env";

export function setAuthCookie(res: Response, token: string) {
  const secure = env.NODE_ENV === "production" ? true : env.COOKIE_SECURE;

  res.cookie(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "none",
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  const secure = env.NODE_ENV === "production" ? true : env.COOKIE_SECURE;

  res.clearCookie(env.AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: "none",
    path: "/",
  });
}
