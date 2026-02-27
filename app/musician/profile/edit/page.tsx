"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getMusicianProfile, createMusicianProfile, updateMusicianProfile } from "@/lib/api/musician";
import { getAuthToken } from "@/lib/cookies";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { Save, Loader2, Plus, X, Music as MusicIcon, Video as VideoIcon, Camera, Mic2, Trash2, CheckCircle, MapPin, User as UserIcon, DollarSign } from "lucide-react";
import MediaUpload from "@/app/_components/MediaUpload";
import { uploadMusicianMedia, deleteMusicianMedia } from "@/lib/api/musician";
import { toast } from "@/lib/toast";
import { API } from "@/lib/api/endpoints";
import { resolveMediaUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const GENRE_SUGGESTIONS = ["Rock", "Jazz", "Pop", "Hip-Hop", "Classical", "Blues", "Country", "R&B", "Electronic", "Folk"];
const INSTRUMENT_SUGGESTIONS = ["Guitar", "Piano", "Drums", "Bass", "Violin", "Saxophone", "Trumpet", "Vocals", "Cello", "Flute"];

export default function EditMusicianProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    stageName: "",
    bio: "",
    phone: "",
    location: { city: "", state: "", country: "" },
    genres: [] as string[],
    instruments: [] as string[],
    experienceYears: 0,
    hourlyRate: 0,
    isAvailable: true,
    profilePicture: "",
    photos: [] as string[],
    videos: [] as string[],
    audioSamples: [] as string[],
  });

  const [newGenre, setNewGenre] = useState("");
  const [newInstrument, setNewInstrument] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) { router.push("/login"); return; }
        const profileData = await getMusicianProfile(token);
        if (profileData.success && profileData.data) {
          setFormData({
            stageName: profileData.data.stageName || "",
            bio: profileData.data.bio || "",
            phone: profileData.data.phone || "",
            location: profileData.data.location || { city: "", state: "", country: "" },
            genres: profileData.data.genres || [],
            instruments: profileData.data.instruments || [],
            experienceYears: profileData.data.experienceYears ?? 0,
            hourlyRate: profileData.data.hourlyRate ?? 0,
            isAvailable: profileData.data.isAvailable ?? true,
            profilePicture: profileData.data.profilePicture || "",
            photos: profileData.data.photos || [],
            videos: profileData.data.videos || [],
            audioSamples: profileData.data.audioSamples || [],
          });
          setHasProfile(true);
        }
      } catch (err: any) {
        if (err.response?.status === 404) setHasProfile(false);
        else setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.stageName.trim()) errors.stageName = "Stage name is required";
    if (!formData.phone.trim() || formData.phone.trim().length < 10) errors.phone = "Phone must be at least 10 digits";
    if (!formData.location.city.trim()) errors.city = "City is required";
    if (!formData.location.state.trim()) errors.state = "State is required";
    if (!formData.location.country.trim()) errors.country = "Country is required";
    if (formData.genres.length === 0) errors.genres = "Add at least one genre";
    if (formData.instruments.length === 0) errors.instruments = "Add at least one instrument";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setValidationErrors({});
    setSaving(true);
    setError("");

    try {
      const token = await getAuthToken();
      if (!token) return;
      if (hasProfile) await updateMusicianProfile(token, formData);
      else await createMusicianProfile(token, formData);
      setSaved(true);
      toast.success("Profile saved successfully!");
      setTimeout(() => router.push("/musician/profile"), 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to save profile.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaDelete = async (endpoint: string, url: string, field: "photos" | "videos" | "audioSamples") => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await deleteMusicianMedia(token, endpoint, url);
      if (response.success) {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter(item => item !== url) }));
        toast.success("Media deleted");
      }
    } catch (err) {
      toast.error("Failed to delete media.");
      setError("Failed to delete media. Please try again.");
    }
  };

  const addTag = (field: "genres" | "instruments", value: string, setValue: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !formData[field].includes(trimmed)) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
    setValue("");
  };

  const removeTag = (field: "genres" | "instruments", value: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(v => v !== value) }));
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading your profile…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <MusicianHeader />

      {/* Success banner */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-24 inset-x-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-full shadow-2xl text-sm font-bold backdrop-blur-md">
              <CheckCircle size={20} className="text-emerald-200" />
              Profile saved! Redirecting to your stage…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-4xl px-5 lg:px-8 pt-32">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            {hasProfile ? "Edit Your Profile" : "Create Your Artist Profile"}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Refine your sound, update your look, and get ready for the spotlight.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Basic Info ── */}
          <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
              <span className="h-6 w-1 bg-primary rounded-full" />
              Artist Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stage Name *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground/40 ${validationErrors.stageName ? "border-destructive/50" : "border-border/40"}`}
                  placeholder="e.g. The Midnight Echo"
                  value={formData.stageName}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, stageName: e.target.value }));
                    setValidationErrors(p => ({ ...p, stageName: "" }));
                  }}
                />
                {validationErrors.stageName && <p className="text-xs text-destructive font-semibold mt-1">{validationErrors.stageName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number *</label>
                <input
                  type="tel"
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground/40 ${validationErrors.phone ? "border-destructive/50" : "border-border/40"}`}
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, phone: e.target.value }));
                    setValidationErrors(p => ({ ...p, phone: "" }));
                  }}
                />
                {validationErrors.phone && <p className="text-xs text-destructive font-semibold mt-1">{validationErrors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Biography</label>
                <span className="text-[10px] font-bold text-muted-foreground/50">{formData.bio.length}/1000</span>
              </div>
              <textarea
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3.5 rounded-2xl border border-border/40 bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 resize-none placeholder:text-muted-foreground/40"
                placeholder="Share your musical journey, influences, and what makes your performance unique..."
                value={formData.bio}
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              />
            </div>
          </section>

          {/* ── Location ── */}
           <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
               <span className="h-6 w-1 bg-primary rounded-full" />
              Location 
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(["city", "state", "country"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground capitalize">{field} *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 ${validationErrors[field] ? "border-destructive/50" : "border-border/40"}`}
                    value={formData.location[field]}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, location: { ...p.location, [field]: e.target.value } }));
                      setValidationErrors(p => ({ ...p, [field]: "" }));
                    }}
                  />
                  {validationErrors[field] && <p className="text-xs text-destructive font-semibold mt-1">{validationErrors[field]}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* ── Musical Details ── */}
           <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
               <span className="h-6 w-1 bg-primary rounded-full" />
              Artistry & Sound
            </h2>

            {/* Genres */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Genres *</label>
                {validationErrors.genres && <p className="text-xs text-destructive font-semibold">{validationErrors.genres}</p>}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genres.map(genre => (
                  <span key={genre} className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold">
                    {genre}
                    <button type="button" onClick={() => removeTag("genres", genre)} className="hover:text-destructive hover:scale-110 transition-all">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 rounded-2xl border border-border/40 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm placeholder:text-muted-foreground/40"
                  placeholder="Add a genre and press Enter or +"
                  value={newGenre}
                  list="genre-suggestions"
                  onChange={(e) => setNewGenre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("genres", newGenre, setNewGenre))}
                />
                <datalist id="genre-suggestions">
                  {GENRE_SUGGESTIONS.map(g => <option key={g} value={g} />)}
                </datalist>
                <button type="button" onClick={() => addTag("genres", newGenre, setNewGenre)}
                  className="px-4 py-3 bg-secondary/40 hover:bg-secondary/60 rounded-2xl transition-all text-foreground/70">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Instruments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Instruments *</label>
                {validationErrors.instruments && <p className="text-xs text-destructive font-semibold">{validationErrors.instruments}</p>}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.instruments.map(inst => (
                  <span key={inst} className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-4 py-1.5 rounded-full text-xs font-bold">
                    {inst}
                    <button type="button" onClick={() => removeTag("instruments", inst)} className="hover:text-destructive hover:scale-110 transition-all">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 rounded-2xl border border-border/40 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm placeholder:text-muted-foreground/40"
                  placeholder="Add an instrument and press Enter or +"
                  value={newInstrument}
                  list="instrument-suggestions"
                  onChange={(e) => setNewInstrument(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("instruments", newInstrument, setNewInstrument))}
                />
                <datalist id="instrument-suggestions">
                  {INSTRUMENT_SUGGESTIONS.map(i => <option key={i} value={i} />)}
                </datalist>
                <button type="button" onClick={() => addTag("instruments", newInstrument, setNewInstrument)}
                   className="px-4 py-3 bg-secondary/40 hover:bg-secondary/60 rounded-2xl transition-all text-foreground/70">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  className="w-full px-4 py-3.5 rounded-2xl border border-border/40 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData(p => ({ ...p, experienceYears: Math.max(0, Number(e.target.value) || 0) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Hourly Rate (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-8 pr-4 py-3.5 rounded-2xl border border-border/40 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/25 transition-all font-bold"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(p => ({ ...p, hourlyRate: Math.max(0, Number(e.target.value) || 0) }))}
                  />
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-6 md:p-8 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">Working Status</p>
                <p className="text-sm text-muted-foreground">Toggle your availability for new show inquiries</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, isAvailable: !p.isAvailable }))}
                className={`relative h-8 w-14 rounded-full transition-all duration-300 flex items-center px-1 shadow-inner border ${formData.isAvailable ? "bg-emerald-500 border-emerald-600" : "bg-slate-300 dark:bg-slate-700 border-slate-400"}`}
              >
                <span className={`h-6 w-6 rounded-full bg-white shadow-xl transition-transform duration-300 ${formData.isAvailable ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </section>

          {/* ── Media Gallery ── */}
           <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
               <span className="h-6 w-1 bg-primary rounded-full" />
              Media Showcase
            </h2>

            {/* Profile Picture */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Picture</h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="shrink-0">
                  {formData.profilePicture ? (
                    <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-card shadow-lg group">
                      <img src={resolveMediaUrl(formData.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, profilePicture: "" }))}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={24} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 text-muted-foreground/30">
                      <UserIcon size={40} />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <MediaUpload
                    label="Upload New Picture"
                    accept="image/*"
                    responseField="profilePicture"
                    uploadFn={(file) => getAuthToken().then(token => uploadMusicianMedia(token!, API.MUSICIAN.UPLOAD_PIC, "profilePicture", file))}
                    onUploadSuccess={(url) => setFormData(p => ({ ...p, profilePicture: url as string }))}
                  />
                  <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">Recommended: Square JPG or PNG, max 2MB</p>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Camera size={14} /> Gallery Photos
              </h3>
              <MediaUpload
                multiple maxFiles={10}
                label="Add Photos to Portfolio"
                accept="image/*"
                responseField="photos"
                uploadFn={(files) => getAuthToken().then(token => uploadMusicianMedia(token!, API.MUSICIAN.UPLOAD_PHOTOS, "photos", files))}
                onUploadSuccess={(urls) => setFormData(p => ({ ...p, photos: urls as string[] }))}
              />
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                  {formData.photos.map((url, i) => (
                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 bg-muted shadow-sm hover:shadow-md transition-all">
                      <img src={resolveMediaUrl(url)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <button
                        type="button"
                        onClick={() => handleMediaDelete(API.MUSICIAN.UPLOAD_PHOTOS, url, "photos")}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <VideoIcon size={14} /> Performance Videos
              </h3>
              <MediaUpload
                multiple maxFiles={5}
                label="Add Video Clips"
                accept="video/*"
                responseField="videos"
                uploadFn={(files) => getAuthToken().then(token => uploadMusicianMedia(token!, API.MUSICIAN.UPLOAD_VIDEOS, "videos", files))}
                onUploadSuccess={(urls) => setFormData(p => ({ ...p, videos: urls as string[] }))}
              />
              {formData.videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {formData.videos.map((url, i) => (
                    <div key={i} className="group relative rounded-2xl overflow-hidden border border-border/50 bg-black shadow-md">
                      <video src={resolveMediaUrl(url)} controls className="w-full aspect-video" />
                      <button
                        type="button"
                        onClick={() => handleMediaDelete(API.MUSICIAN.UPLOAD_VIDEOS, url, "videos")}
                        className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80 z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Samples */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mic2 size={14} /> Audio Samples
              </h3>
              <MediaUpload
                multiple maxFiles={5}
                label="Upload Tracks"
                accept="audio/*"
                responseField="audioSamples"
                uploadFn={(files) => getAuthToken().then(token => uploadMusicianMedia(token!, API.MUSICIAN.UPLOAD_AUDIO, "audioSamples", files))}
                onUploadSuccess={(urls) => setFormData(p => ({ ...p, audioSamples: urls as string[] }))}
              />
              {formData.audioSamples.length > 0 && (
                <div className="space-y-3 pt-2">
                  {formData.audioSamples.map((url, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-secondary/10 group hover:bg-secondary/20 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <MusicIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Track {i + 1}</p>
                        <audio src={resolveMediaUrl(url)} controls className="w-full h-8" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMediaDelete(API.MUSICIAN.UPLOAD_AUDIO, url, "audioSamples")}
                        className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-6 pt-6 translate-y-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-border/40 text-sm font-bold uppercase tracking-widest hover:bg-secondary/40 transition-all text-muted-foreground"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={saving || saved}
               className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-foreground text-background text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saved ? <CheckCircle size={20} /> : <Save size={20} />}
              {saving ? "Processing..." : saved ? "Published" : hasProfile ? "Update Stage" : "Launch Profile"}
            </button>
          </div>
          <div className="h-10" /> {/* Bottom spacer */}
        </form>
      </main>
    </div>
  );
}
