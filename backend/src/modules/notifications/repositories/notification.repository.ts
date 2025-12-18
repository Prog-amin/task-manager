import { prisma } from "../../../lib/prisma";

export class NotificationRepository {
  create(data: { userId: string; taskId?: string; type: "TASK_ASSIGNED"; message: string }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        taskId: data.taskId ?? null,
        type: data.type,
        message: data.message,
      },
    });
  }

  listForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  markRead(userId: string, notificationId: string) {
    return prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })
      .then((notification) => {
        if (!notification) {
          throw new Error(`Notification not found for user ${userId}`);
        }
        return prisma.notification.update({
          where: { id: notificationId },
          data: { readAt: new Date() },
        });
      });
  }
}
