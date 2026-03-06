"use client";

import { useEffect, useMemo, useState } from "react";
import OrganizerHeader from "./_components/OrganizerHeader";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  MessageSquare,
  Activity,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getOrganizerDashboard } from "@/lib/api/dashboard";
import { getAuthToken } from "@/lib/cookies";
import { useAuth } from "@/app/context/AuthContext";
import { getOrganizerProfile } from "@/lib/api/organizer";
import { getGigs, Gig } from "@/lib/api/gig";
import { getGigApplications } from "@/lib/api/application";
import { startConversation } from "@/lib/api/message";
import { toast } from "@/lib/toast";

const ICON_MAP: Record<string, any> = {
  Briefcase,
  Users,
  MessageSquare,
  Activity,
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

type OrganizerEvent = {
  id: string;
  title: string;
  date: Date;
  location?: string;
  status: string;
};

type ApplicantItem = {
  id: string;
  recipientUserId: string;
  name: string;
  role: string;
  gigTitle: string;
  gigId: string;
  status: string;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  const cls =
    normalized === "accepted" || normalized === "open"
      ? "badge-accepted"
      : normalized === "rejected" ||
          normalized === "closed" ||
          normalized === "filled"
        ? "badge-rejected"
        : "badge-pending";

  const label = normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "Unknown";

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [allApplicants, setAllApplicants] = useState<ApplicantItem[]>([]);
  const [messagingApplicantId, setMessagingApplicantId] = useState<
    string | null
  >(null);
  const [canPostGig, setCanPostGig] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const [dashboardResponse, profileResponse] = await Promise.all([
          getOrganizerDashboard(token),
          getOrganizerProfile(token),
        ]);

        if (dashboardResponse?.success) {
          setData(dashboardResponse.data);
        }

        if (profileResponse?.success) {
          setCanPostGig(Boolean(profileResponse.data?.isVerified));
          const organizerId = profileResponse.data.id;
          const gigsResponse = await getGigs({ organizerId, limit: 100 });

          if (gigsResponse?.success && Array.isArray(gigsResponse.data?.gigs)) {
            const gigs = gigsResponse.data.gigs as Gig[];

            const mappedEvents: OrganizerEvent[] = gigs
              .map((gig: Gig) => {
                const sourceDate = gig.eventDate || gig.deadline;
                const parsedDate = sourceDate ? new Date(sourceDate) : null;
                if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
                  return null;
                }

                const location =
                  gig.location?.trim() || "Location not specified";

                return {
                  id: gig.id,
                  title: gig.title,
                  date: new Date(
                    parsedDate.getFullYear(),
                    parsedDate.getMonth(),
                    parsedDate.getDate(),
                  ),
                  location,
                  status: gig.status,
                };
              })
              .filter(Boolean) as OrganizerEvent[];

            setEvents(mappedEvents);

            const applicantResponses = await Promise.all(
              gigs.map(async (gig) => {
                try {
                  const response = await getGigApplications(token, gig.id);
                  if (!response?.success || !Array.isArray(response.data)) {
                    return [];
                  }

                  return response.data
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
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = data?.stats || [];
  const displayName =
    user?.username || user?.email?.split("@")[0] || "Organizer";

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

  const monthLabel = calendarMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const monthDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmpty = firstDay.getDay();

    const items: Array<{ date: Date | null; key: string }> = [];

    for (let i = 0; i < leadingEmpty; i += 1) {
      items.push({ date: null, key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      items.push({ date, key: date.toISOString() });
    }

    return items;
  }, [calendarMonth]);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDateEventMeta = (date: Date) => {
    const dayEvents = events.filter((event) => sameDay(event.date, date));

    if (dayEvents.length === 0) {
      return {
        hasEvent: false,
        dotClass: "",
        dayClass: "",
      };
    }

    const hasOpen = dayEvents.some(
      (event) => event.status?.toLowerCase() === "open",
    );
    const hasFilled = dayEvents.some(
      (event) => event.status?.toLowerCase() === "filled",
    );
    const hasClosed = dayEvents.some(
      (event) => event.status?.toLowerCase() === "closed",
    );
    const isPast = date < today;

    if (isPast) {
      return {
        hasEvent: true,
        dotClass: "bg-foreground/40",
        dayClass: "",
      };
    }

    if (hasOpen && (hasFilled || hasClosed)) {
      return {
        hasEvent: true,
        dotClass: "bg-primary/70",
        dayClass:
          "border-primary/25 bg-primary/5 text-foreground hover:border-primary/40",
      };
    }

    if (hasOpen) {
      return {
        hasEvent: true,
        dotClass: "bg-primary",
        dayClass:
          "border-primary/40 bg-primary/10 text-primary hover:border-primary/60",
      };
    }

    if (hasFilled) {
      return {
        hasEvent: true,
        dotClass: "bg-success",
        dayClass:
          "border-success/40 bg-success/10 text-success hover:border-success/60",
      };
    }

    return {
      hasEvent: true,
      dotClass: "bg-foreground/60",
      dayClass:
        "border-border/70 bg-secondary/20 text-foreground/80 hover:border-border",
    };
  };

  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => sameDay(event.date, selectedDate)),
    [events, selectedDate],
  );

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((event) => event.date >= today)
        .sort((first, second) => first.date.getTime() - second.date.getTime())
        .slice(0, 4),
    [events],
  );

  const thisMonthCount = useMemo(
    () =>
      events.filter(
        (event) =>
          event.date.getMonth() === calendarMonth.getMonth() &&
          event.date.getFullYear() === calendarMonth.getFullYear(),
      ).length,
    [events, calendarMonth],
  );

  const applicantSummary = useMemo(
    () =>
      allApplicants.reduce(
        (summary, applicant) => {
          const normalizedStatus = applicant.status?.toLowerCase();
          if (normalizedStatus === "accepted") {
            summary.accepted += 1;
            return summary;
          }

          if (normalizedStatus === "rejected") {
            summary.rejected += 1;
            return summary;
          }

          summary.pending += 1;
          return summary;
        },
        { pending: 0, accepted: 0, rejected: 0 },
      ),
    [allApplicants],
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <OrganizerHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 pt-24 md:pt-8 pb-16 space-y-7">
        <motion.section {...fadeUp(0)} className="role-hero-shell p-6 md:p-8">
          <div className="role-hero-content flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3 border border-primary/20">
                <Sparkles size={12} className="animate-pulse" />
                Organizer Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mt-1">
                Welcome back,{" "}
                <span className="gradient-text">{displayName}</span>!
              </h1>
              <p className="mt-2 max-w-lg text-muted-foreground font-medium">
                Manage gigs, applications, and upcoming events in one place.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/75">
                  {applicantSummary.pending} Pending Applications
                </span>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  {thisMonthCount} Gigs This Month
                </span>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/75">
                  {upcomingEvents.length} Upcoming
                </span>
              </div>
            </div>
            {canPostGig ? (
              <Link
                href="/organizer/gigs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-colors shadow-sm shrink-0"
              >
                <PlusCircle size={16} />
                Post a Gig
              </Link>
            ) : (
              <Link
                href="/organizer/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-warning/30 bg-warning/10 text-warning text-sm font-semibold hover:bg-warning/15 transition-colors shrink-0"
              >
                Complete Verification
              </Link>
            )}
          </div>
        </motion.section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat: any, index: number) => {
            const Icon = ICON_MAP[stat.icon] || Briefcase;
            return (
              <motion.div
                key={stat.label}
                {...fadeUp(0.05 * index)}
                className="group rounded-2xl border border-border/60 bg-card/85 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon size={18} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.section
            {...fadeUp(0.1)}
            className="xl:col-span-2 rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-sm"
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Calendar size={18} className="text-primary" />
                  Gig Calendar
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  Track your gig dates and statuses by day.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-background/70 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                    )
                  }
                  className="h-8 w-8 rounded-lg text-foreground/80 hover:bg-secondary/50 hover:text-foreground transition-colors inline-flex items-center justify-center"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="min-w-[138px] text-center text-sm font-semibold text-foreground px-1">
                  {monthLabel}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                    )
                  }
                  className="h-8 w-8 rounded-lg text-foreground/80 hover:bg-secondary/50 hover:text-foreground transition-colors inline-flex items-center justify-center"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-border/60 bg-background/50 p-3">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Open Gig
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" /> Filled
                  Gig
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary/70" /> Mixed
                  Day
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-foreground/40" />{" "}
                  Past Date
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  {thisMonthCount} This Month
                </span>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/75">
                  {upcomingEvents.length} Upcoming
                </span>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-2">
              {DAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-border/40 bg-background/40 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDays.map(({ date, key }) => {
                if (!date) {
                  return (
                    <div
                      key={key}
                      className="h-16 rounded-xl border border-transparent"
                    />
                  );
                }

                const isSelected = sameDay(date, selectedDate);
                const { hasEvent, dotClass, dayClass } = getDateEventMeta(date);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`h-16 rounded-xl border text-sm font-semibold relative transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_10px_20px_-14px_rgba(0,0,0,0.45)]"
                        : dayClass ||
                          "border-border/60 bg-background/50 text-foreground hover:border-primary/30"
                    }`}
                  >
                    {date.getDate()}
                    {hasEvent && (
                      <span
                        className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                          isSelected ? "bg-primary-foreground" : dotClass
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-border/60">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Events on{" "}
                {selectedDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>

              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-2">
                  {eventsForSelectedDate.map((event) => (
                    <Link
                      key={`${event.id}-${event.date.toISOString()}`}
                      href={`/organizer/gigs/${event.id}/edit`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2 hover:border-primary/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={12} />
                          {event.location}
                        </p>
                      </div>
                      <StatusBadge status={event.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No events scheduled for this date.
                </p>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-border/60">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Upcoming Schedule
              </h3>

              {upcomingEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={`upcoming-${event.id}-${event.date.toISOString()}`}
                      href={`/organizer/gigs/${event.id}/edit`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2 hover:border-primary/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {event.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {event.date.toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={event.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No upcoming gigs yet.
                </p>
              )}
            </div>
          </motion.section>

          <div className="space-y-6">
            <motion.section
              {...fadeUp(0.2)}
              className="rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Applications Overview
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Dedicated view for all incoming applications.
                  </p>
                </div>
                <Link
                  href="/organizer/gigs"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Open My Gigs
                </Link>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                <span className="inline-flex items-center justify-center rounded-lg border border-primary/25 bg-primary/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {applicantSummary.pending} Pending
                </span>
                <span className="inline-flex items-center justify-center rounded-lg border border-success/25 bg-success/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                  {applicantSummary.accepted} Accepted
                </span>
                <span className="inline-flex items-center justify-center rounded-lg border border-destructive/25 bg-destructive/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                  {applicantSummary.rejected} Rejected
                </span>
              </div>

              {allApplicants.length > 0 ? (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {allApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="rounded-xl border border-border/60 p-3"
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {applicant.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {applicant.role} • {applicant.gigTitle}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusBadge status={applicant.status} />
                        <div className="flex items-center gap-3">
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No applicants yet.
                </p>
              )}
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}
