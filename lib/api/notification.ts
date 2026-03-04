import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface Notification {
  _id: string;
  userId: string;
  type:
    | "new_message"
    | "new_application"
    | "application_accepted"
    | "application_rejected"
    | "gig_update"
    | "verification_request"
    | "verification_approved"
    | "verification_rejected"
    | "system";
  title: string;
  content: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = async (token: string) => {
  const response = await axiosInstance.get(API.NOTIFICATION.GET_ALL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const markNotificationRead = async (token: string, id: string) => {
  const response = await axiosInstance.put(
    API.NOTIFICATION.MARK_READ(id),
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const markAllNotificationsRead = async (token: string) => {
  const response = await axiosInstance.put(
    API.NOTIFICATION.MARK_READ("all"),
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};
