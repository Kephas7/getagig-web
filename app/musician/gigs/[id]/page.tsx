"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGigById, Gig } from "@/lib/api/gig";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  ChevronLeft,
  CheckCircle,
  Info,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { applyToGig } from "@/lib/api/application";
import { getAuthToken } from "@/lib/cookies";
import { resolveMediaUrl } from "@/lib/utils";

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
        toast.success(
          "Application submitted! The organizer will review your profile.",
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Tuning into gig details…
          </p>
        </div>
      </div>
    );

  if (error || !gig)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="p-8 bg-card border border-border/60 rounded-3xl max-w-md text-center shadow-sm">
          <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <Info size={32} />
          </div>
          <h2 className="text-xl font-semibold mb-4">
            {error || "Gig Not Found"}
          </h2>
          <Link
            href="/musician/gigs"
            className="inline-flex items-center gap-2 text-primary font-semibold uppercase tracking-wide text-sm hover:underline"
          >
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MusicianHeader />

      <main className="mx-auto max-w-5xl px-5 lg:px-8 pt-30 pb-16">
        <motion.div {...fadeUp(0)} className="mb-8">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold uppercase tracking-wide text-[11px]"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Search
          </button>
        </motion.div>

        <div className="space-y-6">
          {/* Main Content */}
          <div className="space-y-6">
            <motion.section
              {...fadeUp(0.1)}
              className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                {gig.organizer?.profilePicture ? (
                  <img
                    src={resolveMediaUrl(gig.organizer.profilePicture)}
                    alt={
                      gig.organizer.displayName ||
                      gig.organizer.organizationName ||
                      gig.organizer.username ||
                      "Organizer"
                    }
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {(
                      gig.organizer?.displayName ||
                      gig.organizer?.organizationName ||
                      gig.organizer?.username ||
                      "O"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Organized by
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {gig.organizer?.displayName ||
                      gig.organizer?.organizationName ||
                      gig.organizer?.username ||
                      "Organizer"}
                  </p>
                </div>
                <Link
                  href={`/organizer/profile/${gig.organizerId}`}
                  className="ml-auto inline-flex items-center rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  View Profile
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide border border-primary/20">
                  {gig.eventType}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5 leading-tight">
                {gig.title}
              </h1>

              <div className="flex flex-wrap gap-y-4 gap-x-6 mb-8 pb-8 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Location
                    </p>
                    <p className="font-medium">{gig.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Pay Rate
                    </p>
                    <p className="font-medium">
                      Rs. {gig.payRate}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / session
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Deadline
                    </p>
                    <p className="font-medium">
                      {new Date(gig.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" /> Gig
                  Description
                </h3>
                <p className="text-muted-foreground leading-7 whitespace-pre-wrap">
                  {gig.description}
                </p>
              </div>
            </motion.section>

            {/* Requirements Card */}
            <motion.section
              {...fadeUp(0.15)}
              className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <CheckCircle size={24} className="text-primary" /> Hiring
                Requirements
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Target Genres
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gig.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs font-medium text-primary"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Required Instruments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gig.instruments.map((inst) => (
                      <span
                        key={inst}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs font-medium text-sky-700 dark:text-sky-300"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          <motion.section
            {...fadeUp(0.2)}
            className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-foreground">
                  Ready to apply?
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Submit your profile for this gig.
                </p>
              </div>
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold uppercase tracking-wide text-sm transition-colors hover:opacity-90 flex items-center justify-center gap-2"
              >
                {applying ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Apply <ArrowLeft className="rotate-180" size={18} />
                  </>
                )}
              </button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
