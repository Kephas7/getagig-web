"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getOrganizerProfile } from "@/lib/api/organizer";
import { getAuthToken } from "@/lib/cookies";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion } from "framer-motion";
import {
  Edit, MapPin, Building2, User, Mail, Phone,
  Globe, Calendar, Loader2, CheckCircle2, ImageOff, PlusCircle, Camera
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
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) { router.push("/login"); return; }
        const response = await getOrganizerProfile(token);
        if (response.success && response.data) setProfile(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) router.push("/organizer/profile/edit");
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

      const response = await uploadOrganizerMedia(token, API.ORGANIZER.UPLOAD_PIC, "profilePicture", file);
      if (response.success) {
        setProfile((prev: any) => ({ ...prev, profilePicture: response.data.profilePicture }));
        toast.success("Profile picture updated!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload profile picture.");
    } finally {
      setUploadingPfp(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading profile…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="p-8 bg-destructive/10 border border-destructive/20 text-destructive rounded-3xl max-w-md text-center space-y-4">
        <p className="font-semibold">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm underline opacity-70 hover:opacity-100">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <OrganizerHeader />

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-28 pb-20">

        {/* ── Hero Card ── */}
        <motion.div {...fadeUp(0)} className="relative rounded-3xl overflow-hidden mb-10 border border-border/60 shadow-lg">
          {/* Cover */}
          <div className="h-52 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600" />

          {/* Profile Row */}
          <div className="bg-card px-6 md:px-10 pt-0 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-16 mb-6">
              {/* Avatar */}
              <div 
                className="group relative h-32 w-32 rounded-3xl border-4 border-card bg-muted overflow-hidden shadow-xl shrink-0 flex items-center justify-center text-primary cursor-pointer"
                onClick={() => !uploadingPfp && fileInputRef.current?.click()}
              >
                {profile?.profilePicture ? (
                  <img src={resolveMediaUrl(profile.profilePicture)} alt={profile.organizationName} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <Building2 size={48} className="text-primary/50" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingPfp ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <>
                      <Camera size={24} className="text-white mb-1" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Photo</span>
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
                          {profile.location.city}, {profile.location.state}, {profile.location.country}
                        </span>
                      )}
                      {profile?.organizationType && (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold">
                          <Building2 size={11} />
                          {profile.organizationType}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} />
                        Verified
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/organizer/profile/edit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/30 hover:shadow-md shrink-0"
                  >
                    <Edit size={15} />
                    Edit Profile
                  </Link>
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
            <motion.section {...fadeUp(0.1)} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <span className="h-5 w-1 bg-primary rounded-full" />
                Organization Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={<User size={17} />} label="Contact Person" value={profile?.contactPerson} />
                <InfoRow icon={<Building2 size={17} />} label="Type" value={profile?.organizationType} />
                <InfoRow icon={<Mail size={17} />} label="Email" value={profile?.email} />
                <InfoRow icon={<Phone size={17} />} label="Phone" value={profile?.phone} />
                {profile?.website && (
                  <div className="sm:col-span-2">
                    <InfoRow icon={<Globe size={17} />} label="Website" value={profile.website} />
                  </div>
                )}
              </div>
            </motion.section>

            {/* Gallery */}
            <motion.section {...fadeUp(0.15)} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="h-5 w-1 bg-blue-500 rounded-full" />
                Gallery
              </h2>

              {profile?.photos?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.photos.map((photo: string, i: number) => (
                    <div key={i} className="group aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
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
                  <ImageOff size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm font-medium">No gallery photos yet</p>
                  <Link href="/organizer/profile/edit" className="mt-3 inline-block text-xs text-primary hover:underline font-semibold">
                    Add photos →
                  </Link>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">

            {/* Event Types */}
            <motion.div {...fadeUp(0.1)} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              <h3 className="text-base font-bold mb-5 flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Event Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.eventTypes?.length > 0 ? (
                  profile.eventTypes.map((type: string) => (
                    <span key={type} className="px-3 py-1.5 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {type}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No event types specified.</p>
                )}
              </div>
            </motion.div>

            {/* Post Gig CTA */}
            <motion.div {...fadeUp(0.15)} className="rounded-3xl overflow-hidden shadow-lg">
              <div className="p-7 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={18} className="text-indigo-200" />
                  <h3 className="font-bold text-lg">Verified Organizer</h3>
                </div>
                <p className="text-indigo-100/80 text-sm leading-relaxed mb-6">
                  You can post gigs and hire top musical talent on Get-a-Gig.
                </p>
                <div className="w-full h-1.5 rounded-full bg-white/20 mb-6">
                  <div className="h-full w-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                </div>
                <Link
                  href="/gigs/new"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors"
                >
                  <PlusCircle size={16} />
                  Post a Gig
                </Link>
              </div>
            </motion.div>

            {/* Profile Completion */}
            <motion.div {...fadeUp(0.2)} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              <h3 className="text-base font-bold mb-4">Profile Completion</h3>
              {(() => {
                const fields = [
                  profile?.organizationName,
                  profile?.contactPerson,
                  profile?.email,
                  profile?.phone,
                  profile?.location,
                  profile?.organizationType,
                  profile?.eventTypes?.length,
                  profile?.photos?.length,
                ];
                const filled = fields.filter(Boolean).length;
                const pct = Math.round((filled / fields.length) * 100);
                return (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="text-sm font-bold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    {pct < 100 && (
                      <Link href="/organizer/profile/edit" className="mt-3 inline-block text-xs text-primary hover:underline font-semibold">
                        Complete your profile →
                      </Link>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
