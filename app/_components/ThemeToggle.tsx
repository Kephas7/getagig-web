"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      // Default: prefer system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (!mounted) return <div className="w-14 h-7 rounded-full bg-border" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggle}
      className={`relative flex items-center w-14 h-7 rounded-full border border-foreground/10 transition-colors duration-300 ${
        isDark ? "bg-foreground/5" : "bg-foreground/5"
      }`}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 text-foreground/40">
        <Sun size={12} />
      </span>
      <span className="absolute right-1.5 text-foreground/40">
        <Moon size={12} />
      </span>

      {/* Sliding pill */}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`absolute w-5 h-5 rounded-full shadow-lg flex items-center justify-center z-10 ${
          isDark ? "bg-foreground right-1" : "bg-foreground left-1"
        }`}
      >
        {isDark ? (
          <Moon size={11} className="text-background" />
        ) : (
          <Sun size={11} className="text-background" />
        )}
      </motion.span>
    </button>
  );
}