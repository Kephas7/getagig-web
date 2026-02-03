"use client";

import { useAuth } from "@/app/context/AuthContext";
import { LogOut, Bell, Search } from "lucide-react";

export default function AdminHeader() {
  const { logout } = useAuth();

  return (
    <header className="h-16 border-b border-[var(--foreground)/10] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger could go here */}
        <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)/40]" size={16} />
            <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 rounded-full bg-[var(--foreground)/5] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--foreground)/20] w-64"
            />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-[var(--foreground)/5] text-[var(--foreground)/70] transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--background)]"></span>
        </button>
        <div className="h-8 w-[1px] bg-[var(--foreground)/10]"></div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 text-[var(--foreground)/70] transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
