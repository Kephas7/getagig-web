"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGigById, Gig } from "@/lib/api/gig";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, Calendar, DollarSign, 
  Music, Loader2, Briefcase, Clock, ChevronLeft,
  Share2, Heart, CheckCircle, Info, Sparkles
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { applyToGig } from "@/lib/api/application";
import { getAuthToken } from "@/lib/cookies";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function GigDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gig, setGig] = useState<Gig | null>(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await getGigById(id as string);
        if (response.success) {
          setGig(response.data);
        }
      } catch (err: any) {
        setError("Unable to find this gig. It may have been closed.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGig();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("You must be logged in to apply.");
        return;
      }
      const response = await applyToGig(token, { gigId: id as string });
      if (response.success) {
        toast.success("Application submitted! The organizer will review your profile.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Tuning into gig details…</p>
      </div>
    </div>
  );

  if (error || !gig) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="p-10 bg-card border border-border/60 rounded-[2.5rem] max-w-md text-center shadow-2xl">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <Info size={32} />
        </div>
        <h2 className="text-2xl font-black mb-4">{error || "Gig Not Found"}</h2>
        <Link 
          href="/musician/gigs" 
          className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm hover:underline"
        >
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MusicianHeader />

      <main className="mx-auto max-w-5xl px-5 lg:px-8 pt-32 pb-20">
        <motion.div {...fadeUp(0)} className="mb-8">
          <button 
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-widest text-[10px]"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section {...fadeUp(0.1)} className="bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -z-10" />
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider border border-primary/20">
                  {gig.eventType}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-secondary text-muted-foreground text-xs font-black uppercase tracking-wider border border-border/50">
                  ID: #{gig.id.slice(-6).toUpperCase()}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                {gig.title}
              </h1>

              <div className="flex flex-wrap gap-y-4 gap-x-8 mb-10 pb-10 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/5 text-primary"><MapPin size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</p>
                    <p className="font-bold">{gig.location.city}, {gig.location.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/5 text-primary"><DollarSign size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pay Rate</p>
                    <p className="font-bold">${gig.payRate} <span className="text-xs font-normal text-muted-foreground">/ session</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/5 text-primary"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deadline</p>
                    <p className="font-bold">{new Date(gig.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" /> Gig Description
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                  {gig.description}
                </p>
              </div>
            </motion.section>

            {/* Requirements Card */}
            <motion.section {...fadeUp(0.15)} className="bg-card border border-border/60 rounded-[2.5rem] p-10 shadow-lg">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <CheckCircle size={24} className="text-primary" /> Hiring Requirements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Target Genres</p>
                   <div className="flex flex-wrap gap-2">
                    {gig.genres.map(genre => (
                      <span key={genre} className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs font-bold text-primary">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Required Instruments</p>
                   <div className="flex flex-wrap gap-2">
                    {gig.instruments.map(inst => (
                      <span key={inst} className="px-4 py-2 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs font-bold text-violet-600 dark:text-violet-400">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Sidebar / Action Panel */}
          <div className="space-y-6">
            <motion.div {...fadeUp(0.2)} className="bg-foreground text-background rounded-[2.5rem] p-8 shadow-2xl sticky top-28">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 opacity-60">Action Center</h4>
              
              <div className="space-y-4 mb-8">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                  {applying ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>Submit Interest <ArrowLeft className="rotate-180" size={18} /></>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-background/10 border border-background/20 hover:bg-background/20 transition-all text-xs font-bold uppercase tracking-wider">
                    <Heart size={14} /> Shortlist
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-background/10 border border-background/20 hover:bg-background/20 transition-all text-xs font-bold uppercase tracking-wider">
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-background/5 border border-background/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">Open</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Posted On</span>
                  <span className="text-xs font-bold">{new Date(gig.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.25)} className="bg-card border border-border/60 rounded-[2.5rem] p-8 shadow-lg text-center">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Briefcase size={28} />
              </div>
              <h5 className="font-black text-lg mb-2">Organizer Hub</h5>
              <p className="text-sm text-muted-foreground font-medium mb-6">
                This gig is posted by a verified event organizer.
              </p>
              <Link href={`/organizer/profile/${gig.organizerId}`} className="block">
                <button className="text-primary text-xs font-black uppercase tracking-[0.2em] border-b-2 border-primary/30 hover:border-primary transition-all">
                  View Organizer Profile
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
