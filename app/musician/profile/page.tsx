"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getMusicianProfile,
  updateMusicianProfile,
  requestMusicianVerification,
} from "@/lib/api/musician";
import { getAuthToken } from "@/lib/cookies";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { motion } from "framer-motion";
import {
  Edit,
  MapPin,
  Music,
  User as UserIcon,
  Calendar,
  DollarSign,
  Loader2,
  Mic2,
  CheckCircle2,
  Camera,
  Video as VideoIcon,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/utils";
import { useRef } from "react";
import { uploadMusicianMedia } from "@/lib/api/musician";
import { API } from "@/lib/api/endpoints";
import { toast } from "@/lib/toast";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export default function MusicianProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await getMusicianProfile(token);
        if (response.success && response.data) setProfile(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) router.push("/musician/profile/edit");
        else setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPfp(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await uploadMusicianMedia(
        token,
        API.MUSICIAN.UPLOAD_PIC,
        "profilePicture",
        file,
      );
      if (response.success) {
        setProfile((prev: any) => ({
          ...prev,
          profilePicture: response.data.profilePicture,
        }));
        toast.success("Profile picture updated!");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to upload profile picture.",
      );
    } finally {
      setUploadingPfp(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile || updatingAvailability) return;

    setUpdatingAvailability(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Session expired. Please login.");
        return;
      }

      const updatedStatus = !profile.isAvailable;
      const response = await updateMusicianProfile(token, {
        ...profile,
        isAvailable: updatedStatus,
      });

      if (response.success) {
        setProfile((prev: any) => ({ ...prev, isAvailable: updatedStatus }));
        toast.success(
          updatedStatus
            ? "You are now available for bookings!"
            : "Availability set to busy.",
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update availability.",
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!profile || requestingVerification) return;

    setRequestingVerification(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await requestMusicianVerification(token);
      if (response?.success) {
        setProfile((prev: any) => ({
          ...prev,
          verificationRequested: true,
        }));
        toast.success("Verification request sent to admin");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to request verification",
      );
    } finally {
      setRequestingVerification(false);
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
            Loading profile…
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="p-8 bg-destructive/10 border border-destructive/20 text-destructive rounded-3xl max-w-md text-center space-y-4">
          <p className="font-semibold">{error}</p>
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

  const profileCompletionFields = [
    profile?.stageName,
    profile?.bio,
    profile?.location,
    profile?.instruments?.length > 0,
    profile?.genres?.length > 0,
    profile?.profilePicture,
    profile?.photos?.length > 0 ||
      profile?.videos?.length > 0 ||
      profile?.audioSamples?.length > 0,
  ];
  const profileCompletionPct = Math.round(
    (profileCompletionFields.filter(Boolean).length /
      profileCompletionFields.length) *
      100,
  );

  const mediaCount =
    (profile?.photos?.length || 0) +
    (profile?.videos?.length || 0) +
    (profile?.audioSamples?.length || 0);

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <MusicianHeader />

      <main className="relative z-10 mx-auto max-w-6xl px-5 lg:px-8 pt-28 pb-16">
        {/* ── Hero Card ── */}
        <motion.div
          {...fadeUp(0)}
          className="relative rounded-3xl overflow-hidden mb-8 border border-border/70 shadow-sm bg-card"
        >
          <div className="px-6 md:px-8 py-6 md:py-7">
            <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6 xl:gap-8 items-start">
              <div className="space-y-3">
                <div
                  className="group relative h-32 w-32 md:h-36 md:w-36 rounded-2xl border border-border/60 bg-muted overflow-hidden shrink-0 cursor-pointer"
                  onClick={() => !uploadingPfp && fileInputRef.current?.click()}
                >
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

                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {uploadingPfp ? (
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    ) : (
                      <>
                        <Camera size={28} className="text-white mb-1" />
                        <span className="text-[10px] font-semibold text-white uppercase tracking-wide">
                          Change Photo
                        </span>
                      </>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePfpChange}
                  />
                </div>

                {profile?.hourlyRate && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                    <DollarSign size={16} strokeWidth={2.5} />
                    Rs.
                    {profile.hourlyRate}
                    <span className="text-muted-foreground font-normal">
                      / hr
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="min-w-0">
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
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!profile?.isVerified &&
                      !profile?.verificationRequested && (
                        <button
                          type="button"
                          onClick={handleRequestVerification}
                          disabled={requestingVerification}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wide hover:bg-primary/10 transition-colors disabled:opacity-50"
                        >
                          {requestingVerification
                            ? "Requesting..."
                            : "Request Verification"}
                        </button>
                      )}
                    <Link
                      href="/musician/profile/edit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold transition-colors hover:opacity-90"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
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
                  {(profile?.isVerified || profile?.verificationRequested) && (
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

                <div className="flex flex-wrap gap-2.5">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/60 bg-background/60 p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Profile Score
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      {profileCompletionPct}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/60 p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Portfolio Items
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      {mediaCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/60 p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Verification
                    </p>
                    <p
                      className={`text-sm font-semibold uppercase tracking-wide ${
                        profile?.isVerified
                          ? "text-success"
                          : profile?.verificationRequested
                            ? "text-primary"
                            : "text-warning"
                      }`}
                    >
                      {profile?.isVerified
                        ? "Verified"
                        : profile?.verificationRequested
                          ? "Pending"
                          : "Not Requested"}
                    </p>
                  </div>
                </div>
              </div>
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
              {profile?.bio ? (
                <p className="text-muted-foreground leading-7 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/60">
                  <p className="text-muted-foreground font-medium">
                    Tell your story. Add a bio!
                  </p>
                  <Link
                    href="/musician/profile/edit"
                    className="text-primary text-sm font-bold hover:underline mt-2 inline-block"
                  >
                    Edit Profile
                  </Link>
                </div>
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
                  <h3 className="text-lg font-bold text-foreground">
                    No Media Uploaded
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium mt-1 mb-6">
                    Showcase your talent by adding photos, videos, or audio.
                  </p>
                  <Link
                    href="/musician/profile/edit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:opacity-90"
                  >
                    <Plus size={18} />
                    Add Media
                  </Link>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold mb-4">
                Profile Completion
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Optimized for booking
                </span>
                <span className="text-sm font-semibold text-primary">
                  {profileCompletionPct}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletionPct}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.5,
                    ease: "circOut",
                  }}
                  className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                />
              </div>
              {profileCompletionPct < 100 && (
                <Link
                  href="/musician/profile/edit"
                  className="mt-4 block w-full text-center py-2.5 rounded-xl border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wide hover:bg-primary/5 transition-colors"
                >
                  Complete Profile
                </Link>
              )}
            </motion.div>

            {/* Specializations */}
            <motion.div
              {...fadeUp(0.15)}
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
              {...fadeUp(0.2)}
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
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleAvailability();
                    }}
                    disabled={updatingAvailability}
                    className={`relative h-6 w-11 rounded-full transition-all duration-300 flex items-center px-1 border ${profile?.isAvailable ? "bg-emerald-500 border-emerald-600" : "bg-slate-300 dark:bg-slate-700 border-slate-400"} ${updatingAvailability ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${profile?.isAvailable ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>

              <Link
                href="/musician/profile/edit"
                className="mt-5 block w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:opacity-90"
              >
                Edit Details
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
