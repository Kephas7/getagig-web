"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema, LoginData } from "../schema";
import { login } from "@/lib/api/auth";
import { setAuthToken, setUserData } from "@/lib/cookies";
import { useAuth } from "@/app/context/AuthContext";

import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/lib/toast";

export default function LoginForm() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [form, setForm] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      // Normalize: backend returns { id } but frontend expects { _id }
      const userData = { ...res.data.user, _id: res.data.user._id || res.data.user.id };
      setAuthToken(res.data.token);
      setUserData(userData);
      // Re-sync AuthContext so headers show user info immediately (no refresh needed)
      await checkAuth();

      toast.success(`Welcome back, ${res.data.user.username}!`);
      router.push(`/${res.data.user.role}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-2xl p-8 glass-morphism shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
    >
      <h1 className="text-3xl font-bold text-center mb-10 tracking-tight">
        Welcome back
      </h1>

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-error text-center mb-5 font-medium"
        >
          {error}
        </motion.p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
            Email 
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl px-4 py-3.5
              bg-foreground/5 border border-foreground/10
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
              placeholder:text-foreground/30 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl px-4 py-3.5
                bg-foreground/5 border border-foreground/10
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                placeholder:text-foreground/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)/30] hover:text-[var(--foreground)] transition-colors p-1"
            >
              {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-[-10px]">
          <a
            href="/forgot-password"
            className="text-xs text-[var(--foreground)/60] hover:text-[var(--foreground)] hover:underline transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm
            bg-primary text-primary-foreground
            hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>
      </form>

      <p className="text-sm text-center mt-8 text-[var(--foreground)/60]">
        Don’t have an account?{" "}
        <a
          href="/register"
          className="text-[var(--foreground)] font-bold hover:underline"
        >
          Sign up
        </a>
      </p>
    </motion.div>
  );
}
