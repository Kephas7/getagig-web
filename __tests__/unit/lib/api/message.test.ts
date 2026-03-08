import axios from "@/lib/api/axios";
import {
  clearConversation,
  deleteConversation,
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} from "@/lib/api/message";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = axios.get as jest.Mock;
const mockedPost = axios.post as jest.Mock;
const mockedDelete = axios.delete as jest.Mock;

describe("message API helpers", () => {
  const token = "token-123";

  beforeEach(() => {
    mockedGet.mockReset();
    mockedPost.mockReset();
    mockedDelete.mockReset();
  });

  it("fetches conversations", async () => {
    const responseData = { success: true, data: [] };
    mockedGet.mockResolvedValueOnce({ data: responseData });

    await expect(getConversations(token)).resolves.toEqual(responseData);
    expect(mockedGet).toHaveBeenCalledWith("/api/messages/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it("fetches messages for a conversation", async () => {
    const responseData = { success: true, data: { messages: [] } };
    mockedGet.mockResolvedValueOnce({ data: responseData });

    await expect(getMessages(token, "conv-1")).resolves.toEqual(responseData);
    expect(mockedGet).toHaveBeenCalledWith(
      "/api/messages/conversations/conv-1",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  });

  it("starts a conversation", async () => {
    const responseData = { success: true, data: { _id: "conv-1" } };
    mockedPost.mockResolvedValueOnce({ data: responseData });

    await expect(startConversation(token, "user-2")).resolves.toEqual(
      responseData,
    );
    expect(mockedPost).toHaveBeenCalledWith(
      "/api/messages/conversations/start",
      { recipientId: "user-2" },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  });

  it("sends a message", async () => {
    const payload = { conversationId: "conv-1", content: "hello" };
    const responseData = { success: true, data: { _id: "msg-1" } };
    mockedPost.mockResolvedValueOnce({ data: responseData });

    await expect(sendMessage(token, payload)).resolves.toEqual(responseData);
    expect(mockedPost).toHaveBeenCalledWith("/api/messages/send", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  it("clears a conversation", async () => {
    const responseData = {
      success: true,
      message: "Conversation cleared successfully",
    };
    mockedDelete.mockResolvedValueOnce({ data: responseData });

    await expect(clearConversation(token, "conv-1")).resolves.toEqual(
      responseData,
    );
    expect(mockedDelete).toHaveBeenCalledWith(
      "/api/messages/conversations/conv-1/messages",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  });

  it("deletes a conversation", async () => {
    const responseData = {
      success: true,
      message: "Conversation deleted successfully",
    };
    mockedDelete.mockResolvedValueOnce({ data: responseData });

    await expect(deleteConversation(token, "conv-1")).resolves.toEqual(
      responseData,
    );
    expect(mockedDelete).toHaveBeenCalledWith(
      "/api/messages/conversations/conv-1",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  });
});
