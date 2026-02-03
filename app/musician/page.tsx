"use client";

import MusicianHeader from "./_components/MusicianHeader";
import { Music, Calendar, FileText, CheckCircle, TrendingUp, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function MusicianDashboard() {
  const stats = [
    { label: "Active Applications", value: "12", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Upcoming Gigs", value: "4", icon: Calendar, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Completion Rate", value: "98%", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { label: "Profile Views", value: "154", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const recentGigs = [
    { id: 1, title: "Jazz Night at Blue Note", date: "Feb 15, 2026", location: "New York, NY", status: "Confirmed" },
    { id: 2, title: "Summer Music Festival", date: "Jul 10, 2026", location: "Chicago, IL", status: "Pending" },
    { id: 3, title: "Corporate Event - Gala", date: "Mar 05, 2026", location: "Los Angeles, CA", status: "Confirmed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MusicianHeader />
      
      <main className="mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-16">
        <header className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Welcome back, Musician!
          </motion.h1>
          <p className="mt-2 text-muted-foreground">
            Here's what's happening with your musical journey today.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Upcoming Gigs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Upcoming Gigs</h2>
              <button className="text-sm font-medium text-primary hover:underline">View all</button>
            </div>
            <div className="space-y-4">
              {recentGigs.map((gig) => (
                <div 
                  key={gig.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Music size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{gig.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> {gig.date}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {gig.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    gig.status === "Confirmed" 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                    {gig.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tasks */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">Quick Tasks</h2>
            <div className="space-y-4">
              {[
                "Complete your profile information",
                "Upload a new performance video",
                "Review pending applications",
                "Update your availability for March"
              ].map((task, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-transparent hover:border-border transition-colors">
                  <div className="mt-0.5 h-4 w-4 rounded border border-primary shrink-0" />
                  <span className="text-sm text-foreground">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}