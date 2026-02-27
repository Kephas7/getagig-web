"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGigs, Gig, deleteGig } from "@/lib/api/gig";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, MoreVertical, MapPin, 
  DollarSign, Loader2, Edit, Trash2, 
  Eye, Calendar, Briefcase, Filter, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { getOrganizerProfile } from "@/lib/api/organizer";
import { useAuth } from "@/app/context/AuthContext";
import { getAuthToken } from "@/lib/cookies";
import { toast } from "@/lib/toast";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function OrganizerGigsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyGigs = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;
        
        // First get the organizer profile to get the ID
        const profileRes = await getOrganizerProfile(token);
        if (!profileRes.success) throw new Error("Failed to load profile");
        
        const organizerId = profileRes.data.id;
        
        // Fetch only this organizer's gigs
        const response = await getGigs({ organizerId });
        if (response.success) {
          setGigs(response.data.gigs);
        }
      } catch (err: any) {
        setError("Failed to load your gig postings.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyGigs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gig posting?")) return;
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await deleteGig(token, id);
      if (response.success) {
        setGigs(prev => prev.filter(g => g.id !== id));
        toast.success("Gig posting deleted successfully.");
      }
    } catch (err: any) {
      toast.error("Failed to delete gig.");
    }
  };

  const filteredGigs = gigs.filter(gig => 
    gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gig.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Preparing your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <OrganizerHeader />

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div {...fadeUp(0)}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Gig <span className="text-primary italic">Command Center</span>
            </h1>
            <p className="mt-3 text-lg text-muted-foreground font-medium max-w-xl">
              Post, manage, and scale your musical events with ease.
            </p>
          </motion.div>
          
          <motion.div {...fadeUp(0.1)} className="shrink-0">
             <Link
              href="/organizer/gigs/new"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-foreground text-background text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              <Plus size={20} />
              Launch New Gig
            </Link>
          </motion.div>
        </div>

        {/* Filters bar */}
        <motion.div {...fadeUp(0.15)} className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search your gig postings..."
              className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-card border border-border/60 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] bg-card border border-border/60 text-sm font-bold text-muted-foreground">
            <Filter size={18} />
            Show: All Gigs
          </div>
        </motion.div>

        {/* Gigs List */}
        <AnimatePresence mode="popLayout">
          {filteredGigs.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGigs.map((gig, idx) => (
                <motion.div
                  key={gig.id}
                  layout
                  {...fadeUp(0.2 + idx * 0.05)}
                  className="group bg-card border border-border/60 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -z-10" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                      {gig.eventType}
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleDelete(gig.id)}
                        className="p-3 rounded-2xl bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors leading-tight">
                    {gig.title}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <MapPin size={16} className="text-primary/70" />
                      {gig.location.city}, {gig.location.state}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <DollarSign size={16} className="text-primary/70" />
                      <span className="text-foreground font-bold">${gig.payRate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Calendar size={16} className="text-primary/70" />
                      {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : "No deadline"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Briefcase size={16} className="text-primary/70" />
                      0 Applicants
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-border/60">
                    <Link
                      href={`/organizer/gigs/${gig.id}/applications`}
                      className="flex-1 py-3 rounded-2xl border border-border/60 text-center text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all"
                    >
                      Applications
                    </Link>
                    <Link
                      href={`/organizer/gigs/${gig.id}/edit`}
                      className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-center text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
                    >
                      Edit Listing
                    </Link>
                  </div>
                </motion.div>
              ))}
             </div>
          ) : (
             <motion.div 
              {...fadeUp(0.2)}
              className="text-center py-24 px-10 rounded-[3rem] border-2 border-dashed border-border/60 bg-secondary/5"
            >
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                <Briefcase size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2">No Active Gig Castings</h2>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                You haven't posted any gigs yet. Start by creating your first casting.
              </p>
              <Link 
                href="/organizer/gigs/new"
                className="mt-8 inline-block px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Post Your First Gig
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
