import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/app/(auth)/schema";

describe("auth schemas", () => {
  it("accepts valid signup payload", () => {
    const result = signupSchema.safeParse({
      email: "artist@getagig.com",
      username: "artist_one",
      password: "secure123",
      confirmPassword: "secure123",
      role: "musician",
    });

    expect(result.success).toBe(true);
  });

  it("rejects signup payload when passwords do not match", () => {
    const result = signupSchema.safeParse({
      email: "artist@getagig.com",
      username: "artist_one",
      password: "secure123",
      confirmPassword: "secure124",
      role: "musician",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Passwords do not match");
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects invalid login email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secure123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short login password", () => {
    const result = loginSchema.safeParse({
      email: "artist@getagig.com",
      password: "123",
    });

    expect(result.success).toBe(false);
  });

  it("validates forgot password payload", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "artist@getagig.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects reset password payload when passwords differ", () => {
    const result = resetPasswordSchema.safeParse({
      password: "secure123",
      confirmPassword: "secure124",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Passwords do not match");
    }
  });
});
