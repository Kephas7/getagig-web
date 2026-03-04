"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Users, Music2, BadgeCheck } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    <aside className="w-72 border-r border-border/70 bg-card/70 backdrop-blur-xl h-screen sticky top-0 hidden md:flex md:flex-col">
      <div className="p-5 border-b border-border/60">
        <Link href="/admin/users" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Music2 size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">Get-A-Gig</h1>
            <p className="text-xs text-foreground/55">Admin Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/12 text-foreground ring-1 ring-primary/35"
                  : "text-foreground/65 hover:bg-foreground/6 hover:text-foreground"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-primary" : "text-foreground/60"}
              />
              <span className="text-sm font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/60">
        <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-foreground/50">
            Logged in as
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Administrator
          </p>
        </div>
      </div>
    </aside>
  );
}
