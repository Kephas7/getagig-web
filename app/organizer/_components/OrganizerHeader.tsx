"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Music, Home, PlusCircle, Briefcase, User, 
  LogOut, Menu, X 
} from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

type NavLink = {
  href: string;
  label: string;
  icon: any;
};

const ORGANIZER_LINKS: NavLink[] = [
  { href: "/organizer", label: "Dashboard", icon: Home },
  { href: "/gigs/new", label: "Post Gig", icon: PlusCircle },
  { href: "/gigs/manage", label: "My Gigs", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

export default function OrganizerHeader() {
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
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const logout = () => {
    contextLogout();
    setMobileMenuOpen(false);
  };

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
            href="/organizer" 
            className="flex items-center gap-2 group z-10"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Music className="h-6 w-6 text-primary transition-transform group-hover:-rotate-12" />
            <span className="text-lg font-bold tracking-tight">
              Get-A-Gig <span className="text-xs font-normal text-muted-foreground ml-1">Organizer</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {ORGANIZER_LINKS.map((item) => {
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="organizer-nav-underline"
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
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
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
                {ORGANIZER_LINKS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        active
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-border/50" />

              {user && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-base font-medium text-destructive hover:text-destructive/80 transition-colors"
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
