import { Router } from "express";

import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import { updateProfileDto } from "./dtos/updateProfile.dto";
import * as controller from "./controllers/user.controller";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, controller.list);
usersRouter.get("/me", requireAuth, controller.me);
usersRouter.patch("/me", requireAuth, validateBody(updateProfileDto), controller.updateMe);
