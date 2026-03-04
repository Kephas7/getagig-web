"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getGigById, updateGig } from "@/lib/api/gig";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
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
    location: "",
    genres: [] as string[],
    instruments: [] as string[],
    payRate: 0,
    eventType: "",
    eventDate: "",
    deadline: "",
    status: "open" as "open" | "closed" | "filled",
  });

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await getGigById(id as string);
        if (response.success) {
          const gig = response.data;
          const eventDateValue = gig.eventDate || gig.deadline;
          setFormData({
            title: gig.title,
            description: gig.description,
            location: gig.location || "",
            genres: gig.genres,
            instruments: gig.instruments,
            payRate: gig.payRate,
            eventType: gig.eventType,
            eventDate: new Date(eventDateValue).toISOString().split("T")[0],
            deadline: new Date(gig.deadline).toISOString().split("T")[0],
            status: gig.status,
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
    setError("");
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
      const message = err.response?.data?.message || "Failed to update gig.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Edit <span className="text-primary">Gig</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Update the details and save your changes.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Basic details */}
          <motion.section
            {...fadeUp(0)}
            className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8"
          >
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <span className="h-6 w-1 bg-primary rounded-full" />
              Basic Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gig Title
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </label>
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      status: e.target.value as any,
                    }))
                  }
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="filled">Filled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Event Type
                </label>
                <input
                  type="text"
                  list="event-type-suggestions"
                  placeholder="e.g. Wedding, Club Night, College Fest"
                  className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20"
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
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <textarea
                rows={6}
                className="w-full px-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </motion.section>

          {/* Location & payment */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    className="w-full pl-14 pr-5 py-4 rounded-2xl border border-border/60 bg-secondary/20 outline-none font-semibold text-primary focus:ring-2 focus:ring-primary/20"
                    value={formData.payRate}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        payRate: Number(e.target.value),
                      }))
                    }
                  />
                </div>
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

          {/* Actions */}
          <motion.div
            {...fadeUp(0.2)}
            className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <p className="text-sm text-muted-foreground">
              Review the information and save your changes.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-12 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold uppercase tracking-widest hover:opacity-90 transition-all text-sm flex items-center justify-center gap-3"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        </form>
      </main>
    </div>
  );
}
