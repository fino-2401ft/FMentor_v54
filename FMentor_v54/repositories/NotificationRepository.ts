import { ref, set, get, push, onValue, off, update } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Notification, NotificationType } from "../models/Notification";
import * as Notifications from "expo-notifications";

export class NotificationRepository {
  static async createNotification(userId: string, type: NotificationType, postId: string, commentId?: string): Promise<string> {
    try {
      const notificationId = push(ref(realtimeDB, `notifications/${userId}`)).key || `notification_${Date.now()}`;
      const notification = new Notification(notificationId, userId, type, postId, commentId);
      const notificationRef = ref(realtimeDB, `notifications/${userId}/${notificationId}`);
      await set(notificationRef, notification.toJSON());

      await Notifications.scheduleNotificationAsync({
        content: {
          title: type === NotificationType.Like ? "New Like" : "New Comment",
          body: type === NotificationType.Like ? "Someone liked your post!" : "Someone commented on your post!",
        },
        trigger: null,
      });

      return notificationId;
    } catch (error: any) {
      console.error("Error creating notification:", error.message);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const notificationRef = ref(realtimeDB, `notifications/${userId}/${notificationId}`);
      await update(notificationRef, { read: true });
    } catch (error: any) {
      console.error("Error marking notification as read:", error.message);
      throw error;
    }
  }

  static async getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    try {
      const notificationsRef = ref(realtimeDB, `notifications/${userId}`);
      const snapshot = await get(notificationsRef);
      if (!snapshot.exists()) return [];
      const notificationsData = snapshot.val();
      const notifications = Object.values(notificationsData)
        .map((data: any) => Notification.fromJSON(data))
        .sort((a, b) => b.getTimestamp() - a.getTimestamp())
        .slice(0, limit);
      return notifications as Notification[];
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
      throw error;
    }
  }

  static listenToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const notificationsRef = ref(realtimeDB, `notifications/${userId}`);
    const listener = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notifications = Object.values(notificationsData)
          .map((data: any) => Notification.fromJSON(data))
          .sort((a, b) => b.getTimestamp() - a.getTimestamp());
        callback(notifications as Notification[]);
      } else {
        callback([]);
      }
    });
    return () => off(notificationsRef, 'value', listener);
  }
}