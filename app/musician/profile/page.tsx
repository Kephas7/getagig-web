"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getMusicianProfile, updateMusicianProfile } from "@/lib/api/musician";
import { getAuthToken } from "@/lib/cookies";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { motion } from "framer-motion";
import {
  Edit, MapPin, Music, User as UserIcon, Calendar,
  DollarSign, Loader2, Mic2, CheckCircle2, Star, Camera, Video as VideoIcon, Plus
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) { router.push("/login"); return; }
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

      const response = await uploadMusicianMedia(token, API.MUSICIAN.UPLOAD_PIC, "profilePicture", file);
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
      const response = await updateMusicianProfile(token, { ...profile, isAvailable: updatedStatus });
      
      if (response.success) {
        setProfile((prev: any) => ({ ...prev, isAvailable: updatedStatus }));
        toast.success(updatedStatus ? "You are now available for bookings!" : "Availability set to busy.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update availability.");
    } finally {
      setUpdatingAvailability(false);
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

  const hasMedia = profile?.photos?.length > 0 || profile?.videos?.length > 0 || profile?.audioSamples?.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <MusicianHeader />

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-28 pb-20">

        {/* ── Hero Card ── */}
        <motion.div {...fadeUp(0)} className="relative rounded-[2.5rem] overflow-hidden mb-10 border border-border/60 shadow-2xl bg-card">
          {/* Cover */}
          <div className="h-64 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          {/* Profile Row */}
          <div className="px-8 md:px-12 pb-10">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-20 mb-8 relative z-10">
              {/* Avatar */}
              <div 
                className="group relative h-40 w-40 rounded-[2rem] border-[6px] border-card bg-muted overflow-hidden shadow-2xl shrink-0 cursor-pointer"
                onClick={() => !uploadingPfp && fileInputRef.current?.click()}
              >
                {profile?.profilePicture ? (
                  <img src={resolveMediaUrl(profile.profilePicture)} alt={profile.stageName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <UserIcon size={56} className="text-primary/50" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {uploadingPfp ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  ) : (
                    <>
                      <Camera size={28} className="text-white mb-1" />
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
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground truncate drop-shadow-sm">
                      {profile?.stageName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mt-3 font-medium">
                      {profile?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={15} className="text-primary" />
                          {profile.location.city}, {profile.location.state}
                        </span>
                      )}
                      {profile?.experienceYears !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={15} className="text-primary" />
                          {profile.experienceYears} Years Experience
                        </span>
                      )}
                      {profile?.isAvailable !== undefined && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          profile.isAvailable
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${profile.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                          {profile.isAvailable ? "Available to Book" : "Currently Busy"}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/musician/profile/edit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick stat chips */}
            <div className="flex flex-wrap gap-3">
              {profile?.hourlyRate && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/5 border border-primary/10 text-sm font-bold text-primary shadow-sm">
                  <DollarSign size={16} strokeWidth={2.5} />
                  ${profile.hourlyRate} <span className="text-muted-foreground font-normal">/ hr</span>
                </div>
              )}
              {profile?.instruments?.slice(0, 4).map((inst: string) => (
                <div key={inst} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border/50 text-sm font-bold text-foreground shadow-sm">
                  <Music size={14} className="text-primary/70" />
                  {inst}
                </div>
              ))}
              {profile?.instruments?.length > 4 && (
                <div className="flex items-center px-4 py-2.5 rounded-2xl bg-secondary/30 border border-border/30 text-sm font-bold text-muted-foreground">
                  +{profile.instruments.length - 4} more
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Bio + Media */}
          <div className="lg:col-span-2 space-y-8">

            {/* Bio */}
            <motion.section {...fadeUp(0.1)} className="rounded-[2rem] border border-border/60 bg-card p-10 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] -z-10" />
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
                <span className="h-8 w-1.5 bg-gradient-to-b from-primary to-violet-500 rounded-full" />
                About the Artist
              </h2>
              {profile?.bio ? (
                 <p className="text-muted-foreground leading-8 text-lg whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                  <p className="text-muted-foreground font-medium">Tell your story. Add a bio!</p>
                  <Link href="/musician/profile/edit" className="text-primary text-sm font-bold hover:underline mt-2 inline-block">Edit Profile</Link>
                </div>
              )}
             
            </motion.section>

            {/* Media Gallery */}
            <motion.section {...fadeUp(0.15)} className="rounded-[2rem] border border-border/60 bg-card p-10 shadow-lg">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-foreground">
                <span className="h-8 w-1.5 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
                Portfolio & Media
              </h2>

              {hasMedia ? (
                <div className="space-y-10">
                  {/* Photos */}
                  {profile?.photos?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary"><Camera size={18} /></div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Photos</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {profile.photos.map((photo: string, i: number) => (
                          <div key={i} className="group aspect-square rounded-2xl overflow-hidden border border-border/50 bg-muted shadow-sm hover:shadow-md transition-all">
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
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><VideoIcon size={18} /></div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Videos</h3>
                      </div>
                      <div className="space-y-5">
                        {profile.videos.map((video: string, i: number) => (
                          <div key={i} className="rounded-3xl overflow-hidden border border-border/50 bg-black shadow-lg">
                            <video src={resolveMediaUrl(video)} controls className="w-full aspect-video" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio */}
                  {profile?.audioSamples?.length > 0 && (
                    <div>
                       <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><Mic2 size={18} /></div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Audio Samples</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {profile.audioSamples.map((audio: string, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-5 rounded-3xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 text-white">
                              <Music size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Track {i + 1}</p>
                              <audio src={resolveMediaUrl(audio)} controls className="w-full h-8" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-border/60 rounded-[2rem] bg-secondary/5">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
                     <Music size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No Media Uploaded</h3>
                  <p className="text-muted-foreground text-sm font-medium mt-1 mb-6">Showcase your talent by adding photos, videos, or audio.</p>
                  <Link href="/musician/profile/edit" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={18} />
                    Add Media
                  </Link>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-8">
            
            {/* Profile Completion */}
            <motion.div {...fadeUp(0.1)} className="rounded-[2rem] border border-border/60 bg-card p-8 shadow-lg">
                <h3 className="text-lg font-bold mb-4">Profile Completion</h3>
                 {(() => {
                  const fields = [
                    profile?.stageName,
                    profile?.bio,
                    profile?.location,
                    profile?.instruments?.length > 0,
                    profile?.genres?.length > 0,
                    profile?.profilePicture,
                    (profile?.photos?.length > 0 || profile?.videos?.length > 0 || profile?.audioSamples?.length > 0)
                  ];
                  const filled = fields.filter(Boolean).length;
                  const pct = Math.round((filled / fields.length) * 100);
                  
                  return (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-muted-foreground">Optimized for booking</span>
                        <span className="text-sm font-black text-primary">{pct}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                          className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        />
                      </div>
                      {pct < 100 && (
                        <Link href="/musician/profile/edit" className="mt-4 block w-full text-center py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/5 transition-colors">
                          Complete Profile
                        </Link>
                      )}
                    </>
                  );
                })()}
            </motion.div>

            {/* Specializations */}
            <motion.div {...fadeUp(0.15)} className="rounded-[2rem] border border-border/60 bg-card p-8 shadow-lg">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Music size={20} className="text-primary" />
                Specializations
              </h3>

              {profile?.instruments?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Instruments</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.instruments.map((inst: string) => (
                      <span key={inst} className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.genres?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.genres.map((genre: string) => (
                      <span key={genre} className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-600 dark:text-violet-400">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Booking Info */}
            <motion.div {...fadeUp(0.2)} className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-violet-500/5 p-8 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                <DollarSign size={20} className="text-primary" />
                Booking Info
              </h3>

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-sm">
                  <span className="text-sm font-semibold text-muted-foreground">Hourly Rate</span>
                  <span className="text-2xl font-black text-foreground">
                    ${profile?.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hr</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-sm">
                  <span className="text-sm font-semibold text-muted-foreground">Availability</span>
                  <button
                    onClick={(e) => { e.preventDefault(); handleToggleAvailability(); }}
                    disabled={updatingAvailability}
                    className={`relative h-6 w-11 rounded-full transition-all duration-300 flex items-center px-1 border ${profile?.isAvailable ? "bg-emerald-500 border-emerald-600" : "bg-slate-300 dark:bg-slate-700 border-slate-400"} ${updatingAvailability ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  >
                    <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${profile?.isAvailable ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              <Link
                href="/musician/profile/edit"
                className="mt-6 block w-full text-center py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Edit Details
              </Link>
            </motion.div>

            {/* Rating placeholder (UI flair) */}
            <motion.div {...fadeUp(0.25)} className="rounded-[2rem] border border-border/60 bg-card p-8 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Star size={20} className="text-amber-500" fill="currentColor" />
                  Rating
                </h3>
                <span className="text-3xl font-black text-foreground">5.0</span>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={20} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Based on 0 reviews</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground italic">"Complete your first gig to start collecting reviews!"</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
