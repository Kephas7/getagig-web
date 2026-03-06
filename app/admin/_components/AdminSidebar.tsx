"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Users, BadgeCheck, LogOut, Bell } from "lucide-react";
import { useState } from "react";
import ThemeLogo from "@/app/_components/ThemeLogo";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { logout, user } = useAuth();
  const { notifCount } = useSocket();

  const links = [
    { name: "Users", href: "/admin/users", icon: Users },
    {
      name: "Requests",
      href: "/admin/users?filter=pending",
      icon: BadgeCheck,
      filter: "pending",
    },
  ];

  return (
    <aside
      onMouseEnter={() => setSidebarCollapsed(false)}
      onMouseLeave={() => setSidebarCollapsed(true)}
      onFocusCapture={() => setSidebarCollapsed(false)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setSidebarCollapsed(true);
        }
      }}
      className={`border-r border-border/70 bg-card/80 backdrop-blur-xl h-screen sticky top-0 hidden md:flex md:flex-col transition-all duration-300 ${
        sidebarCollapsed ? "w-24" : "w-72"
      }`}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div
          className={`border-b border-border/60 ${sidebarCollapsed ? "p-2" : "p-5"}`}
        >
          <Link
            href="/admin/users"
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
                className={`h-full w-full object-contain ${
                  sidebarCollapsed
                    ? "object-center scale-[1.12] origin-center"
                    : "object-center scale-[1.85] origin-center"
                }`}
              />
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isUsersPath = pathname === "/admin/users";
            const isPendingLink = link.filter === "pending";
            const activeFilter = searchParams.get("filter");
            const isActive = isPendingLink
              ? isUsersPath && activeFilter === "pending"
              : isUsersPath && activeFilter !== "pending";

            return (
              <Link
                key={link.href}
                href={link.href}
                title={sidebarCollapsed ? link.name : undefined}
                className={`flex items-center rounded-xl py-2.5 transition-all duration-200 ${
                  sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"
                } ${
                  isActive
                    ? "bg-primary/12 text-foreground ring-1 ring-primary/35"
                    : "text-foreground/65 hover:bg-foreground/6 hover:text-foreground"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-primary" : "text-foreground/60"}
                />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{link.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/60 space-y-3">
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
              sidebarCollapsed ? "justify-center px-2" : "justify-between px-3"
            }`}
          >
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Appearance
              </span>
            )}
            <ThemeToggle />
          </div>

          {!sidebarCollapsed && (
            <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-foreground/50">
                Logged in as
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground truncate">
                {user?.email || "Administrator"}
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
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
