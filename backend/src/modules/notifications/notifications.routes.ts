import { Router } from "express";

import { requireAuth } from "../../middleware/requireAuth";
import * as controller from "./controllers/notification.controller";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, controller.listMyNotifications);
notificationsRouter.patch("/:id/read", requireAuth, controller.markRead);
