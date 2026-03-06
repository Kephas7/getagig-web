"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Bell,
  User,
  LogOut,
  MessageSquare,
  Music,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  MapPin,
  Loader2,
  Percent,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Search,
  ChevronLeft,
  Plus,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeLogo from "@/app/_components/ThemeLogo";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { useSocket } from "@/app/context/SocketContext";
import { getMusicianDashboard } from "@/lib/api/dashboard";
import { getAuthToken } from "@/lib/cookies";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "@/lib/toast";
import {
  createMusicianCalendarEvent,
  deleteMusicianCalendarEvent,
  getMusicianCalendarEvents,
} from "@/lib/api/musician";
import { getMusicianApplications } from "@/lib/api/application";
type CalendarEvent = {
  id: string;
  title: string;
  status: string;
  location?: string;
  date: Date;
  source: "gig" | "planned";
  note?: string;
};

type StoredPlannedEvent = {
  id: string;
  title: string;
  date: string;
  note?: string;
};

const ICON_MAP: Record<string, any> = {
  FileText,
  Calendar,
  CheckCircle,
  TrendingUp,
  Percent,
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();
  const cls =
    normalized === "accepted"
      ? "badge-accepted"
      : normalized === "rejected"
        ? "badge-rejected"
        : "badge-pending";
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}

