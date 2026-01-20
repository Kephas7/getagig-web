"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Music, Home, Search, FileText, User, PlusCircle, Briefcase, LogOut, Menu, X, Info } from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";

type User = {
  email: string;
  role: "musician" | "organizer";
};

const PUBLIC_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: Info },
  { href: "/gigs", label: "Browse Gigs", icon: Search },
];

const MUSICIAN_LINKS = [
  { href: "/dashboard/musician", label: "Dashboard", icon: Home },
  { href: "/gigs", label: "Browse Gigs", icon: Search },
  { href: "/applications", label: "Applications", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
];

const ORGANIZER_LINKS = [
  { href: "/dashboard/organizer", label: "Dashboard", icon: Home },
  { href: "/gigs/new", label: "Post Gig", icon: PlusCircle },
  { href: "/gigs/manage", label: "My Gigs", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  // Determine which menu to show
  const getMenuItems = () => {
    if (!user) return PUBLIC_LINKS;
    if (user.role === "musician") return MUSICIAN_LINKS;
    if (user.role === "organizer") return ORGANIZER_LINKS;
    return PUBLIC_LINKS;
  };

  const menuItems = getMenuItems();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Music className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Get-A-Gig</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Auth Buttons / User Menu */}
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle for mobile */}
            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              <div className="border-t border-border mt-2 pt-2">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium mt-2"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-muted rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">
                        {user.email} ({user.role})
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}