"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordSchema } from "../schema";
import { resetPassword } from "@/lib/api/auth";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, form.password);
      router.push("/login?reset=success");
    } catch (err: any) {
      setError(err.message || "Reset failed");
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
        Reset Password
      </h1>

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-red-500 text-center mb-5 font-medium"
        >
          {error}
        </motion.p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl px-4 py-3.5
                bg-[var(--foreground)/5] border border-[var(--foreground)/5]
                focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)]/20
                placeholder:text-[var(--foreground)/30] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)/30] hover:text-[var(--foreground)] transition-colors p-1"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full rounded-xl px-4 py-3.5
                bg-[var(--foreground)/5] border border-[var(--foreground)/5]
                focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)]/20
                placeholder:text-[var(--foreground)/30] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)/30] hover:text-[var(--foreground)] transition-colors p-1"
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4
            bg-[var(--foreground)] text-[var(--background)]
            hover:opacity-95 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </motion.button>
      </form>
    </motion.div>
  );
}