export default function MusicianDashboard() {
  const { user, logout } = useAuth();
  const { unreadCount, notifCount } = useSocket();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [plannedEvents, setPlannedEvents] = useState<StoredPlannedEvent[]>([]);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventNote, setEventNote] = useState("");
  const [syncingEvents, setSyncingEvents] = useState(false);
  const [approvedGigEvents, setApprovedGigEvents] = useState<CalendarEvent[]>(
    [],
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        setProfileMissing(false);

        const calendarPromise = getMusicianCalendarEvents(token).catch(
          (error: any) => {
            if (error?.response?.status === 404) {
              setProfileMissing(true);
              return { success: true, data: [] };
            }
            throw error;
          },
        );

        const applicationsPromise = getMusicianApplications(token).catch(
          (error: any) => {
            if (error?.response?.status === 404) {
              setProfileMissing(true);
              return { success: true, data: [] };
            }
            throw error;
          },
        );

        const [dashboardResponse, calendarResponse, applicationsResponse] =
          await Promise.all([
            getMusicianDashboard(token),
            calendarPromise,
            applicationsPromise,
          ]);

        if (dashboardResponse.success) {
          setData(dashboardResponse.data);
        }

        if (calendarResponse.success && Array.isArray(calendarResponse.data)) {
          setPlannedEvents(
            calendarResponse.data.map((event: any) => ({
              id: event.id,
              title: event.title,
              date: event.date,
              note: event.note,
            })),
          );
        }

        if (
          applicationsResponse?.success &&
          Array.isArray(applicationsResponse.data)
        ) {
          const approvedEvents = applicationsResponse.data
            .filter((application: any) => application?.status === "accepted")
            .map((application: any) => {
              const gig = application?.gig;
              const sourceDate =
                gig?.eventDate || gig?.deadline || application?.createdAt;

              const parsedDate = sourceDate ? new Date(sourceDate) : null;
              if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
                return null;
              }

              const location =
                gig?.location?.trim() || "Location not specified";

              return {
                id:
                  (typeof application?.gigId === "string"
                    ? application.gigId
                    : application?.gigId?._id) ||
                  gig?._id ||
                  application?.id,
                title: gig?.title || "Approved Gig",
                status: "Accepted",
                location,
                date: new Date(
                  parsedDate.getFullYear(),
                  parsedDate.getMonth(),
                  parsedDate.getDate(),
                ),
                source: "gig" as const,
              };
            })
            .filter(Boolean) as CalendarEvent[];

          setApprovedGigEvents(approvedEvents);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          await logout();
          return;
        }

        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center glow-sm">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || [];
  const recentGigs = data?.recentGigs || [];
  const gigEvents = recentGigs
    .map((gig: any) => {
      const parsedDate = gig?.date ? new Date(gig.date) : null;
      if (!parsedDate || Number.isNaN(parsedDate.getTime())) return null;

      return {
        id: gig.id,
        title: gig.title,
        status: gig.status,
        location: gig.location,
        date: new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate(),
        ),
        source: "gig" as const,
      };
    })
    .filter(Boolean) as CalendarEvent[];

  const personalEvents = plannedEvents
    .map((event) => {
      const parsedDate = event?.date ? new Date(event.date) : null;
      if (!parsedDate || Number.isNaN(parsedDate.getTime())) return null;

      return {
        id: event.id,
        title: event.title,
        status: "Planned",
        location: "Personal event",
        date: new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate(),
        ),
        source: "planned" as const,
        note: event.note,
      };
    })
    .filter(Boolean) as CalendarEvent[];

  const allGigEvents = [...gigEvents, ...approvedGigEvents];
  const uniqueGigEvents = allGigEvents.filter((event, index, arr) => {
    const eventKey = `${event.id}-${event.status}-${event.date.toISOString()}`;
    return (
      arr.findIndex(
        (entry) =>
          `${entry.id}-${entry.status}-${entry.date.toISOString()}` ===
          eventKey,
      ) === index
    );
  });

  const events = [...uniqueGigEvents, ...personalEvents];

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStartDay = new Date(year, month, 1).getDay();

  const calendarCells: Array<Date | null> = [
    ...Array(monthStartDay).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(year, month, index + 1),
    ),
  ];

  const isSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDateEventMeta = (dateCell: Date) => {
    const dayEvents = events.filter((event) => isSameDay(event.date, dateCell));

    if (dayEvents.length === 0) {
      return {
        hasEvent: false,
        dotClass: "",
        dayClass: "",
      };
    }

    const isUpcoming = dateCell >= today;

    const hasAcceptedGig = dayEvents.some(
      (event) =>
        event.source === "gig" && event.status?.toLowerCase() === "accepted",
    );
    const hasPlanned = dayEvents.some((event) => event.source === "planned");

    if (!isUpcoming) {
      return {
        hasEvent: true,
        dotClass: "bg-foreground/40",
        dayClass: "",
      };
    }

    if (hasAcceptedGig && hasPlanned) {
      return {
        hasEvent: true,
        dotClass: "bg-warning",
        dayClass:
          "border-warning/40 bg-warning/10 text-warning hover:border-warning/60",
      };
    }

    if (hasAcceptedGig) {
      return {
        hasEvent: true,
        dotClass: "bg-success",
        dayClass:
          "border-success/40 bg-success/10 text-success hover:border-success/60",
      };
    }

    return {
      hasEvent: true,
      dotClass: "bg-primary",
      dayClass:
        "border-primary/40 bg-primary/10 text-primary hover:border-primary/60",
    };
  };

  const selectedDateEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate),
  );

  const upcomingEvents = [...events]
    .filter((event) => {
      return event.date >= today;
    })
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, 4);

  const goToPreviousMonth = () => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleOpenAddEventForm = (dateOverride?: Date) => {
    const targetDate = dateOverride || selectedDate;
    setShowAddEventForm(true);
    setEventTitle("");
    setEventNote("");
    setEventDate(toDateInputValue(targetDate));
  };

  const handleAddEvent = async () => {
    const trimmedTitle = eventTitle.trim();
    if (!trimmedTitle) {
      toast.error("Event title is required");
      return;
    }

    if (!eventDate) {
      toast.error("Event date is required");
      return;
    }

    const parsedDate = new Date(eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Please select a valid date");
      return;
    }

    const normalizedDate = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
    );

    setSyncingEvents(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("You need to be logged in");
        return;
      }

      const response = await createMusicianCalendarEvent(token, {
        title: trimmedTitle,
        date: normalizedDate.toISOString(),
        note: eventNote.trim() || undefined,
      });

      if (response?.success && response?.data) {
        setPlannedEvents((prev) => [
          ...prev,
          {
            id: response.data.id,
            title: response.data.title,
            date: response.data.date,
            note: response.data.note,
          },
        ]);

        setSelectedDate(normalizedDate);
        setCalendarMonth(
          new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1),
        );
        setShowAddEventForm(false);
        setEventTitle("");
        setEventDate("");
        setEventNote("");
        toast.success("Event added to calendar");
      }
    } catch (error) {
      toast.error("Failed to save calendar event");
    } finally {
      setSyncingEvents(false);
    }
  };

  const handleDeletePlannedEvent = async (eventId: string) => {
    setSyncingEvents(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("You need to be logged in");
        return;
      }

      await deleteMusicianCalendarEvent(token, eventId);
      setPlannedEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success("Planned event removed");
    } catch (error) {
      toast.error("Failed to delete calendar event");
    } finally {
      setSyncingEvents(false);
    }
  };
  const displayName =
    user?.username || user?.email?.split("@")[0] || "Musician";

  const acceptedUpcomingCount = upcomingEvents.filter(
    (event) =>
      event.source === "gig" && event.status?.toLowerCase() === "accepted",
  ).length;
  const plannedCount = events.filter(
    (event) => event.source === "planned",
  ).length;
  const thisMonthCount = events.filter(
    (event) =>
      event.date.getMonth() === calendarMonth.getMonth() &&
      event.date.getFullYear() === calendarMonth.getFullYear(),
  ).length;

  const musicianNavLinks = [
    { label: "Dashboard", href: "/musician", icon: Home },
    { label: "Browse Gigs", href: "/musician/gigs", icon: Search },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: true },
    { label: "Profile", href: "/musician/profile", icon: User },
  ];

  const isNavLinkActive = (href: string) => {
    if (href === "/musician") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
        onFocusCapture={() => setSidebarCollapsed(false)}
        onBlurCapture={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setSidebarCollapsed(true);
          }
        }}
        className={`fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-border/70 bg-card/80 backdrop-blur-xl transition-all duration-300 md:flex ${
          sidebarCollapsed ? "w-24" : "w-72"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className={`border-b border-border/60 ${
              sidebarCollapsed ? "p-2" : "p-5"
            }`}
          >
            <div className="flex w-full items-center justify-center">
              <Link
                href="/musician"
                className="inline-flex w-full items-center justify-center"
                aria-label="Musician dashboard"
              >
                <div
                  className={`${
                    sidebarCollapsed
                      ? "h-10 w-full px-1"
                      : "h-[4.25rem] w-full px-0"
                  } flex items-center justify-center overflow-hidden`}
                >
                  <ThemeLogo
                    width={460}
                    height={160}
                    className={`h-full w-full ${
                      sidebarCollapsed
                        ? "object-contain object-center scale-[1.12] origin-center"
                        : "object-contain object-center scale-[1.85] origin-center"
                    }`}
                  />
                </div>
              </Link>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 p-3">
            {musicianNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isNavLinkActive(link.href);
              const showBadge = link.badge && unreadCount > 0 && !isActive;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={sidebarCollapsed ? link.label : undefined}
                  className={`flex items-center rounded-xl py-2.5 transition-all duration-200 ${
                    sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3.5"
                  } ${
                    isActive
                      ? "bg-primary/12 text-foreground ring-1 ring-primary/35"
                      : "text-foreground/65 hover:bg-foreground/6 hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon
                      size={18}
                      className={
                        isActive ? "text-primary" : "text-foreground/60"
                      }
                    />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive text-white text-[8px] font-black flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{link.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-border/60 p-3">
            <Link
              href="/notifications"
              title={sidebarCollapsed ? "Notifications" : undefined}
              className={`relative flex items-center rounded-xl border border-border/60 bg-background/70 py-2 text-foreground/70 transition-colors hover:border-primary/30 hover:text-foreground ${
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-between gap-2 px-3"
              }`}
            >
              <div className="relative inline-flex items-center gap-2">
                <Bell size={16} />
                {!sidebarCollapsed && (
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Notifications
                  </span>
                )}
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full bg-destructive px-1 text-[9px] font-black text-white flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </div>
            </Link>

            <div
              className={`flex items-center rounded-xl border border-border/60 bg-background/70 py-2 ${
                sidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-between px-3"
              }`}
            >
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Appearance
                </span>
              )}
              <ThemeToggle />
            </div>

            {user && !sidebarCollapsed && (
              <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-foreground/50">
                  Logged in as
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {user.email}
                </p>
              </div>
            )}

            <button
              onClick={logout}
              title={sidebarCollapsed ? "Sign out" : undefined}
              className={`w-full inline-flex items-center rounded-xl border border-border/60 font-semibold text-foreground/70 transition-colors hover:bg-error/10 hover:text-error ${
                sidebarCollapsed
                  ? "justify-center px-2 py-2.5"
                  : "justify-center gap-2 px-4 py-2 text-sm"
              }`}
            >
              <LogOut size={15} />
              {!sidebarCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <main className="relative z-10 mx-auto w-full max-w-6xl px-5 lg:px-8 pt-8 md:pt-10 pb-16">
          <div className="mb-6 space-y-3 md:hidden">
            <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm flex items-center justify-between gap-3">
              <Link
                href="/musician"
                className="inline-flex items-center shrink-0"
              >
                <div className="h-10 w-28 flex items-center justify-center overflow-hidden">
                  <ThemeLogo
                    width={320}
                    height={120}
                    className="h-full w-full object-contain object-center"
                  />
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border/60 text-foreground/70 hover:bg-error/10 hover:text-error transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {musicianNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isNavLinkActive(link.href);
                return (
                  <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-primary/35 bg-primary/10 text-primary"
                        : "border-border/60 bg-card text-foreground/75"
                    }`}
                  >
                    <Icon size={13} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 items-start">
            <div>
              {/* Hero header */}
              <motion.section
                {...fadeUp(0.05)}
                id="dashboard-overview"
                className="relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 md:p-8 shadow-sm"
              >
                <div className="absolute inset-0 mesh-gradient opacity-30" />
                <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3 border border-primary/20">
                      <Sparkles size={12} className="animate-pulse" />
                      Musician Dashboard
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mt-1">
                      Welcome back,{" "}
                      <span className="gradient-text">{displayName}</span>!
                    </h1>
                    <p className="mt-2 max-w-lg text-muted-foreground font-medium">
                      Here's what's happening with your musical journey today.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold text-success">
                        {acceptedUpcomingCount} Accepted Upcoming
                      </span>
                      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                        {plannedCount} Planned Events
                      </span>
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/75">
                        {thisMonthCount} Events This Month
                      </span>
                    </div>
                  </div>
                  {profileMissing ? (
                    <Link
                      href="/musician/profile/edit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-warning/30 bg-warning/10 text-warning text-sm font-semibold hover:bg-warning/15 transition-colors shrink-0"
                    >
                      <User size={16} />
                      Complete Profile
                    </Link>
                  ) : (
                    <Link
                      href="/musician/gigs"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-colors shadow-sm shrink-0"
                    >
                      <Search size={16} />
                      Find Gigs
                    </Link>
                  )}
                </div>
              </motion.section>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat: any, index: number) => {
                  const Icon = ICON_MAP[stat.icon] || FileText;
                  return (
                    <motion.div
                      key={stat.label}
                      {...fadeUp(0.08 + 0.05 * index)}
                      className="group relative rounded-2xl border border-border/60 bg-card p-5 overflow-hidden hover:border-primary/30 transition-colors duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-semibold text-foreground">
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-xl border border-border/50 ${stat.bg || "bg-primary/10"} group-hover:scale-110 transition-transform`}
                        >
                          <Icon
                            className={`h-5 w-5 ${stat.color || "text-primary"}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 items-start">
                {/* Recent Activities */}
                <motion.div {...fadeUp(0.2)} id="dashboard-activity">
                  <div className="flex items-center justify-between mb-5 px-1">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Recent Activities
                    </h2>
                    <Link
                      href="/musician/applications"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      View All <ChevronRight size={14} />
                    </Link>
                  </div>

                  {recentGigs.length > 0 ? (
                    <div className="space-y-3">
                      {recentGigs.map((gig: any, idx: number) => (
                        <motion.div
                          key={gig.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.06 }}
                        >
                          <Link
                            href={`/musician/gigs/${gig.id}`}
                            className="group flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/2 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                                <Music size={20} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-sm leading-tight">
                                  {gig.title}
                                </h3>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} /> {gig.date}
                                  </span>
                                  {gig.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin size={10} /> {gig.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={gig.status} />
                              <ArrowRight
                                size={14}
                                className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                              />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center border border-dashed border-border/60 rounded-2xl bg-secondary/5">
                      <div className="h-16 w-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                        <Music size={30} className="text-primary/30" />
                      </div>
                      <p className="font-semibold text-foreground mb-1">
                        No applications yet
                      </p>
                      <p className="text-sm text-muted-foreground mb-5">
                        Start browsing gigs to kickstart your journey.
                      </p>
                      <Link
                        href="/musician/gigs"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:opacity-90"
                      >
                        Browse Gigs <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <motion.section
                  {...fadeUp(0.35)}
                  id="dashboard-calendar"
                  className="lg:col-span-2 rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <Calendar size={18} className="text-primary" />
                        Gig Calendar
                      </h2>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        Track your accepted and pending gigs by date.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAddEventForm()}
                        className="h-9 rounded-xl border border-border/70 bg-background/70 px-3 text-xs font-bold text-foreground/80 hover:text-foreground hover:border-primary/30 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Add Event
                      </button>

                      <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-background/70 p-1">
                        <button
                          type="button"
                          onClick={goToPreviousMonth}
                          className="h-8 w-8 rounded-lg text-foreground/80 hover:bg-secondary/50 hover:text-foreground transition-colors inline-flex items-center justify-center"
                          aria-label="Previous month"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span className="min-w-[138px] text-center text-sm font-semibold text-foreground px-1">
                          {calendarMonth.toLocaleDateString(undefined, {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={goToNextMonth}
                          className="h-8 w-8 rounded-lg text-foreground/80 hover:bg-secondary/50 hover:text-foreground transition-colors inline-flex items-center justify-center"
                          aria-label="Next month"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl border border-border/60 bg-background/50 p-3">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-success" />{" "}
                        Approved Gig
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />{" "}
                        Planned Event
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-warning" />{" "}
                        Mixed Day
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                        {thisMonthCount} This Month
                      </span>
                      <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold text-success">
                        {acceptedUpcomingCount} Accepted Upcoming
                      </span>
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/75">
                        {upcomingEvents.length} Upcoming
                      </span>
                    </div>
                  </div>

                  <div className="mb-2 grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="rounded-lg border border-border/40 bg-background/40 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarCells.map((dateCell, index) => {
                      if (!dateCell) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="h-16 rounded-xl border border-transparent"
                          />
                        );
                      }

                      const { hasEvent, dotClass, dayClass } =
                        getDateEventMeta(dateCell);
                      const isSelected = isSameDay(dateCell, selectedDate);

                      return (
                        <button
                          key={dateCell.toISOString()}
                          type="button"
                          onClick={() => {
                            setSelectedDate(dateCell);
                            handleOpenAddEventForm(dateCell);
                          }}
                          className={`h-16 rounded-xl border text-sm font-semibold transition-all relative ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_20px_-14px_rgba(0,0,0,0.45)]"
                              : dayClass ||
                                "border-border/60 bg-background/50 text-foreground hover:border-primary/30"
                          }`}
                        >
                          {dateCell.getDate()}
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
                </motion.section>

                <motion.aside
                  {...fadeUp(0.4)}
                  id="dashboard-schedule"
                  className="rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-sm lg:sticky lg:top-28"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-primary" />
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {selectedDate.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                  </div>

                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={`${event.id}-${event.date.toISOString()}`}
                          className="rounded-2xl border border-border/60 bg-background/70 p-3 hover:border-primary/30 transition-colors"
                        >
                          {event.source === "gig" ? (
                            <Link
                              href={`/musician/gigs/${event.id}`}
                              className="block"
                            >
                              <p className="text-sm font-bold text-foreground line-clamp-1">
                                {event.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {event.location || "Location not specified"}
                              </p>
                              <div className="mt-2">
                                <StatusBadge status={event.status} />
                              </div>
                            </Link>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-foreground line-clamp-1">
                                    {event.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {event.note || "Personal planning event"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeletePlannedEvent(event.id)
                                  }
                                  disabled={syncingEvents}
                                  className="text-foreground/50 hover:text-error transition-colors shrink-0 disabled:opacity-50"
                                  aria-label="Delete planned event"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <div className="mt-2">
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide border border-primary/20 bg-primary/10 text-primary">
                                  Planned
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/10 p-4 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        No gigs on this date
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select another date or browse new gigs.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-border/60">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                      Upcoming
                    </p>
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-2.5">
                        {upcomingEvents.map((event) => (
                          <div
                            key={`upcoming-${event.id}-${event.date.toISOString()}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2 hover:border-primary/30 transition-colors"
                          >
                            {event.source === "gig" ? (
                              <Link
                                href={`/musician/gigs/${event.id}`}
                                className="flex items-center justify-between gap-3 w-full"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {event.title}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {event.date.toLocaleDateString()}
                                  </p>
                                </div>
                                <ChevronRight
                                  size={14}
                                  className="text-muted-foreground/60 shrink-0"
                                />
                              </Link>
                            ) : (
                              <div className="flex items-center justify-between gap-3 w-full">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {event.title}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {event.date.toLocaleDateString()}
                                  </p>
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                                  Planned
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No upcoming gigs yet.
                      </p>
                    )}
                  </div>
                </motion.aside>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAddEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">
              Add Calendar Event
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan your schedule by adding a personal event.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(event) => setEventTitle(event.target.value)}
                  placeholder="Practice session, travel, rehearsal..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={eventNote}
                  onChange={(event) => setEventNote(event.target.value)}
                  placeholder="Extra details"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddEventForm(false)}
                disabled={syncingEvents}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEvent}
                disabled={syncingEvents}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {syncingEvents ? "Saving..." : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
