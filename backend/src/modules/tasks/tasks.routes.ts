import { Router } from "express";

import { requireAuth } from "../../middleware/requireAuth";
import * as controller from "./controllers/task.controller";

export const tasksRouter = Router();

tasksRouter.get("/dashboard", requireAuth, controller.dashboard);
tasksRouter.get("/", requireAuth, controller.list);
tasksRouter.get("/:id", requireAuth, controller.get);
tasksRouter.post("/", requireAuth, controller.validateCreateTask, controller.create);
tasksRouter.patch("/:id", requireAuth, controller.validateUpdateTask, controller.update);
tasksRouter.delete("/:id", requireAuth, controller.remove);
