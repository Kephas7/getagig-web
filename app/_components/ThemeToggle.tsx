"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

type Theme = "light" | "dark";
const THEME_CHANGED_EVENT = "getagig-theme-change";

const isTheme = (value: string | null): value is Theme =>
  value === "light" || value === "dark";

const resolveTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const rootTheme = document.documentElement.getAttribute("data-theme");
  if (isTheme(rootTheme)) return rootTheme;

  const stored = localStorage.getItem("theme");
  if (isTheme(stored)) return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (nextTheme: Theme) => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const rootTheme = root.getAttribute("data-theme");
  const storedTheme = localStorage.getItem("theme");

  if (rootTheme === nextTheme && storedTheme === nextTheme) {
    return;
  }

  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGED_EVENT, { detail: { theme: nextTheme } }),
  );
};

const subscribeTheme = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};

  const handleThemeChanged = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === "theme") onStoreChange();
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === "data-theme") {
        onStoreChange();
        break;
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener(THEME_CHANGED_EVENT, handleThemeChanged);
  window.addEventListener("storage", handleStorage);

  return () => {
    observer.disconnect();
    window.removeEventListener(THEME_CHANGED_EVENT, handleThemeChanged);
    window.removeEventListener("storage", handleStorage);
  };
};

const getThemeSnapshot = (): Theme => resolveTheme();
const getThemeServerSnapshot = (): Theme => "light";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const toggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  };

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