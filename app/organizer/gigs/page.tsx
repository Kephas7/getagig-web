"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGigs, Gig, deleteGig } from "@/lib/api/gig";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MapPin,
  DollarSign,
  Loader2,
  Trash2,
  Calendar,
  Briefcase,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getOrganizerProfile } from "@/lib/api/organizer";
import { getAuthToken } from "@/lib/cookies";
import { toast } from "@/lib/toast";
import { getGigApplications } from "@/lib/api/application";
import { startConversation } from "@/lib/api/message";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

type ApplicantItem = {
  id: string;
  recipientUserId: string;
  name: string;
  role: string;
  gigTitle: string;
  gigId: string;
  status: string;
};

const applicantStatusClass = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "accepted") {
    return "bg-success/10 text-success border-success/25";
  }
  if (normalized === "rejected") {
    return "bg-destructive/10 text-destructive border-destructive/20";
  }
  return "bg-warning/10 text-warning border-warning/25";
};

export default function OrganizerGigsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [canPostGig, setCanPostGig] = useState(false);
  const [allApplicants, setAllApplicants] = useState<ApplicantItem[]>([]);
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
  const [messagingApplicantId, setMessagingApplicantId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchMyGigs = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const profileRes = await getOrganizerProfile(token);
        if (!profileRes.success) return;
        setCanPostGig(Boolean(profileRes.data?.isVerified));

        const organizerId = profileRes.data.id;
        const response = await getGigs({ organizerId, limit: 100 });
        if (response.success) {
          const gigsData = response.data.gigs || [];
          setGigs(gigsData);

          const applicantResponses = await Promise.all(
            gigsData.map(async (gig: Gig) => {
              try {
                const appResponse = await getGigApplications(token, gig.id);
                if (!appResponse?.success || !Array.isArray(appResponse.data)) {
                  return [];
                }

                return appResponse.data
                  .map((application: any) => {
                    const musicianSource =
                      application.musician || application.musicianId || {};
                    const rawRecipientUserId =
                      application.musician?.userId ||
                      application.musicianId?.userId?._id ||
                      application.musicianId?.userId ||
                      (typeof application.musician?.userId === "string"
                        ? application.musician.userId
                        : "");

                    if (!rawRecipientUserId) {
                      return null;
                    }

                    return {
                      id:
                        application.id ||
                        application._id ||
                        `${gig.id}-${rawRecipientUserId}`,
                      recipientUserId: String(rawRecipientUserId),
                      name:
                        musicianSource.stageName ||
                        musicianSource.username ||
                        "Unknown Musician",
                      role: musicianSource.instruments?.[0] || "Musician",
                      gigTitle: gig.title,
                      gigId: gig.id,
                      status: application.status || "pending",
                    } satisfies ApplicantItem;
                  })
                  .filter(Boolean) as ApplicantItem[];
              } catch {
                return [];
              }
            }),
          );

          const statusPriority: Record<string, number> = {
            pending: 0,
            accepted: 1,
            rejected: 2,
          };

          const flattenedApplicants = applicantResponses
            .flat()
            .sort((first, second) => {
              const firstPriority =
                statusPriority[first.status?.toLowerCase()] ?? 9;
              const secondPriority =
                statusPriority[second.status?.toLowerCase()] ?? 9;
              return firstPriority - secondPriority;
            });

          setAllApplicants(flattenedApplicants);
        }
      } catch {
        toast.error("Failed to load your gig postings.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyGigs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this gig posting?")) return;
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await deleteGig(token, id);
      if (response.success) {
        setGigs((prev) => prev.filter((gig) => gig.id !== id));
        toast.success("Gig posting deleted successfully.");
      }
    } catch {
      toast.error("Failed to delete gig.");
    }
  };

  const filteredGigs = gigs.filter((gig) => {
    const query = searchTerm.toLowerCase();
    return (
      gig.title.toLowerCase().includes(query) ||
      gig.description.toLowerCase().includes(query) ||
      gig.eventType.toLowerCase().includes(query) ||
      gig.location?.toLowerCase().includes(query)
    );
  });

  const totalGigs = gigs.length;
  const openGigs = gigs.filter((gig) => gig.status === "open").length;
  const closedGigs = gigs.filter((gig) => gig.status !== "open").length;

  const handleMessageApplicant = async (applicant: ApplicantItem) => {
    setMessagingApplicantId(applicant.id);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Please log in to send messages.");
        return;
      }

      const response = await startConversation(
        token,
        applicant.recipientUserId,
      );
      const conversationId = response?.data?._id;

      if (!conversationId) {
        toast.error("Unable to open conversation.");
        return;
      }

      router.push(`/messages/${conversationId}`);
    } catch {
      toast.error("Failed to start conversation.");
    } finally {
      setMessagingApplicantId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading gigs…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OrganizerHeader />

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-24 md:pt-8 pb-16">
        <motion.section
          {...fadeUp(0)}
          className="role-hero-shell mb-6 p-6 md:p-8"
        >
          <div className="role-hero-content flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3 border border-primary/20">
                <Sparkles size={12} className="animate-pulse" />
                Organizer Gigs
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mt-1">
                Manage Your <span className="gradient-text">Gig Posts</span>
              </h1>
              <p className="mt-2 max-w-lg text-muted-foreground font-medium">
                Track postings, monitor statuses, and manage applicants from one
                place.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  {totalGigs} Total Posts
                </span>
                <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold text-success">
                  {openGigs} Open
                </span>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/75">
                  {closedGigs} Closed / Filled
                </span>
              </div>
            </div>

            {canPostGig ? (
              <Link
                href="/organizer/gigs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-colors shadow-sm shrink-0"
              >
                <Plus size={16} />
                Post New Gig
              </Link>
            ) : (
              <Link
                href="/organizer/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-warning/30 bg-warning/10 text-warning text-sm font-semibold hover:bg-warning/15 transition-colors shrink-0"
              >
                Verify to Post Gigs
              </Link>
            )}
          </div>
        </motion.section>

        {!canPostGig && (
          <motion.div
            {...fadeUp(0.06)}
            className="mb-6 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning"
          >
            Your organizer profile is not verified yet. Complete verification to
            post new gigs.
          </motion.div>
        )}

        <motion.div
          {...fadeUp(0.08)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
              Total Posts
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {totalGigs}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
              Open
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {openGigs}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
              Closed / Filled
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {closedGigs}
            </p>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search your gigs..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-card/90 backdrop-blur-sm border border-border/60 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        <motion.div {...fadeUp(0.11)} className="mb-5 flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsApplicantsOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/90 px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/30 transition-colors"
            >
              View All Applications
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  isApplicantsOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {isApplicantsOpen && (
              <div className="absolute right-0 top-full mt-2 z-20 w-[340px] max-h-[360px] overflow-y-auto rounded-xl border border-border/60 bg-card/95 backdrop-blur-sm p-2 shadow-sm">
                {allApplicants.length > 0 ? (
                  <div className="space-y-2">
                    {allApplicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        className="rounded-lg border border-border/60 p-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {applicant.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {applicant.gigTitle}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${applicantStatusClass(applicant.status)}`}
                          >
                            {applicant.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-3">
                          <Link
                            href={`/organizer/gigs/${applicant.gigId}/applications`}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleMessageApplicant(applicant)}
                            disabled={messagingApplicantId === applicant.id}
                            className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                          >
                            {messagingApplicantId === applicant.id
                              ? "Opening..."
                              : "Message"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-2 text-sm text-muted-foreground">
                    No applications yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredGigs.map((gig, idx) => (
                <motion.div
                  key={gig.id}
                  layout
                  {...fadeUp(0.12 + idx * 0.03)}
                  className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                        {gig.eventType}
                      </p>
                      <h3 className="text-xl font-semibold mt-2 text-foreground truncate">
                        {gig.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(gig.id)}
                      className="h-9 w-9 rounded-lg border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-5">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary/70" />
                      {gig.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-primary/70" />
                      <span className="text-foreground font-semibold">
                        Rs. {gig.payRate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary/70" />
                      {gig.deadline
                        ? new Date(gig.deadline).toLocaleDateString()
                        : "No deadline"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-primary/70" />
                      Status:{" "}
                      <span className="capitalize text-foreground">
                        {gig.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border/60">
                    <Link
                      href={`/organizer/gigs/${gig.id}/applications`}
                      className="flex-1 py-2.5 rounded-lg border border-border/60 text-center text-xs font-semibold uppercase tracking-wide hover:bg-secondary/30 transition-colors"
                    >
                      Applications
                    </Link>
                    <Link
                      href={`/organizer/gigs/${gig.id}/edit`}
                      className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-center text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition-colors shadow-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              {...fadeUp(0.12)}
              className="text-center py-16 px-6 rounded-3xl border border-dashed border-border/60 bg-secondary/5"
            >
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/40">
                <Briefcase size={30} />
              </div>
              <h2 className="text-xl font-semibold mb-1">No gigs found</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Create your first gig posting to start receiving applications.
              </p>
              {canPostGig ? (
                <Link
                  href="/organizer/gigs/new"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-colors"
                >
                  Post a Gig <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  href="/organizer/profile"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 text-sm font-semibold hover:bg-secondary/30 transition-colors"
                >
                  Complete Verification <ArrowRight size={14} />
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
