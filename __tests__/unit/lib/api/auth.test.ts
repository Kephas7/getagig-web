import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { forgotPassword, login, register, resetPassword } from "@/lib/api/auth";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockedPost = axios.post as jest.Mock;

describe("auth API helpers", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("register returns response data on success", async () => {
    const payload = {
      email: "artist@getagig.com",
      username: "artist_one",
      password: "secure123",
      confirmPassword: "secure123",
      role: "musician" as const,
    };

    const responseData = { success: true, message: "created" };
    mockedPost.mockResolvedValueOnce({ data: responseData });

    await expect(register(payload)).resolves.toEqual(responseData);
    expect(mockedPost).toHaveBeenCalledWith(API.AUTH.REGISTER, payload);
  });

  it("register prefers field-level validation error message", async () => {
    const payload = {
      email: "artist@getagig.com",
      username: "artist_one",
      password: "secure123",
      confirmPassword: "secure123",
      role: "musician" as const,
    };

    mockedPost.mockRejectedValueOnce({
      response: {
        data: {
          message: "Validation Error",
          errors: [{ message: "Email already exists" }],
        },
      },
      message: "Request failed",
    });

    await expect(register(payload)).rejects.toThrow("Email already exists");
  });

  it("login throws backend message when request fails", async () => {
    mockedPost.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
      message: "Request failed",
    });

    await expect(
      login({ email: "artist@getagig.com", password: "wrong123" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("forgotPassword posts to forgot endpoint", async () => {
    mockedPost.mockResolvedValueOnce({ data: { success: true } });

    await forgotPassword("artist@getagig.com");

    expect(mockedPost).toHaveBeenCalledWith(API.AUTH.FORGOT_PASSWORD, {
      email: "artist@getagig.com",
    });
  });

  it("resetPassword posts token and password", async () => {
    mockedPost.mockResolvedValueOnce({ data: { success: true } });

    await resetPassword("token-123", "secure123");

    expect(mockedPost).toHaveBeenCalledWith(
      API.AUTH.RESET_PASSWORD("token-123"),
      {
        password: "secure123",
      },
    );
  });
});
