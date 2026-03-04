"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getOrganizerProfileById } from "@/lib/api/organizer";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Loader2,
  CheckCircle2,
  ImageOff,
  Camera,
  MessageSquare,
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

export default function PublicOrganizerProfilePage() {
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
        const response = await getOrganizerProfileById(id as string);
        if (response.success && response.data) setProfile(response.data);
      } catch (err: any) {
        setError("Failed to load organizer profile.");
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

  const currentUserId = user?._id || user?.id;
  const recipientUserId =
    typeof profile?.userId === "string"
      ? profile.userId
      : profile?.userId?._id || profile?.userId?.id || "";
  const canMessageOrganizer =
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

    if (user?.role === "musician") {
      router.push("/musician");
      return;
    }

    router.push("/");
  };

  const handleMessageOrganizer = async () => {
    if (!canMessageOrganizer) return;

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

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-28 pb-20">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {canMessageOrganizer && (
            <button
              type="button"
              onClick={handleMessageOrganizer}
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
          className="relative rounded-3xl overflow-hidden mb-10 border border-border/60 shadow-lg"
        >
          {/* Cover */}
          <div className="h-40 bg-primary/10 border-b border-border/60" />

          {/* Profile Row */}
          <div className="bg-card px-6 md:px-10 pt-0 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-16 mb-6">
              {/* Avatar */}
              <div className="group relative h-32 w-32 rounded-3xl border-4 border-card bg-muted overflow-hidden shadow-xl shrink-0 flex items-center justify-center text-primary">
                {profile?.profilePicture ? (
                  <img
                    src={resolveMediaUrl(profile.profilePicture)}
                    alt={profile.organizationName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <Building2 size={48} className="text-primary/50" />
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground truncate">
                      {profile?.organizationName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mt-2">
                      {profile?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} />
                          {profile.location}
                        </span>
                      )}
                      {profile?.organizationType && (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                          <Building2 size={11} />
                          {profile.organizationType}
                        </span>
                      )}
                      {(profile?.isVerified ||
                        profile?.verificationRequested) && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            profile?.isVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          <CheckCircle2 size={11} />
                          {profile?.isVerified
                            ? "Verified"
                            : "Verification Pending"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description preview */}
            {profile?.description && (
              <p className="text-sm text-muted-foreground leading-6 line-clamp-2 max-w-2xl">
                {profile.description}
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Info + Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info */}
            <motion.section
              {...fadeUp(0.1)}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
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
              className="rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
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
                </div>
              )}
            </motion.section>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">
            {/* Event Types */}
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-3xl border border-border bg-card p-7 shadow-sm"
            >
              <h3 className="text-base font-bold mb-5 flex items-center gap-2">
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

            {/* Verified Status */}
            <motion.div
              {...fadeUp(0.15)}
              className="rounded-3xl border border-border bg-card p-7 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-primary" />
                <h3 className="font-semibold text-lg text-foreground">
                  {profile?.isVerified
                    ? "Verified Organizer"
                    : profile?.verificationRequested
                      ? "Verification Under Review"
                      : "Not Verified Yet"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile?.isVerified
                  ? "This organizer has been verified by the Get-a-Gig team."
                  : profile?.verificationRequested
                    ? "This organizer has requested verification and is currently under review."
                    : "This organizer has not requested verification yet."}
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
