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
    <aside className="w-64 bg-[var(--background)] border-r border-[var(--foreground)/10] h-screen flex flex-col hidden md:flex">
      <div className="p-6 border-b border-[var(--foreground)/10]">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">GetAGig</h1>
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
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : "text-[var(--foreground)/70] hover:bg-[var(--foreground)/5] hover:text-[var(--foreground)]"
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[var(--foreground)/10]">
        <div className="p-4 rounded-xl bg-[var(--foreground)/5]">
            <p className="text-xs text-[var(--foreground)/60]">Logged in as</p>
            <p className="font-semibold text-[var(--foreground)]">Admin</p>
        </div>
      </div>
    </aside>
  );
}
