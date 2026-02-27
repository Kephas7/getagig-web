"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGig } from "@/lib/api/gig";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, Save, ArrowLeft, Loader2, 
  MapPin, DollarSign, Calendar, Music, 
  Sparkles, CheckCircle, Info
} from "lucide-react";
import { getAuthToken } from "@/lib/cookies";
import { toast } from "@/lib/toast";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function NewGigPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: { city: "", state: "", country: "" },
    genres: [] as string[],
    instruments: [] as string[],
    payRate: 0,
    eventType: "Wedding",
    deadline: "",
  });

  const [newGenre, setNewGenre] = useState("");
  const [newInstrument, setNewInstrument] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error("Please fill in all essential fields.");
      return;
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await createGig(token, formData);
      if (response.success) {
        toast.success("Gig launched successfully!");
        router.push("/organizer/gigs");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create gig.");
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addTag = (field: "genres" | "instruments", val: string, setVal: (v: string) => void) => {
    if (!val.trim()) return;
    if (!formData[field].includes(val.trim())) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], val.trim()] }));
    }
    setVal("");
  };

  const removeTag = (field: "genres" | "instruments", val: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(v => v !== val) }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <OrganizerHeader />

      <main className="mx-auto max-w-4xl px-5 lg:px-8 pt-32">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-card border border-border/60 text-muted-foreground hover:text-foreground transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Post a <span className="text-primary">Gig Opportunity</span></h1>
            <p className="mt-1 text-muted-foreground font-medium">Broadcast your event to thousands of world-class artists.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-8">
          {/* Section 1: Core Casting */}
          <motion.section {...fadeUp(0)} className="bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] -z-10" />
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="h-6 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
              Casting Essentials
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gig Title</label>
              <input
                type="text"
                placeholder="e.g. Lead Guitarist Needed for Summer Festival"
                className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Brief</label>
              <textarea
                rows={6}
                placeholder="Describe the performance, rehearsal schedule, and what you expect from the artist..."
                className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event Category</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none appearance-none font-bold"
                  value={formData.eventType}
                  onChange={(e) => setFormData(p => ({ ...p, eventType: e.target.value }))}
                >
                  <option>Wedding</option>
                  <option>Club / Venue</option>
                  <option>Private Gig</option>
                  <option>Corporate</option>
                  <option>Concert</option>
                  <option>Festival</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Application Deadline</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-bold"
                  value={formData.deadline}
                  onChange={(e) => setFormData(p => ({ ...p, deadline: e.target.value }))}
                />
              </div>
            </div>
          </motion.section>

          {/* Section 2: Logistics & Budget */}
          <motion.section {...fadeUp(0.1)} className="bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl space-y-8">
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="h-6 w-1 bg-violet-500 rounded-full" />
              Logistics & Budget
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(["city", "state", "country"] as const).map(field => (
                <div key={field} className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground capitalize">{field}</label>
                   <input
                    type="text"
                    className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none"
                    value={formData.location[field]}
                    onChange={(e) => setFormData(p => ({ ...p, location: { ...p.location, [field]: e.target.value } }))}
                   />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Rate (USD)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-primary">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-10 pr-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-black text-xl text-primary"
                  value={formData.payRate || ""}
                  onChange={(e) => setFormData(p => ({ ...p, payRate: Number(e.target.value) }))}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold italic mt-2 flex items-center gap-1">
                <Info size={10} /> Transparency in pay attracts higher quality talent.
              </p>
            </div>
          </motion.section>

          {/* Section 3: Requirements */}
          <motion.section {...fadeUp(0.2)} className="bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl space-y-8">
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="h-6 w-1 bg-amber-500 rounded-full" />
              Talent Criteria
            </h2>

            {/* Genres */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Desired Genres</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genres.map(g => (
                  <span key={g} className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold">
                    {g}
                    <button type="button" onClick={() => removeTag("genres", g)} className="hover:scale-110"><X size={14} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Classic Rock"
                  className="flex-1 px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("genres", newGenre, setNewGenre))}
                />
                <button type="button" onClick={() => addTag("genres", newGenre, setNewGenre)} className="px-5 py-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 transition-all">
                  <Plus size={24} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Instruments */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Required Instruments</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.instruments.map(i => (
                  <span key={i} className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 border border-violet-500/20 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase">
                    {i}
                    <button type="button" onClick={() => removeTag("instruments", i)} className="hover:scale-110"><X size={14} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Hammond B3 Organ"
                  className="flex-1 px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none"
                  value={newInstrument}
                  onChange={(e) => setNewInstrument(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("instruments", newInstrument, setNewInstrument))}
                />
                <button type="button" onClick={() => addTag("instruments", newInstrument, setNewInstrument)} className="px-5 py-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 transition-all">
                  <Plus size={24} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.section>

          {/* Launch Panel */}
          <motion.div {...fadeUp(0.3)} className="bg-foreground text-background rounded-[2.5rem] p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 translate-y-6">
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-lg shadow-primary/10">
                <Sparkles size={28} />
               </div>
               <div>
                  <h4 className="font-black text-xl leading-none">Ready for Liftoff?</h4>
                  <p className="mt-2 text-background/60 text-sm font-medium">Verify your gig details before launching the casting.</p>
               </div>
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-12 py-5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-3"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Deploying Gig..." : "Launch Casting"}
            </button>
          </motion.div>

          <div className="h-20" />
        </form>
      </main>
    </div>
  );
}
