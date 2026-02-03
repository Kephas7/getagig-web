"use client";

import OrganizerHeader from "./_components/OrganizerHeader";
import { PlusCircle, Users, Briefcase, MessageSquare, PieChart, Activity, Bell } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OrganizerDashboard() {
  const stats = [
    { label: "Active Gigs", value: "8", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Applicants", value: "42", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "New Messages", value: "5", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
    { label: "Success Rate", value: "92%", icon: PieChart, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const recentApplications = [
    { id: 1, name: "John Smith", role: "Guitarist", gig: "Jazz Night", status: "Reviewing" },
    { id: 2, name: "Sarah Williams", role: "Vocalist", gig: "Summer Festival", status: "New" },
    { id: 3, name: "David Chen", role: "Drummer", gig: "Corporate Event", status: "Accepted" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <OrganizerHeader />
      
      <main className="mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              Organizer Dashboard
            </motion.h1>
            <p className="mt-2 text-muted-foreground">
              Manage your gigs, applications, and connect with talent.
            </p>
          </div>
          <Link 
            href="/gigs/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
          >
            <PlusCircle size={20} />
            Post New Gig
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                Recent Applications
              </h2>
              <button className="text-sm font-medium text-primary hover:underline">Manage all</button>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gig</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-foreground">{app.name}</div>
                        <div className="text-xs text-muted-foreground">{app.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {app.gig}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          app.status === "Accepted" 
                            ? "bg-green-100 text-green-700" 
                            : app.status === "New"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:text-primary/80">View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Search Talent", icon: Users },
                  { label: "Draft Gig", icon: PlusCircle },
                  { label: "Settings", icon: Bell },
                  { label: "Reports", icon: PieChart },
                ].map((action, i) => (
                  <button 
                    key={i}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/20 transition-all gap-2"
                  >
                    <action.icon size={24} className="text-primary" />
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <h3 className="font-bold text-foreground">Gig Optimizer Pro</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Upgrade to get AI-powered applicant matching and advanced analytics.
                </p>
                <button className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Learn More
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}