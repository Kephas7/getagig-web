"use client";

import { useState, useEffect } from "react";
import OrganizerHeader from "./_components/OrganizerHeader";
import {
  PlusCircle, Users, Briefcase, MessageSquare, Activity,
  Bell, Loader2, ArrowRight, Sparkles, ChevronRight,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getOrganizerDashboard } from "@/lib/api/dashboard";
import { getAuthToken } from "@/lib/cookies";
import { useAuth } from "@/app/context/AuthContext";

const ICON_MAP: Record<string, any> = { Briefcase, Users, MessageSquare, Activity };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

function StatusBadge({ status }: { status: string }) {
  const n = status?.toLowerCase();
  if (n === "accepted") return <span className="badge-accepted px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
  if (n === "rejected") return <span className="badge-rejected px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
  return <span className="badge-pending px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;
        const response = await getOrganizerDashboard(token);
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
  const recentApplications = data?.recentApplications || [];
  const displayName = user?.username || user?.email?.split("@")[0] || "Organizer";

  const quickActions = [
    { label: "Post New Gig", href: "/organizer/gigs/new", icon: PlusCircle, desc: "Create an opportunity" },
    { label: "My Gigs", href: "/organizer/gigs", icon: Briefcase, desc: "Manage your listings" },
    { label: "Profile", href: "/organizer/profile", icon: Users, desc: "Your public page" },
    { label: "Notifications", href: "/notifications", icon: Bell, desc: "Alerts & updates" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <OrganizerHeader />

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-28 pb-20">

        {/* Hero */}
        <motion.section {...fadeUp(0)} className="relative mb-12 p-8 rounded-[2rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-[2rem] border border-primary/20" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-3 border border-primary/20">
                <Sparkles size={12} className="animate-pulse" />
                Organizer Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                Welcome, <span className="gradient-text">{displayName}</span>!
              </h1>
              <p className="mt-2 text-muted-foreground font-medium max-w-md">
                Manage your gigs, review applications, and connect with musical talent.
              </p>
            </div>
            <Link
              href="/organizer/gigs/new"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-sm shrink-0"
            >
              <PlusCircle size={16} />
              Post a Gig
            </Link>
          </div>
        </motion.section>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat: any, index: number) => {
            const Icon = ICON_MAP[stat.icon] || Briefcase;
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

          {/* Recent Applications */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                Recent Applications
              </h2>
              <Link href="/organizer/gigs" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Manage all <ChevronRight size={14} />
              </Link>
            </div>

            {recentApplications.length > 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="grid grid-cols-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/40 bg-secondary/30">
                  <span>Applicant</span>
                  <span>Gig</span>
                  <span>Status</span>
                  <span className="text-right">Action</span>
                </div>
                {recentApplications.map((app: any, idx: number) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                    className="grid grid-cols-4 items-center px-5 py-4 border-b border-border/30 last:border-0 hover:bg-primary/2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground truncate">{app.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{app.role}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate pr-2">{app.gig}</p>
                    <div><StatusBadge status={app.status} /></div>
                    <div className="text-right">
                      <Link
                        href={`/musician/profile/${app.musicianId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        View <ArrowRight size={11} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-secondary/5">
                <div className="h-16 w-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-primary/30" />
                </div>
                <p className="font-bold text-foreground mb-1">No applications yet</p>
                <p className="text-sm text-muted-foreground mb-5">Post a gig to start receiving applications from musicians.</p>
                <Link
                  href="/organizer/gigs/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  Post a Gig <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div {...fadeUp(0.3)}>
            <h2 className="text-lg font-black tracking-tight text-foreground mb-5">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/2 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <action.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{action.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>

            {/* Tip card */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/5 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 h-20 w-20 bg-primary/10 rounded-full blur-xl" />
              <Sparkles size={18} className="text-primary mb-2" />
              <p className="font-black text-sm text-foreground">AI Matching — Coming Soon</p>
              <p className="text-xs text-muted-foreground mt-1">
                Smart applicant ranking and performance analytics powered by AI.
              </p>
              <span className="mt-3 inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                In Development
              </span>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
