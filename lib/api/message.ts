import axiosInstance from "./axios";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: string;
  updatedAt: string;
}

export const getConversations = async (token: string) => {
  const response = await axiosInstance.get("/api/messages/conversations", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMessages = async (token: string, conversationId: string) => {
  const response = await axiosInstance.get(
    `/api/messages/conversations/${conversationId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const startConversation = async (token: string, recipientId: string) => {
  const response = await axiosInstance.post(
    "/api/messages/conversations/start",
    { recipientId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const sendMessage = async (
  token: string,
  data: { receiverId?: string; content: string; conversationId?: string },
) => {
  const response = await axiosInstance.post("/api/messages/send", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const clearConversation = async (
  token: string,
  conversationId: string,
) => {
  const response = await axiosInstance.delete(
    `/api/messages/conversations/${conversationId}/messages`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const deleteConversation = async (
  token: string,
  conversationId: string,
) => {
  const response = await axiosInstance.delete(
    `/api/messages/conversations/${conversationId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};
