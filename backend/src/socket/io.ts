import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { env } from "../config/env";

let io: Server | null = null;

export function initIo(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
  });

  return io;
}

export function getIo() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
