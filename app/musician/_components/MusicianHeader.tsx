"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Search,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Bell,
} from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";
import ThemeLogo from "@/app/_components/ThemeLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";

const MUSICIAN_LINKS = [
  { href: "/musician", label: "Dashboard", icon: Home },
  { href: "/musician/gigs", label: "Browse Gigs", icon: Search },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
  { href: "/musician/profile", label: "Profile", icon: User },
];

export default function MusicianHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { user, logout: contextLogout } = useAuth();
  const { unreadCount, notifCount } = useSocket();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const owner = "musician";
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const syncBodyOffset = () => {
      if (mediaQuery.matches) {
        document.body.dataset.sidebarOwner = owner;
        document.body.style.paddingLeft = sidebarCollapsed ? "6rem" : "18rem";
        return;
      }

      if (document.body.dataset.sidebarOwner === owner) {
        delete document.body.dataset.sidebarOwner;
        document.body.style.paddingLeft = "";
      }
    };

    syncBodyOffset();
    mediaQuery.addEventListener("change", syncBodyOffset);

    return () => {
      mediaQuery.removeEventListener("change", syncBodyOffset);
      if (document.body.dataset.sidebarOwner === owner) {
        delete document.body.dataset.sidebarOwner;
        document.body.style.paddingLeft = "";
      }
    };
  }, [sidebarCollapsed]);

  const isActive = (href: string) => {
    if (href === "/musician") return pathname === href;
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const logout = () => {
    contextLogout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <aside
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
        onFocusCapture={() => setSidebarCollapsed(false)}
        onBlurCapture={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setSidebarCollapsed(true);
          }
        }}
        className={`fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-border/70 bg-card/80 backdrop-blur-xl transition-all duration-300 md:flex ${
          sidebarCollapsed ? "w-24" : "w-72"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className={`border-b border-border/60 ${
              sidebarCollapsed ? "p-2" : "p-5"
            }`}
          >
            <Link
              href="/musician"
              className="flex w-full items-center justify-center"
            >
              <div
                className={`${
                  sidebarCollapsed
                    ? "h-10 w-full px-1"
                    : "h-[4.25rem] w-full px-0"
                } flex items-center justify-center overflow-hidden ${
                  sidebarCollapsed ? "" : "shadow-sm"
                }`}
              >
                <ThemeLogo
                  width={460}
                  height={160}
                  className={`h-full w-full ${
                    sidebarCollapsed
                      ? "object-contain object-center scale-[1.12] origin-center"
                      : "object-contain object-center scale-[1.85] origin-center"
                  }`}
                />
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 p-3">
            {MUSICIAN_LINKS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const showBadge = item.badge && unreadCount > 0 && !active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl py-2.5 transition-all duration-200 ${
                    sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"
                  } ${
                    active
                      ? "bg-primary/12 text-foreground ring-1 ring-primary/35"
                      : "text-foreground/65 hover:bg-foreground/6 hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon
                      size={18}
                      className={active ? "text-primary" : "text-foreground/60"}
                    />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive text-white text-[8px] font-black flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-border/60 p-3">
            <Link
              href="/notifications"
              title={sidebarCollapsed ? "Notifications" : undefined}
              className={`relative flex items-center rounded-xl border border-border/60 bg-background/70 py-2 text-foreground/70 transition-colors hover:border-primary/30 hover:text-foreground ${
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-between gap-2 px-3"
              }`}
            >
              <div className="relative inline-flex items-center gap-2">
                <Bell size={16} />
                {!sidebarCollapsed && (
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Notifications
                  </span>
                )}
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full bg-destructive px-1 text-[9px] font-black text-white flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </div>
            </Link>

            <div
              className={`flex items-center rounded-xl border border-border/60 bg-background/70 py-2 ${
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-between px-3"
              }`}
            >
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Appearance
                </span>
              )}
              <ThemeToggle />
            </div>

            {user && !sidebarCollapsed && (
              <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-foreground/50">
                  Logged in as
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {user.email}
                </p>
              </div>
            )}

            <button
              onClick={logout}
              title={sidebarCollapsed ? "Sign out" : undefined}
              className={`w-full inline-flex items-center rounded-xl border border-border/60 font-semibold text-foreground/70 transition-colors hover:bg-error/10 hover:text-error ${
                sidebarCollapsed
                  ? "justify-center px-2 py-2.5"
                  : "justify-center gap-2 px-4 py-2 text-sm"
              }`}
            >
              <LogOut size={15} />
              {!sidebarCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 md:hidden ${
          scrolled
            ? "border-b border-border/40 bg-background/70 py-2 shadow-sm backdrop-blur-xl"
            : "bg-transparent py-4"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/musician"
              className="group flex shrink-0 items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex h-[3.2rem] w-[8.8rem] items-center justify-center overflow-hidden transition-transform group-hover:scale-105 sm:w-[9.6rem]">
                <ThemeLogo
                  width={460}
                  height={160}
                  className="h-full w-full object-contain object-center"
                />
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-foreground transition-colors hover:bg-foreground/8"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-16 z-50 mx-4 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-xl backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-0.5 p-3">
              {MUSICIAN_LINKS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const showBadge = item.badge && unreadCount > 0 && !active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
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
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/5"
              >
                <div className="relative">
                  <Bell size={16} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive text-white text-[8px] font-black flex items-center justify-center">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </div>
                Notifications
              </Link>
            </div>
            {user && (
              <div className="flex items-center justify-between border-t border-border/60 px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary ring-1 ring-primary/30">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="max-w-[180px] truncate text-sm font-medium text-foreground/60">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error/10"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
