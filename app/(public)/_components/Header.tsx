"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, User, LogOut, Menu, X, Info } from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";
import ThemeLogo from "@/app/_components/ThemeLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

type NavLink = {
  href: string;
  label: string;
  icon: any;
};

const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: Info },
  { href: "/musician/gigs", label: "Browse Gigs", icon: Search },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout: contextLogout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href) ?? false;
  };

  const logout = () => {
    contextLogout();
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-2 bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className={`${
                scrolled
                  ? "h-[4.2rem] w-[12.1rem] sm:w-[13.4rem] md:w-[14.8rem]"
                  : "h-[4.9rem] w-[13.6rem] sm:w-[15.2rem] md:w-[16.8rem]"
              } flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105`}
            >
              <ThemeLogo
                width={760}
                height={320}
                className={`h-full w-full object-contain object-center origin-center transition-transform ${
                  scrolled ? "scale-[1.45]" : "scale-[1.7]"
                }`}
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {PUBLIC_LINKS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "text-foreground bg-foreground/8"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="public-pill"
                      className="absolute inset-0 rounded-lg ring-1 ring-primary/30 bg-primary/8"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 28,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors px-2"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href={
                    user.role === "musician"
                      ? "/musician"
                      : user.role === "organizer"
                        ? "/organizer"
                        : "/admin"
                  }
                  className="text-sm font-semibold text-primary hover:underline px-2"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-foreground/60" />
                  <span className="text-sm font-medium text-foreground/60 capitalize">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-foreground/60 hover:text-error transition-colors px-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-foreground/8 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute inset-x-0 top-full mt-1 mx-4 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            <div className="p-3 flex flex-col gap-0.5">
              {PUBLIC_LINKS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {!user ? (
                <div className="border-t border-border/60 px-3 py-3 flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors px-1"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="border-t border-border/60 px-3 py-3 space-y-4">
                  <Link
                    href={
                      user.role === "musician"
                        ? "/musician"
                        : user.role === "organizer"
                          ? "/organizer"
                          : "/admin"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-primary hover:underline"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2 text-foreground/60">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm font-medium text-error hover:text-error/80 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
