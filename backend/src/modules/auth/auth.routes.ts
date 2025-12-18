import { Router } from "express";

import { validateBody } from "../../middleware/validate";
import { loginDto } from "./dtos/login.dto";
import { registerDto } from "./dtos/register.dto";
import * as controller from "./controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerDto), controller.register);
authRouter.post("/login", validateBody(loginDto), controller.login);
authRouter.post("/logout", controller.logout);
