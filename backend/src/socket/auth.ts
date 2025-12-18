import type { Socket } from "socket.io";
import cookie from "cookie";

import { env } from "../config/env";
import { verifyAccessToken } from "../lib/jwt";

export type AuthedSocket = Socket & { data: { userId: string } };

export function authenticateSocket(socket: Socket) {
  const raw = socket.handshake.headers.cookie;
  if (!raw) throw new Error("Unauthorized");

  const parsed = cookie.parse(raw);
  const token = parsed[env.AUTH_COOKIE_NAME];
  if (!token) throw new Error("Unauthorized");

  const payload = verifyAccessToken(token);
  (socket as AuthedSocket).data.userId = payload.sub;
}

export function userRoom(userId: string) {
  return `user:${userId}`;
}
