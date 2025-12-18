import { api } from "./api";
import type { Notification } from "../types";

export async function listNotifications() {
  const { data } = await api.get<{ notifications: Notification[] }>("/notifications");
  return data.notifications;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<{ notification: Notification }>(`/notifications/${id}/read`);
  return data.notification;
}
