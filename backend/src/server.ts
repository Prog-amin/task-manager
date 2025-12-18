import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initIo } from "./socket/io";
import { authenticateSocket, userRoom } from "./socket/auth";

const app = createApp();
const httpServer = createServer(app);

const io = initIo(httpServer);

io.on("connection", (socket) => {
  try {
    authenticateSocket(socket);
    const userId = (socket as any).data.userId as string;
    socket.join(userRoom(userId));
    socket.emit("connected", { socketId: socket.id, userId });
  } catch {
    socket.disconnect(true);
  }
});

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on :${env.PORT}`);
});
