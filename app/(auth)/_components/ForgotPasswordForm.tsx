"use client";

import { useState } from "react";
import { forgotPasswordSchema } from "../schema";
import { forgotPassword } from "@/lib/api/auth";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-2xl p-8 glass-morphism shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
    >
      <h1 className="text-3xl font-bold text-center mb-10 tracking-tight">
        Forgot Password
          <p className="text-center text-sm text-[var(--foreground)/60] mb-8">
        Enter your email and we'll send you a reset link.
      </p>
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

      {success && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-green-500 text-center mb-5 font-medium"
        >
          {success}
        </motion.p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
            Email 
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-3.5
              bg-[var(--foreground)/5] border border-[var(--foreground)/5]
              focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)]/20
              placeholder:text-[var(--foreground)/30] transition-all"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm
            bg-[var(--foreground)] text-[var(--background)]
            hover:opacity-95 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </motion.button>
      </form>

      <p className="text-sm text-center mt-8 text-[var(--foreground)/60]">
        Remember your password?{" "}
        <a
          href="/login"
          className="text-[var(--foreground)] font-bold hover:underline"
        >
          Back to login
        </a>
      </p>
    </motion.div>
  );
}
