"use client";

import { useState } from "react";
import { forgotPasswordSchema, ForgotPasswordData } from "../schema";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess("If the email is registered, a reset link has been sent.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl p-8
        bg-[var(--background)/60] backdrop-blur-xl
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]"
      >
        <h1 className="text-3xl font-semibold text-center mb-8">
          Forgot Password
        </h1>

        <p className="text-sm text-center mb-6 text-[var(--foreground)/70]">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <p className="text-sm text-red-500 text-center mb-5">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-500 text-center mb-5">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg px-4 py-3
              bg-[var(--foreground)/5]
              focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]
              placeholder:text-[var(--foreground)/50]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold
              bg-[var(--foreground)] text-[var(--background)]
              hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-[var(--foreground)/70]">
          Remember your password?{" "}
          <a href="/login" className="underline font-medium">
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
