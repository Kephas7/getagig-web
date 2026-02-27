"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
} from "@/lib/api/notification";
import { getAuthToken } from "@/lib/cookies";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Briefcase,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

const TYPE_META: Record<
  Notification["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  new_message: {
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  new_application: {
    icon: Briefcase,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  application_accepted: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  application_rejected: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  gig_update: {
    icon: Info,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  system: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await getNotifications(token);
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time: add new notifications at the top
  useEffect(() => {
    if (!socket) return;
    const handleNew = (notif: any) => {
      setNotifications((prev) => [notif, ...prev]);
    };
    socket.on("receiveNotification", handleNew);
    return () => {
      socket.off("receiveNotification", handleNew);
    };
  }, [socket]);

  const handleMark = async (id: string) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      await markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
    setMarkingAll(false);
  };

  const handleNotificationClick = (notif: Notification) => {
    handleMark(notif._id);
    // Navigate to relevant page based on notification type
    if (notif.type === "new_message" && notif.relatedId) {
      router.push(`/messages`);
    } else if (notif.type === "new_application" && notif.relatedId) {
      router.push(
        user?.role === "organizer"
          ? `/organizer/gigs`
          : `/musician/applications`
      );
    } else if (
      (notif.type === "application_accepted" ||
        notif.type === "application_rejected") &&
      notif.relatedId
    ) {
      router.push(`/musician/applications`);
    }
  };

  const Header =
    user?.role === "organizer" ? OrganizerHeader : MusicianHeader;
  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-6 lg:px-8 pt-32 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black tracking-tight text-foreground"
            >
              Notifications
            </motion.h1>
            {unread > 0 && (
              <p className="mt-1 text-sm text-muted-foreground font-medium">
                {unread} unread notification{unread !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary text-sm font-bold transition-all"
            >
              {markingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center border-2 border-dashed border-border/60 rounded-[3rem] bg-secondary/5"
          >
            <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={36} className="text-primary/30" />
            </div>
            <h2 className="text-xl font-black">All caught up!</h2>
            <p className="text-muted-foreground font-medium mt-2">
              You have no notifications yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => {
                const meta = TYPE_META[notif.type] || TYPE_META.system;
                const Icon = meta.icon;
                return (
                  <motion.button
                    key={notif._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left flex items-start gap-5 p-5 rounded-3xl border transition-all duration-200 ${
                      notif.isRead
                        ? "bg-card/50 border-border/40 opacity-70"
                        : "bg-card border-border/70 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}
                    >
                      <Icon size={22} className={meta.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-sm font-bold ${
                            notif.isRead ? "text-foreground/70" : "text-foreground"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {timeAgo(notif.createdAt)}
                          </span>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                        {notif.content}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </main>
    </div>
  );
}
