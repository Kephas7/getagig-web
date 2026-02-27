"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupSchema, RegisterData } from "../schema";
import { register } from "@/lib/api/auth";
import { setAuthToken, setUserData } from "@/lib/cookies";
import { Eye, EyeOff } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/toast";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "musician",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await register(payload as any);

      setAuthToken(res.data.token);
      setUserData(res.data.user);

      toast.success("Account created successfully!");
      router.push(`/${res.data.user.role}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-2xl p-8 glass-morphism shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
    >
      <h1 className="text-3xl font-bold text-center mb-10 tracking-tight">
        Create account
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

      {/* Role Chips */}
      <div className="flex gap-3 mb-8 p-1 bg-foreground/5 rounded-xl">
        {["musician", "organizer"].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setForm({ ...form, role: role as any })}
            className={`relative flex-1 py-2.5 rounded-lg text-sm font-bold transition-all z-10 ${
              form.role === role
                ? "text-primary-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {form.role === role && (
              <motion.div
                layoutId="role-active"
                className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative">
              {role === "musician" ? " Musician" : " Organizer"}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
            Name
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full rounded-xl px-4 py-3
              bg-foreground/5 border border-foreground/10
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
              placeholder:text-foreground/30 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
            Email 
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl px-4 py-3
              bg-foreground/5 border border-foreground/10
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
              placeholder:text-foreground/30 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="•••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl px-4 py-3
                  bg-foreground/5 border border-foreground/10
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                  placeholder:text-foreground/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--foreground)/30] hover:text-[var(--foreground)] p-1"
              >
                {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)/50] ml-1">
              Confirm
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="•••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full rounded-xl px-4 py-3
                  bg-foreground/5 border border-foreground/10
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                  placeholder:text-foreground/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--foreground)/30] hover:text-[var(--foreground)] p-1"
              >
                {showConfirmPassword ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm mt-4
            bg-primary text-primary-foreground
            hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </motion.button>
      </form>

      <p className="text-sm text-center mt-8 text-[var(--foreground)/60]">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-[var(--foreground)] font-bold hover:underline"
        >
          Login
        </a>
      </p>
    </motion.div>
  );
}
