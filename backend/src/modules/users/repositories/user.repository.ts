import { prisma } from "../../../lib/prisma";

export class UserRepository {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  listPublic() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  updateName(id: string, name: string) {
    return prisma.user.update({ where: { id }, data: { name } });
  }
}
