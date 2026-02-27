"use client";

import { useState, useEffect } from "react";
import MusicianHeader from "./_components/MusicianHeader";
import {
  Music, Calendar, FileText, CheckCircle, TrendingUp,
  Clock, MapPin, Loader2, Percent, ArrowRight, Sparkles,
  ChevronRight, Search, Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getMusicianDashboard } from "@/lib/api/dashboard";
import { getAuthToken } from "@/lib/cookies";
import { useAuth } from "@/app/context/AuthContext";

const ICON_MAP: Record<string, any> = { FileText, Calendar, CheckCircle, TrendingUp, Percent };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  const cls =
    normalized === "accepted"
      ? "badge-accepted"
      : normalized === "rejected"
      ? "badge-rejected"
      : "badge-pending";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export default function MusicianDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;
        const response = await getMusicianDashboard(token);
        if (response.success) setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || [];
  const recentGigs = data?.recentGigs || [];
  const displayName = user?.username || user?.email?.split("@")[0] || "Musician";

  const quickLinks = [
    { label: "Browse Gigs", href: "/musician/gigs", icon: Search, desc: "Find new opportunities" },
    { label: "My Applications", href: "/musician/applications", icon: FileText, desc: "Track your submissions" },
    { label: "Profile", href: "/musician/profile", icon: TrendingUp, desc: "Your public profile" },
    { label: "Notifications", href: "/notifications", icon: Bell, desc: "Alerts & updates" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MusicianHeader />

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-28 pb-20">

        {/* Hero header */}
        <motion.section {...fadeUp(0)} className="relative mb-12 p-8 rounded-[2rem] overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-[2rem] border border-primary/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-3 border border-primary/20">
                <Sparkles size={12} className="animate-pulse" />
                Musician Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                Welcome back, <span className="gradient-text">{displayName}</span>!
              </h1>
              <p className="mt-2 text-muted-foreground font-medium max-w-md">
                Here's what's happening with your musical journey today.
              </p>
            </div>
            <Link
              href="/musician/gigs"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-sm shrink-0"
            >
              <Search size={16} />
              Find Gigs
            </Link>
          </div>
        </motion.section>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat: any, index: number) => {
            const Icon = ICON_MAP[stat.icon] || FileText;
            return (
              <motion.div
                key={stat.label}
                {...fadeUp(0.05 * index)}
                className="group relative rounded-2xl border border-border/60 bg-card p-6 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-black text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg || "bg-primary/10"} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${stat.color || "text-primary"}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Activities */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black tracking-tight text-foreground">Recent Activities</h2>
              <Link
                href="/musician/applications"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            {recentGigs.length > 0 ? (
              <div className="space-y-3">
                {recentGigs.map((gig: any, idx: number) => (
                  <motion.div key={gig.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + idx * 0.06 }}>
                    <Link
                      href={`/musician/gigs/${gig.id}`}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/2 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Music size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm leading-tight">{gig.title}</h3>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Clock size={10} /> {gig.date}</span>
                            {gig.location && <span className="flex items-center gap-1"><MapPin size={10} /> {gig.location}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={gig.status} />
                        <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-secondary/5">
                <div className="h-16 w-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                  <Music size={30} className="text-primary/30" />
                </div>
                <p className="font-bold text-foreground mb-1">No applications yet</p>
                <p className="text-sm text-muted-foreground mb-5">Start browsing gigs to kickstart your journey.</p>
                <Link
                  href="/musician/gigs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  Browse Gigs <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div {...fadeUp(0.3)}>
            <h2 className="text-lg font-black tracking-tight text-foreground mb-5">Quick Access</h2>
            <div className="space-y-3">
              {quickLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/2 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <link.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{link.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{link.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>

            {/* Promo tip */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/5 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 h-20 w-20 bg-primary/10 rounded-full blur-xl" />
              <Sparkles size={18} className="text-primary mb-2" />
              <p className="font-black text-sm text-foreground">Complete your profile</p>
              <p className="text-xs text-muted-foreground mt-1">A complete profile gets 3× more gig views.</p>
              <Link href="/musician/profile/edit" className="mt-3 inline-block text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Edit profile →
              </Link>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
