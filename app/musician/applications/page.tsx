"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getMusicianApplications } from "@/lib/api/application";
import { getAuthToken } from "@/lib/cookies";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  ArrowRight,
  Loader2,
  Music,
} from "lucide-react";
import Link from "next/link";

export default function MusicianApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await getMusicianApplications(token);
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MusicianHeader />

      <main className="mx-auto max-w-5xl px-6 lg:px-8 pt-30 pb-14">
        <header className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground"
          >
            My <span className="text-primary">Applications</span>
          </motion.h1>
          <p className="mt-2 text-muted-foreground">
            Track your progress and get ready for the limelight.
          </p>
        </header>

        {applications.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm transition-colors group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            app.status === "accepted"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : app.status === "rejected"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-amber-500/15 text-amber-500"
                          }`}
                        >
                          {app.status === "accepted" ? (
                            <CheckCircle size={20} />
                          ) : app.status === "rejected" ? (
                            <XCircle size={20} />
                          ) : (
                            <Clock size={20} />
                          )}
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
                          {app.status}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold">
                        {app.gig?.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 bg-secondary/40 px-3 py-1.5 rounded-lg">
                          <MapPin size={14} className="text-primary" />
                          {app.gig?.location}
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary/40 px-3 py-1.5 rounded-lg">
                          <DollarSign size={14} className="text-emerald-500" />
                          Rs.
                          {app.gig?.payRate} / gig
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary/40 px-3 py-1.5 rounded-lg">
                          <Music size={14} className="text-violet-500" />
                          {app.gig?.eventType}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground/70">
                          Applied On
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <Link
                        href={`/musician/gigs/${app.gigId}`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl text-xs font-semibold uppercase tracking-wide transition-colors hover:opacity-90"
                      >
                        Gig Details <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center border border-dashed border-border/60 rounded-3xl bg-secondary/5"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={34} className="text-primary/40" />
            </div>
            <h2 className="text-xl font-semibold">No applications found</h2>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              You haven't applied to any gigs yet. Start showcasing your talent!
            </p>
            <Link
              href="/musician/gigs"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold uppercase tracking-wide text-xs transition-colors hover:opacity-90"
            >
              Browse Opportunities
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
