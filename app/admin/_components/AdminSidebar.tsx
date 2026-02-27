"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Settings } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col hidden md:flex">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">GetAGig</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="p-4 rounded-xl bg-foreground/5">
            <p className="text-xs text-foreground/60">Logged in as</p>
            <p className="font-semibold text-foreground">Admin</p>
        </div>
      </div>
    </aside>
  );
}
