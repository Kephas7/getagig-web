"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getOrganizerProfile,
  requestOrganizerVerification,
} from "@/lib/api/organizer";
import { getAuthToken } from "@/lib/cookies";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion } from "framer-motion";
import {
  Edit,
  MapPin,
  Building2,
  Sparkles,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Loader2,
  CheckCircle2,
  ImageOff,
  PlusCircle,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/utils";
import { useRef } from "react";
import { uploadOrganizerMedia } from "@/lib/api/organizer";
import { API } from "@/lib/api/endpoints";
import { toast } from "@/lib/toast";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/50">
      <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 text-primary shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function OrganizerProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await getOrganizerProfile(token);
        if (response.success && response.data) setProfile(response.data);
      } catch (err: any) {
        if (err.response?.status === 404)
          router.push("/organizer/profile/edit");
        else setError("Failed to load organizer profile.");
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

      const response = await uploadOrganizerMedia(
        token,
        API.ORGANIZER.UPLOAD_PIC,
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

  const handleRequestVerification = async () => {
    if (!profile || requestingVerification) return;

    setRequestingVerification(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await requestOrganizerVerification(token);
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

  const profileCompletionFields = [
    profile?.organizationName,
    profile?.contactPerson,
    profile?.email,
    profile?.phone,
    profile?.location,
    profile?.organizationType,
    profile?.description,
    profile?.eventTypes?.length > 0,
    profile?.profilePicture,
  ];

  const profileCompletionPct = Math.round(
    (profileCompletionFields.filter(Boolean).length /
      profileCompletionFields.length) *
      100,
  );

  const mediaCount =
    (profile?.photos?.length || 0) + (profile?.videos?.length || 0);

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <OrganizerHeader />

      <main className="relative z-10 mx-auto max-w-6xl px-5 lg:px-8 pt-28 pb-20">
        {/* ── Hero Card ── */}
        <motion.div
          {...fadeUp(0)}
          className="relative rounded-3xl overflow-hidden mb-8 border border-border/70 shadow-sm bg-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-warning/12 via-transparent to-primary/8 pointer-events-none" />

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
                      alt={profile.organizationName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-warning/10">
                      <Building2 size={56} className="text-warning/60" />
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

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-warning/10 border border-warning/20 text-sm font-semibold text-warning">
                  <Building2 size={16} strokeWidth={2.5} />
                  {mediaCount} Gallery Items
                </div>
              </div>

              <div className="min-w-0 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold uppercase tracking-wide mb-3 border border-warning/25">
                      <Sparkles size={12} className="animate-pulse" />
                      Organizer Profile
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground truncate">
                      <span className="gradient-text">
                        {profile?.organizationName}
                      </span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mt-3 font-medium">
                      {profile?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={15} className="text-warning" />
                          {profile.location}
                        </span>
                      )}
                      {profile?.organizationType && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-semibold uppercase tracking-wide">
                          <Building2 size={12} />
                          {profile.organizationType}
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
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warning/30 text-warning text-xs font-semibold uppercase tracking-wide hover:bg-warning/10 transition-colors disabled:opacity-50"
                        >
                          {requestingVerification
                            ? "Requesting..."
                            : "Request Verification"}
                        </button>
                      )}
                    <Link
                      href="/organizer/profile/edit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:opacity-90"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {(profile?.isVerified || profile?.verificationRequested) && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                        profile?.isVerified
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/25"
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      {profile?.isVerified
                        ? "Verified Organizer"
                        : "Verification Pending"}
                    </span>
                  )}
                </div>

                {profile?.description && (
                  <p className="text-sm text-muted-foreground leading-7 line-clamp-3 max-w-2xl">
                    {profile.description}
                  </p>
                )}

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
                      Event Types
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      {profile?.eventTypes?.length || 0}
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
                            ? "text-warning"
                            : "text-muted-foreground"
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
          {/* Left — Info + Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <motion.section
              {...fadeUp(0.1)}
              className="rounded-3xl border border-border/60 bg-card p-7 md:p-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-foreground">
                <span className="h-5 w-1 bg-primary rounded-full" />
                Organization Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow
                  icon={<User size={17} />}
                  label="Contact Person"
                  value={profile?.contactPerson}
                />
                <InfoRow
                  icon={<Building2 size={17} />}
                  label="Type"
                  value={profile?.organizationType}
                />
                <InfoRow
                  icon={<Mail size={17} />}
                  label="Email"
                  value={profile?.email}
                />
                <InfoRow
                  icon={<Phone size={17} />}
                  label="Phone"
                  value={profile?.phone}
                />
                {profile?.website && (
                  <div className="sm:col-span-2">
                    <InfoRow
                      icon={<Globe size={17} />}
                      label="Website"
                      value={profile.website}
                    />
                  </div>
                )}
              </div>
            </motion.section>

            {/* Gallery */}
            <motion.section
              {...fadeUp(0.15)}
              className="rounded-3xl border border-border/60 bg-card p-7 md:p-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                <span className="h-5 w-1 bg-primary rounded-full" />
                Gallery
              </h2>

              {profile?.photos?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.photos.map((photo: string, i: number) => (
                    <div
                      key={i}
                      className="group aspect-square rounded-2xl overflow-hidden border border-border bg-muted"
                    >
                      <img
                        src={resolveMediaUrl(photo)}
                        alt={`Event photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl">
                  <ImageOff
                    size={32}
                    className="mx-auto mb-3 text-muted-foreground/40"
                  />
                  <p className="text-muted-foreground text-sm font-medium">
                    No gallery photos yet
                  </p>
                  <Link
                    href="/organizer/profile/edit"
                    className="mt-3 inline-block text-xs text-primary hover:underline font-semibold"
                  >
                    Add photos →
                  </Link>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">
            {/* Event Types */}
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold mb-5 flex items-center gap-2 text-foreground">
                <Calendar size={16} className="text-primary" />
                Event Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.eventTypes?.length > 0 ? (
                  profile.eventTypes.map((type: string) => (
                    <span
                      key={type}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No event types specified.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Post Gig CTA */}
            <motion.div
              {...fadeUp(0.15)}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-primary" />
                <h3 className="font-semibold text-lg text-foreground">
                  {profile?.isVerified
                    ? "Verified Organizer"
                    : profile?.verificationRequested
                      ? "Verification Under Review"
                      : "Verification Required"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {profile?.isVerified
                  ? "You can post gigs and hire top musical talent on Get-a-Gig."
                  : profile?.verificationRequested
                    ? "Your verification request has been sent to admin. We'll notify you once reviewed."
                    : "Request verification to increase trust and improve your hiring visibility."}
              </p>
              <Link
                href="/organizer/gigs/new"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  profile?.isVerified
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-muted-foreground pointer-events-none"
                }`}
              >
                <PlusCircle size={16} />
                Post a Gig
              </Link>
            </motion.div>

            {/* Profile Completion */}
            <motion.div
              {...fadeUp(0.2)}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold mb-4 text-foreground">
                Profile Completion
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Optimized for hiring
                </span>
                <span className="text-sm font-semibold text-primary">
                  {profileCompletionPct}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletionPct}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "circOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              {profileCompletionPct < 100 && (
                <Link
                  href="/organizer/profile/edit"
                  className="mt-4 block w-full text-center py-2.5 rounded-xl border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wide hover:bg-primary/10 transition-colors"
                >
                  Complete Profile
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
