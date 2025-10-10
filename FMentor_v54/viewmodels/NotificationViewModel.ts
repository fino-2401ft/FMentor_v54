import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { Notification } from "../models/Notification";

export const NotificationViewModel = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = NotificationRepository.listenToNotifications(currentUser.getUserId(), (newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;
    try {
      await NotificationRepository.markAsRead(notificationId, currentUser.getUserId());
    } catch (error: any) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  return { notifications, loading, markAsRead };
};