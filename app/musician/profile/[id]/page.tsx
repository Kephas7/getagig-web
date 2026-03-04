"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMusicianProfileById } from "@/lib/api/musician";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { useAuth } from "@/app/context/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Music,
  User as UserIcon,
  Calendar,
  DollarSign,
  Loader2,
  Mic2,
  MessageSquare,
  Camera,
  Video as VideoIcon,
  CheckCircle2,
} from "lucide-react";
import { getAuthToken } from "@/lib/cookies";
import { startConversation } from "@/lib/api/message";
import { toast } from "@/lib/toast";
import { resolveMediaUrl } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export default function PublicMusicianProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [isMessaging, setIsMessaging] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const response = await getMusicianProfileById(id as string);
        if (response.success && response.data) setProfile(response.data);
      } catch (err: any) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading profile…
          </p>
        </div>
      </div>
    );

  if (error || !profile)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="p-8 bg-destructive/10 border border-destructive/20 text-destructive rounded-3xl max-w-md text-center space-y-4">
          <p className="font-semibold">{error || "Profile not found"}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline opacity-70 hover:opacity-100"
          >
            Retry
          </button>
        </div>
      </div>
    );

  const hasMedia =
    profile?.photos?.length > 0 ||
    profile?.videos?.length > 0 ||
    profile?.audioSamples?.length > 0;

  const currentUserId = user?._id || user?.id;
  const recipientUserId =
    typeof profile?.userId === "string"
      ? profile.userId
      : profile?.userId?._id || profile?.userId?.id || "";
  const canMessageMusician =
    Boolean(user) &&
    Boolean(recipientUserId) &&
    Boolean(currentUserId) &&
    String(recipientUserId) !== String(currentUserId);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    if (user?.role === "organizer") {
      router.push("/organizer");
      return;
    }

    if (user?.role === "admin") {
      router.push("/admin");
      return;
    }

    router.push("/musician");
  };

  const handleMessageMusician = async () => {
    if (!canMessageMusician) return;

    setIsMessaging(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Please log in to send messages.");
        router.push("/login");
        return;
      }

      const response = await startConversation(token, String(recipientUserId));
      const conversationId = response?.data?._id;

      if (!conversationId) {
        toast.error("Unable to open conversation.");
        return;
      }

      router.push(`/messages/${conversationId}`);
    } catch {
      toast.error("Failed to start conversation.");
    } finally {
      setIsMessaging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {user?.role === "organizer" ? (
        <OrganizerHeader />
      ) : user?.role === "musician" ? (
        <MusicianHeader />
      ) : null}

      <main className="mx-auto max-w-6xl px-5 lg:px-8 pt-28 pb-16">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {canMessageMusician && (
            <button
              type="button"
              onClick={handleMessageMusician}
              disabled={isMessaging}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-60"
            >
              <MessageSquare size={16} />
              {isMessaging ? "Opening..." : "Message"}
            </button>
          )}
        </div>

        {/* ── Hero Card ── */}
        <motion.div
          {...fadeUp(0)}
          className="relative rounded-3xl overflow-hidden mb-8 border border-border/70 shadow-sm bg-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-emerald-500/10 pointer-events-none" />

          {/* Profile Row */}
          <div className="px-6 md:px-8 py-6 md:py-7">
            <div className="flex flex-col md:flex-row md:items-end gap-5 mb-6 relative z-10">
              {/* Avatar */}
              <div className="group relative h-32 w-32 md:h-36 md:w-36 rounded-2xl border border-border/60 bg-muted overflow-hidden shrink-0">
                {profile?.profilePicture ? (
                  <img
                    src={resolveMediaUrl(profile.profilePicture)}
                    alt={profile.stageName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <UserIcon size={56} className="text-primary/50" />
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground truncate">
                      {profile?.stageName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mt-3 font-medium">
                      {profile?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={15} className="text-primary" />
                          {profile.location}
                        </span>
                      )}
                      {profile?.experienceYears !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={15} className="text-primary" />
                          {profile.experienceYears} Years Experience
                        </span>
                      )}
                      {profile?.isAvailable !== undefined && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                            profile.isAvailable
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${profile.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                          />
                          {profile.isAvailable
                            ? "Available to Book"
                            : "Currently Busy"}
                        </span>
                      )}
                      {(profile?.isVerified ||
                        profile?.verificationRequested) && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                            profile?.isVerified
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          <CheckCircle2 size={13} />
                          {profile?.isVerified
                            ? "Verified Artist"
                            : "Verification Pending"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stat chips */}
            <div className="flex flex-wrap gap-3">
              {profile?.hourlyRate && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                  <DollarSign size={16} strokeWidth={2.5} />
                  Rs.
                  {profile.hourlyRate}{" "}
                  <span className="text-muted-foreground font-normal">
                    / hr
                  </span>
                </div>
              )}
              {profile?.instruments?.slice(0, 4).map((inst: string) => (
                <div
                  key={inst}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm font-medium text-foreground"
                >
                  <Music size={14} className="text-primary/70" />
                  {inst}
                </div>
              ))}
              {profile?.instruments?.length > 4 && (
                <div className="flex items-center px-3.5 py-2 rounded-xl bg-secondary/30 border border-border/30 text-sm font-medium text-muted-foreground">
                  +{profile.instruments.length - 4} more
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Bio + Media */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <motion.section
              {...fadeUp(0.1)}
              className="rounded-3xl border border-border/60 bg-card p-7 md:p-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="h-5 w-1 bg-primary rounded-full" />
                About the Artist
              </h2>
              {profile?.bio && (
                <p className="text-muted-foreground leading-7 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}
            </motion.section>

            {/* Media Gallery */}
            <motion.section
              {...fadeUp(0.15)}
              className="rounded-3xl border border-border/60 bg-card p-7 md:p-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                <span className="h-5 w-1 bg-primary rounded-full" />
                Portfolio & Media
              </h2>

              {hasMedia ? (
                <div className="space-y-8">
                  {/* Photos */}
                  {profile?.photos?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                          <Camera size={18} />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Photos
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {profile.photos.map((photo: string, i: number) => (
                          <div
                            key={i}
                            className="group aspect-square rounded-xl overflow-hidden border border-border/50 bg-muted"
                          >
                            <img
                              src={resolveMediaUrl(photo)}
                              alt={`Photo ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {profile?.videos?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                          <VideoIcon size={18} />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Videos
                        </h3>
                      </div>
                      <div className="space-y-5">
                        {profile.videos.map((video: string, i: number) => (
                          <div
                            key={i}
                            className="rounded-xl overflow-hidden border border-border/50 bg-black"
                          >
                            <video
                              src={resolveMediaUrl(video)}
                              controls
                              className="w-full aspect-video"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio */}
                  {profile?.audioSamples?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                          <Mic2 size={18} />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Audio Samples
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {profile.audioSamples.map(
                          (audio: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <Music size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                                  Track {i + 1}
                                </p>
                                <audio
                                  src={resolveMediaUrl(audio)}
                                  controls
                                  className="w-full h-8"
                                />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-14 text-center border border-dashed border-border/60 rounded-xl bg-secondary/5">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
                    <Music size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No Media Uploaded
                  </h3>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">
            {/* Specializations */}
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                <Music size={20} className="text-primary" />
                Specializations
              </h3>

              {profile?.instruments?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground mb-3">
                    Instruments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.instruments.map((inst: string) => (
                      <span
                        key={inst}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.genres?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground mb-3">
                    Genres
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.genres.map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs font-medium text-sky-700 dark:text-sky-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Booking Info */}
            <motion.div
              {...fadeUp(0.15)}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                <DollarSign size={20} className="text-primary" />
                Booking Info
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-background rounded-xl border border-border/60">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Hourly Rate
                  </span>
                  <span className="text-xl font-semibold text-foreground">
                    Rs. {profile?.hourlyRate}
                    <span className="text-sm font-normal text-muted-foreground">
                      /hr
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-background rounded-xl border border-border/60">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Availability
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      profile?.isAvailable
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {profile?.isAvailable ? "Available" : "Busy"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
