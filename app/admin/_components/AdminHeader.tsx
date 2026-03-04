"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";
import { LogOut, Bell, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminHeader() {
  const { logout, user } = useAuth();
  const { notifCount } = useSocket();

  return (
    <header className="h-16 border-b border-border/60 bg-background/75 backdrop-blur-xl sticky top-0 z-10 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
          <Sparkles size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-foreground/50">
            Control Center
          </p>
          <h2 className="text-sm font-semibold truncate">Admin Dashboard</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="p-2 rounded-full hover:bg-foreground/5 text-foreground/70 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-error text-white rounded-full text-[10px] leading-4 text-center font-bold border border-background">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>
        <div className="hidden sm:flex items-center rounded-full bg-foreground/6 border border-border/60 px-3 py-1.5">
          <span className="text-xs text-foreground/65">
            {user?.email || "admin@getagig"}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-error/10 hover:text-error text-foreground/70 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
