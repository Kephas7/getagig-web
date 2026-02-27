"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getGigById, updateGig, Gig } from "@/lib/api/gig";
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

export default function EditGigPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
    status: "open" as "open" | "closed" | "filled"
  });

  const [newGenre, setNewGenre] = useState("");
  const [newInstrument, setNewInstrument] = useState("");

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await getGigById(id as string);
        if (response.success) {
          const gig = response.data;
          setFormData({
            title: gig.title,
            description: gig.description,
            location: gig.location,
            genres: gig.genres,
            instruments: gig.instruments,
            payRate: gig.payRate,
            eventType: gig.eventType,
            deadline: new Date(gig.deadline).toISOString().split('T')[0],
            status: gig.status
          });
        }
      } catch (err: any) {
        setError("Failed to load gig details.");
        toast.error("Failed to load gig details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGig();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await updateGig(token, id as string, formData);
      if (response.success) {
        toast.success("Gig updated successfully!");
        router.push("/organizer/gigs");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update gig.");
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

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

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
            <h1 className="text-4xl font-black tracking-tight text-foreground">Edit <span className="text-primary">Gig Posting</span></h1>
            <p className="mt-1 text-muted-foreground font-medium">Update the details for your gig casting.</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Casting Essentials */}
          <motion.section {...fadeUp(0)} className="bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gig Title</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-bold"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-bold"
                  value={formData.status}
                  onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="filled">Filled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event Category</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-bold"
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
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Brief</label>
              <textarea
                rows={6}
                className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </motion.section>

          {/* Location & Pay */}
          <motion.section {...fadeUp(0.1)} className="bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Rate (USD)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-primary">$</span>
                  <input
                    type="number"
                    className="w-full pl-10 pr-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-black text-xl text-primary"
                    value={formData.payRate}
                    onChange={(e) => setFormData(p => ({ ...p, payRate: Number(e.target.value) }))}
                  />
                </div>
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

          {/* Launch Panel */}
          <motion.div {...fadeUp(0.2)} className="bg-foreground text-background rounded-[2.5rem] p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 translate-y-6">
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-lg shadow-primary/10">
                <Sparkles size={28} />
               </div>
               <div>
                  <h4 className="font-black text-xl leading-none">Ready to Save?</h4>
                  <p className="mt-2 text-background/60 text-sm font-medium">Your changes will be live instantly for all talent.</p>
               </div>
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-12 py-5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-3"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving Changes..." : "Update Posting"}
            </button>
          </motion.div>
        </form>
      </main>
    </div>
  );
}
