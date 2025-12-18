import bcrypt from "bcrypt";

import { AppError } from "../../../middleware/errorHandler";
import { signAccessToken } from "../../../lib/jwt";
import type { LoginDto } from "../dtos/login.dto";
import type { RegisterDto } from "../dtos/register.dto";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(dto: RegisterDto) {
    const existing = await this.repo.findUserByEmail(dto.email);
    if (existing) throw new AppError("Email already in use", 400);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.repo.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const token = signAccessToken(user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) throw new AppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new AppError("Invalid credentials", 401);

    const token = signAccessToken(user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }
}
