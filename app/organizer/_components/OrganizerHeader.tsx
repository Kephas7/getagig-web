"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Music, Home, PlusCircle, Briefcase, User, LogOut, Menu, X, MessageSquare, Bell } from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";

const ORGANIZER_LINKS = [
  { href: "/organizer", label: "Dashboard", icon: Home },
  { href: "/organizer/gigs/new", label: "Post Gig", icon: PlusCircle },
  { href: "/organizer/gigs", label: "My Gigs", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
  { href: "/organizer/profile", label: "Profile", icon: User },
];

export default function OrganizerHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout: contextLogout } = useAuth();
  const { unreadCount, notifCount } = useSocket();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/organizer") return pathname === href;
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const logout = () => {
    contextLogout();
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-2 bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/organizer"
            className="flex items-center gap-2.5 group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-primary/40 group-hover:scale-105 transition-all">
              <Music className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">
              Get-A-Gig
              <span className="ml-1.5 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                Organizer
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {ORGANIZER_LINKS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const showBadge = item.badge && unreadCount > 0 && !active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "text-foreground bg-foreground/8"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <div className="relative">
                    <Icon size={15} />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive text-white text-[8px] font-black flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="organizer-pill"
                      className="absolute inset-0 rounded-lg ring-1 ring-primary/30 bg-primary/8"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-white text-[9px] font-black flex items-center justify-center">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
            {user && (
              <>
                <div className="h-5 w-px bg-border" />
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/30">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[130px] truncate hidden lg:block">
                    {user.email}
                  </span>
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-error transition-colors px-2.5 py-1.5 rounded-lg hover:bg-error/10"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-foreground/8 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden absolute inset-x-0 top-full mt-1 mx-4 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            <div className="p-3 flex flex-col gap-0.5">
              {ORGANIZER_LINKS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const showBadge = item.badge && unreadCount > 0 && !active;
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
                    <div className="relative">
                      <Icon size={16} />
                      {showBadge && (
                        <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive text-white text-[8px] font-black flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {user && (
              <div className="border-t border-border/60 px-3 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/30">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm font-medium text-foreground/60 truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-error px-3 py-1.5 rounded-lg hover:bg-error/10 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
