"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getGigApplications,
  updateApplicationStatus,
} from "@/lib/api/application";
import { getGigById, Gig } from "@/lib/api/gig";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  User,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { getAuthToken } from "@/lib/cookies";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/utils";
import { startConversation } from "@/lib/api/message";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function GigApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [gig, setGig] = useState<Gig | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const [gigRes, appRes] = await Promise.all([
        getGigById(id as string),
        getGigApplications(token, id as string),
      ]);

      if (gigRes.success) setGig(gigRes.data);
      if (appRes.success) setApplications(appRes.data || []);
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleStatusUpdate = async (
    appId: string,
    status: "accepted" | "rejected",
  ) => {
    setProcessingId(appId);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await updateApplicationStatus(token, appId, status);
      if (response.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status } : app)),
        );
        toast.success(`Application ${status}.`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMessageApplicant = async (app: any) => {
    const recipientId = (
      app?.musician?.userId ||
      app?.musicianId?.userId?._id ||
      app?.musicianId?.userId ||
      ""
    )
      .toString()
      .trim();

    if (!recipientId) {
      toast.error("Unable to find applicant profile.");
      return;
    }

    setMessagingId(app.id);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Please log in to send messages.");
        return;
      }

      const response = await startConversation(token, recipientId);
      const conversationId = response?.data?._id;

      if (!conversationId) {
        toast.error("Unable to open conversation.");
        return;
      }

      router.push(`/messages/${conversationId}`);
    } catch {
      toast.error("Failed to start conversation.");
    } finally {
      setMessagingId(null);
    }
  };

  const statusPillClass = (status: string) => {
    if (status === "accepted")
      return "bg-success/10 text-success border-success/25";
    if (status === "rejected")
      return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-warning/10 text-warning border-warning/25";
  };

  const pendingCount = applications.filter(
    (app) => app.status === "pending",
  ).length;
  const acceptedCount = applications.filter(
    (app) => app.status === "accepted",
  ).length;
  const rejectedCount = applications.filter(
    (app) => app.status === "rejected",
  ).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <OrganizerHeader />

      <main className="mx-auto max-w-6xl px-5 lg:px-8 pt-32">
        <motion.div {...fadeUp(0)} className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/organizer/gigs")}
            className="p-2.5 rounded-xl bg-card border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Talent Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reviewing applicants for{" "}
              <span className="font-medium text-foreground">{gig?.title}</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp(0.03)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
              Pending
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
              Accepted
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {acceptedCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
              Rejected
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {rejectedCount}
            </p>
          </div>
        </motion.div>

        {applications.length === 0 ? (
          <motion.div
            {...fadeUp(0.06)}
            className="rounded-3xl border border-dashed border-border/60 bg-secondary/5 p-14 text-center"
          >
            <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={24} className="text-primary/50" />
            </div>
            <h2 className="text-xl font-semibold mb-1">No applications yet</h2>
            <p className="text-muted-foreground">
              Applications will appear here as musicians apply.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  {...fadeUp(index * 0.03)}
                  className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-16 w-16 rounded-2xl bg-secondary border border-border/60 overflow-hidden flex items-center justify-center">
                        {app.musician?.profilePicture ? (
                          <img
                            src={resolveMediaUrl(app.musician.profilePicture)}
                            alt={app.musician.stageName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={22} className="text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold truncate">
                            {app.musician?.stageName}
                          </h3>
                          <ShieldCheck size={16} className="text-primary" />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {app.musician?.instruments
                            ?.slice(0, 3)
                            .map((inst: string, idx: number) => (
                              <span
                                key={`${inst}-${idx}`}
                                className="px-2 py-0.5 rounded-full bg-secondary text-[10px] uppercase tracking-wide text-muted-foreground font-semibold"
                              >
                                {inst}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${statusPillClass(app.status)}`}
                      >
                        {app.status === "pending" ? (
                          <Clock size={12} />
                        ) : app.status === "accepted" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {app.status}
                      </span>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Link
                          href={`/musician/profile/${app.musicianId}`}
                          className="px-3 py-2 rounded-lg border border-border/60 text-xs font-semibold uppercase tracking-wide hover:bg-secondary/30 transition-colors inline-flex items-center gap-1"
                        >
                          Profile <ExternalLink size={12} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleMessageApplicant(app)}
                          disabled={messagingId === app.id}
                          className="px-3 py-2 rounded-lg border border-border/60 text-xs font-semibold uppercase tracking-wide hover:bg-secondary/30 transition-colors inline-flex items-center gap-1 disabled:opacity-60"
                        >
                          <MessageSquare size={12} />
                          {messagingId === app.id ? "Opening" : "Message"}
                        </button>

                        {app.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app.id, "rejected")
                              }
                              disabled={processingId === app.id}
                              className="h-9 w-9 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              <XCircle size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app.id, "accepted")
                              }
                              disabled={processingId === app.id}
                              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              {processingId === app.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              Accept
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
