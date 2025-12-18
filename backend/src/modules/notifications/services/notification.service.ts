import { NotificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  listForUser(userId: string) {
    return this.repo.listForUser(userId);
  }

  markRead(userId: string, notificationId: string) {
    return this.repo.markRead(userId, notificationId);
  }
}
