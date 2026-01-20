"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema, LoginData } from "../schema";
import { login } from "@/lib/api/auth";
import { setAuthToken, setUserData } from "@/lib/cookies";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await login(form);

      setAuthToken(res.token);
      setUserData(res.data);

      router.push(`/dashboard/${res.data.role}`);
    } catch (err: any) {
      setError(err.message || "Login failed");
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
          Welcome back
        </h1>

        {error && (
          <p className="text-sm text-red-500 text-center mb-5">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg px-4 py-3
              bg-[var(--foreground)/5]
              focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]
              placeholder:text-[var(--foreground)/50]"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-[var(--foreground)/70]">
          Don’t have an account?{" "}
          <a href="/register" className="underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
