"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Music, Home, Search, FileText, User, PlusCircle, Briefcase, 
  LogOut, Menu, X, Info, ChevronRight 
} from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

type User = {
  email: string;
  role: "musician" | "organizer";
};

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
  const router = useRouter();
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
    if (href === "/" && pathname !== "/") return false;
    return pathname?.startsWith(href);
  };

  const logout = () => {
    contextLogout();
    setMobileMenuOpen(false);
  };

  const menuItems = PUBLIC_LINKS;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group z-10"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Music className="h-6 w-6 text-primary transition-transform group-hover:-rotate-12" />
            <span className="text-lg font-bold tracking-tight">
              Get-A-Gig
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    active ? "text-foreground" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute left-0 right-0 -bottom-1 h-px bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            
            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  href={user.role === "musician" ? "/musician" : user.role === "organizer" ? "/organizer" : "/admin"}
                  className="text-sm font-medium text-primary hover:underline"
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
                  className="text-sm font-medium text-foreground/60 hover:text-error transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden -mr-2 p-2 text-foreground hover:bg-muted/50 rounded-md transition-colors"
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border/50 bg-background"
          >
            <div className="px-6 py-6 space-y-6">
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        active
                          ? "text-primary"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-border/50" />

              {!user ? (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex justify-center rounded-full bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    href={user.role === "musician" ? "/musician" : user.role === "organizer" ? "/organizer" : "/admin"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-medium text-primary hover:underline"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2 text-foreground/60">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-base font-medium text-error hover:text-error/80 transition-colors"
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