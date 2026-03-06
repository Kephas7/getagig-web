"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createGig } from "@/lib/api/gig";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion } from "framer-motion";
import { Plus, X, Save, ArrowLeft, Loader2, Info } from "lucide-react";
import { getAuthToken } from "@/lib/cookies";
import { toast } from "@/lib/toast";
import { getOrganizerProfile } from "@/lib/api/organizer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function NewGigPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [canPostGig, setCanPostGig] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    genres: [] as string[],
    instruments: [] as string[],
    payRate: 0,
    eventType: "",
    eventDate: "",
    deadline: "",
  });

  const [newGenre, setNewGenre] = useState("");
  const [newInstrument, setNewInstrument] = useState("");

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          router.push("/login");
          return;
        }

        const profileResponse = await getOrganizerProfile(token);
        if (profileResponse?.success) {
          setCanPostGig(Boolean(profileResponse.data?.isVerified));
        }
      } catch {
        setCanPostGig(false);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPostGig) {
      toast.error("Your profile must be verified before posting gigs.");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.eventType.trim() ||
      !formData.eventDate ||
      !formData.deadline
    ) {
      toast.error("Please fill in all essential fields.");
      return;
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await createGig(token, formData);
      if (response.success) {
        toast.success("Gig created successfully!");
        router.push("/organizer/gigs");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create gig.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addTag = (
    field: "genres" | "instruments",
    val: string,
    setVal: (v: string) => void,
  ) => {
    if (!val.trim()) return;
    if (!formData[field].includes(val.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], val.trim()],
      }));
    }
    setVal("");
  };

  const removeTag = (field: "genres" | "instruments", val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== val),
    }));
  };

  if (checkingVerification) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Checking profile status…
          </p>
        </div>
      </div>
    );
  }

  if (!canPostGig) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <OrganizerHeader />
        <main className="mx-auto max-w-4xl px-5 lg:px-8 pt-24 md:pt-8">
          <div className="role-hero-shell border-warning/25 bg-warning/10 p-8 md:p-10">
            <div className="role-hero-content">
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                Verification required
              </h1>
              <p className="mt-3 text-muted-foreground">
                Your organizer profile must be verified before you can post
                gigs.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/organizer/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-colors"
                >
                  Go to Profile
                </Link>
                <Link
                  href="/organizer/gigs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 text-sm font-semibold hover:bg-secondary/30 transition-colors"
                >
                  Back to My Gigs
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <OrganizerHeader />

      <main className="mx-auto max-w-4xl px-5 lg:px-8 pt-24 md:pt-8">
        <div className="role-hero-shell mb-10 p-5 md:p-6">
          <div className="role-hero-content flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-2xl bg-card border border-border/60 text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3 border border-primary/20">
                Organizer Gigs
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Create Gig
              </h1>
              <p className="mt-1 text-muted-foreground">
                Add your gig details and publish when ready.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-8">
          {/* Section 1: Basic details */}
          <motion.section
            {...fadeUp(0)}
            className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8"
          >
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <span className="h-6 w-1 bg-primary rounded-full" />
              Basic Details
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Gig Title
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Guitarist Needed for Summer Festival"
                className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <textarea
                rows={6}
                placeholder="Describe the event and role requirements."
                className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Event Type
                </label>
                <input
                  type="text"
                  list="event-type-suggestions"
                  placeholder="e.g. Wedding, Club Night, College Fest"
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.eventType}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, eventType: e.target.value }))
                  }
                  required
                />
                <datalist id="event-type-suggestions">
                  <option value="Wedding" />
                  <option value="Club / Venue" />
                  <option value="Private Gig" />
                  <option value="Corporate" />
                  <option value="Concert" />
                  <option value="Festival" />
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gig Date
                </label>
                <input
                  type="date"
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, eventDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Application Deadline
                </label>
                <input
                  type="date"
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, deadline: e.target.value }))
                  }
                />
              </div>
            </div>
          </motion.section>

          {/* Section 2: Location & payment */}
          <motion.section
            {...fadeUp(0.1)}
            className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8"
          >
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <span className="h-6 w-1 bg-primary rounded-full" />
              Location & Payment
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Location
              </label>
              <input
                type="text"
                className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.location}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, location: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payment Rate (Rs.)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-semibold text-primary">
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-semibold text-primary focus:ring-2 focus:ring-primary/20"
                  value={formData.payRate || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      payRate: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold italic mt-2 flex items-center gap-1">
                <Info size={10} /> Set a clear payment amount.
              </p>
            </div>
          </motion.section>

          {/* Section 3: Requirements */}
          <motion.section
            {...fadeUp(0.2)}
            className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8"
          >
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <span className="h-6 w-1 bg-primary rounded-full" />
              Requirements
            </h2>

            {/* Genres */}
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Preferred Genres
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    {g}
                    <button
                      type="button"
                      onClick={() => removeTag("genres", g)}
                      className="hover:scale-110"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Classic Rock"
                  className="flex-1 px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    addTag("genres", newGenre, setNewGenre))
                  }
                />
                <button
                  type="button"
                  onClick={() => addTag("genres", newGenre, setNewGenre)}
                  className="px-5 py-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 transition-all"
                >
                  <Plus size={24} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Instruments */}
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Required Instruments
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.instruments.map((i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-semibold uppercase"
                  >
                    {i}
                    <button
                      type="button"
                      onClick={() => removeTag("instruments", i)}
                      className="hover:scale-110"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Hammond B3 Organ"
                  className="flex-1 px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20"
                  value={newInstrument}
                  onChange={(e) => setNewInstrument(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    addTag("instruments", newInstrument, setNewInstrument))
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    addTag("instruments", newInstrument, setNewInstrument)
                  }
                  className="px-5 py-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 transition-all"
                >
                  <Plus size={24} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.section>

          {/* Launch Panel */}
          <motion.div
            {...fadeUp(0.3)}
            className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <p className="text-sm text-muted-foreground">
              Review the information and create your gig.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-12 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold uppercase tracking-[0.2em] hover:opacity-90 transition-all text-sm flex items-center justify-center gap-3"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Creating..." : "Create Gig"}
            </button>
          </motion.div>
        </form>
      </main>
    </div>
  );
}
