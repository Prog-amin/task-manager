import { AppError } from "../../../middleware/errorHandler";
import type { UpdateProfileDto } from "../dtos/updateProfile.dto";
import { UserRepository } from "../repositories/user.repository";

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async me(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    return { id: user.id, email: user.email, name: user.name };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.repo.updateName(userId, dto.name);
    return { id: user.id, email: user.email, name: user.name };
  }

  async listUsers() {
    const users = await this.repo.listPublic();
    return users.map((u) => ({ id: u.id, email: u.email, name: u.name }));
  }
}
