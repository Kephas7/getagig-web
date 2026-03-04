"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getOrganizerProfile,
  createOrganizerProfile,
  updateOrganizerProfile,
  requestOrganizerVerification,
} from "@/lib/api/organizer";
import { getAuthToken } from "@/lib/cookies";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import {
  Save,
  Loader2,
  Plus,
  X,
  Globe,
  Building2,
  Camera,
  User as UserIcon,
  CheckCircle,
  MapPin,
  Trash2,
  Calendar,
} from "lucide-react";
import MediaUpload from "@/app/_components/MediaUpload";
import {
  uploadOrganizerMedia,
  deleteOrganizerMedia,
} from "@/lib/api/organizer";
import { toast } from "@/lib/toast";
import { API } from "@/lib/api/endpoints";
import { resolveMediaUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_TYPE_SUGGESTIONS = [
  "Weddings",
  "Corporate Events",
  "Birthday Parties",
  "Club Nights",
  "Concerts",
  "Festivals",
  "Private Gigs",
  "Bar/Restaurant",
  "Theatre",
  "Gallery",
];
const ORG_TYPES = [
  { value: "Individual", label: "Individual Promoter" },
  { value: "Club", label: "Club / Venue" },
  { value: "Agent", label: "Talent Agency" },
  { value: "Other", label: "Other" },
];

export default function EditOrganizerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [requestingVerification, setRequestingVerification] = useState(false);

  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    phone: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    organizationType: "Individual",
    eventTypes: [] as string[],
    profilePicture: "",
    photos: [] as string[],
    verificationDocuments: [] as string[],
    isVerified: false,
    verificationRequested: false,
  });

  const [newEventType, setNewEventType] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          router.push("/login");
          return;
        }
        const profileData = await getOrganizerProfile(token);
        if (profileData.success && profileData.data) {
          setFormData({
            organizationName: profileData.data.organizationName || "",
            contactPerson: profileData.data.contactPerson || "",
            phone: profileData.data.phone || "",
            email: profileData.data.email || "",
            bio: profileData.data.bio || "",
            location: profileData.data.location || "",
            website: profileData.data.website || "",
            organizationType: profileData.data.organizationType || "Individual",
            eventTypes: profileData.data.eventTypes || [],
            profilePicture: profileData.data.profilePicture || "",
            photos: profileData.data.photos || [],
            verificationDocuments: profileData.data.verificationDocuments || [],
            isVerified: profileData.data.isVerified ?? false,
            verificationRequested:
              profileData.data.verificationRequested ?? false,
          });
          setHasProfile(true);
        }
      } catch (err: any) {
        if (err.response?.status === 404) setHasProfile(false);
        else setError("Failed to load organizer profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.organizationName.trim())
      errors.organizationName = "Organization name is required";
    if (!formData.contactPerson.trim())
      errors.contactPerson = "Contact person is required";
    if (!formData.phone.trim() || formData.phone.trim().length < 10)
      errors.phone = "Enter a valid phone number (min 10 digits)";
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      errors.email = "Enter a valid email address";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (formData.eventTypes.length === 0)
      errors.eventTypes = "Add at least one event type";
    // Only validate website if provided
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website =
        "Enter a valid URL (must start with http:// or https://)";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setValidationErrors({});
    setSaving(true);
    setError("");

    try {
      const token = await getAuthToken();
      if (!token) return;

      // Only include website if it has a value — empty string fails Zod URL validation
      const payload = {
        ...formData,
        website: formData.website.trim() || undefined,
      };

      if (hasProfile) await updateOrganizerProfile(token, payload);
      else await createOrganizerProfile(token, payload);

      setSaved(true);
      toast.success("Profile saved successfully!");
      setTimeout(() => router.push("/organizer/profile"), 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Failed to save profile.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaDelete = async (
    endpoint: string,
    url: string,
    field: "photos",
  ) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await deleteOrganizerMedia(token, endpoint, url);
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          [field]: prev[field].filter((item) => item !== url),
        }));
        toast.success("Media removed");
      }
    } catch (err) {
      toast.error("Failed to delete media.");
      setError("Failed to delete media. Please try again.");
    }
  };

  const addEventType = () => {
    const trimmed = newEventType.trim();
    if (trimmed && !formData.eventTypes.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        eventTypes: [...prev.eventTypes, trimmed],
      }));
      setValidationErrors((prev) => ({ ...prev, eventTypes: "" }));
    }
    setNewEventType("");
  };

  const removeEventType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.filter((t) => t !== type),
    }));
  };

  const handleRequestVerification = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      setRequestingVerification(true);
      const response = await requestOrganizerVerification(token);

      if (response?.success) {
        setFormData((prev) => ({
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
            Loading your profile…
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-24">
      <OrganizerHeader />

      {/* Success banner */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 inset-x-0 z-50 flex justify-center"
          >
            <div className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-semibold">
              <CheckCircle size={18} />
              Profile saved! Redirecting…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-4xl px-5 lg:px-8 pt-28">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            {hasProfile ? "The Organizer's Hub" : "Launch Your Venue"}
          </h1>
          <p className="mt-3 text-lg text-foreground/60">
            {hasProfile
              ? "Manage your organization and connect with world-class talent."
              : "Setup your profile to start hosting unforgettable events."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7" noValidate>
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

          {/* ── Organization Details ── */}
          <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
              <span className="h-6 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
              Organization Intel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Organization Name
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 placeholder:text-foreground/20 ${validationErrors.organizationName ? "border-error/50" : "border-border/40"}`}
                  placeholder="e.g. Blue Note Jazz Club"
                  value={formData.organizationName}
                  onChange={(e) => {
                    setFormData((p) => ({
                      ...p,
                      organizationName: e.target.value,
                    }));
                    setValidationErrors((p) => ({
                      ...p,
                      organizationName: "",
                    }));
                  }}
                />
                {validationErrors.organizationName && (
                  <p className="text-xs text-destructive mt-1">
                    {validationErrors.organizationName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Contact Person
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 placeholder:text-foreground/20 ${validationErrors.contactPerson ? "border-error/50" : "border-border/40"}`}
                  placeholder="The person in charge"
                  value={formData.contactPerson}
                  onChange={(e) => {
                    setFormData((p) => ({
                      ...p,
                      contactPerson: e.target.value,
                    }));
                    setValidationErrors((p) => ({ ...p, contactPerson: "" }));
                  }}
                />
                {validationErrors.contactPerson && (
                  <p className="text-xs text-destructive mt-1">
                    {validationErrors.contactPerson}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 placeholder:text-foreground/20 ${validationErrors.phone ? "border-error/50" : "border-border/40"}`}
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, phone: e.target.value }));
                    setValidationErrors((p) => ({ ...p, phone: "" }));
                  }}
                />
                {validationErrors.phone && (
                  <p className="text-xs text-destructive mt-1">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Public Email
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 placeholder:text-foreground/20 ${validationErrors.email ? "border-error/50" : "border-border/40"}`}
                  placeholder="bookings@yourvenue.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, email: e.target.value }));
                    setValidationErrors((p) => ({ ...p, email: "" }));
                  }}
                />
                {validationErrors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Organization Type
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3.5 rounded-2xl border border-border/40 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/25 transition-all appearance-none font-bold"
                    value={formData.organizationType}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        organizationType: e.target.value,
                      }))
                    }
                  >
                    {ORG_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
                    <Plus size={16} className="rotate-45" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Official Website
                </label>
                <input
                  type="url"
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 placeholder:text-foreground/20 ${validationErrors.website ? "border-error/50" : "border-border/40"}`}
                  placeholder="https://yourstage.com"
                  value={formData.website}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, website: e.target.value }));
                    setValidationErrors((p) => ({ ...p, website: "" }));
                  }}
                />
                {validationErrors.website && (
                  <p className="text-xs text-destructive mt-1">
                    {validationErrors.website}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Mission Statement (Bio)
                </label>
                <span className="text-[10px] font-bold text-foreground/20">
                  {formData.bio.length}/1000
                </span>
              </div>
              <textarea
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3.5 rounded-2xl border border-border/40 bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 resize-none placeholder:text-foreground/20"
                placeholder="Describe your organization, the kind of events you host, and what you look for in musicians…"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, bio: e.target.value }))
                }
              />
            </div>
          </section>

          {/* ── Location ── */}
          <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
              <span className="h-6 w-1 bg-primary rounded-full" />
              The Venue (Location)
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                Location
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3.5 rounded-2xl border bg-secondary/20 outline-none transition-all focus:ring-2 focus:ring-primary/25 ${validationErrors.location ? "border-error/50" : "border-border/40"}`}
                value={formData.location}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, location: e.target.value }));
                  setValidationErrors((p) => ({ ...p, location: "" }));
                }}
              />
              {validationErrors.location && (
                <p className="text-xs text-destructive mt-1">
                  {validationErrors.location}
                </p>
              )}
            </div>
          </section>

          {/* ── Event Types ── */}
          <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
              <span className="h-6 w-1 bg-primary rounded-full" />
              Event Curation
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Event Types
                </p>
                {validationErrors.eventTypes && (
                  <p className="text-xs text-error">
                    {validationErrors.eventTypes}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.eventTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase"
                  >
                    {type}
                    <button
                      type="button"
                      onClick={() => removeEventType(type)}
                      className="hover:scale-110 transition-transform"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 rounded-2xl border border-border/40 bg-secondary/20 outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm placeholder:text-foreground/20"
                  placeholder="e.g. Underground Rave, Rooftop Party..."
                  value={newEventType}
                  list="event-type-suggestions"
                  onChange={(e) => setNewEventType(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addEventType())
                  }
                />
                <datalist id="event-type-suggestions">
                  {EVENT_TYPE_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={addEventType}
                  className="px-4 py-3 bg-secondary/40 hover:bg-secondary/60 rounded-2xl transition-all font-bold"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </section>

          {/* ── Media ── */}
          <section className="bg-card border border-border/60 rounded-[2rem] p-8 md:p-10 shadow-xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
              <span className="h-6 w-1 bg-primary rounded-full" />
              Atmosphere (Media)
            </h2>

            {/* Profile Picture */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Profile Picture
              </h3>
              <div className="flex items-start gap-5">
                <div className="shrink-0">
                  {formData.profilePicture ? (
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-border group">
                      <img
                        src={resolveMediaUrl(formData.profilePicture)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, profilePicture: "" }))
                        }
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={20} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <Building2
                        size={32}
                        className="text-muted-foreground/40"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <MediaUpload
                    label="Upload Logo / Profile Photo"
                    accept="image/*"
                    responseField="profilePicture"
                    uploadFn={(file) =>
                      getAuthToken().then((token) =>
                        uploadOrganizerMedia(
                          token!,
                          API.ORGANIZER.UPLOAD_PIC,
                          "profilePicture",
                          file,
                        ),
                      )
                    }
                    onUploadSuccess={(url) =>
                      setFormData((p) => ({
                        ...p,
                        profilePicture: url as string,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Gallery Photos */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Camera size={14} /> Gallery Photos
              </h3>
              <MediaUpload
                multiple
                maxFiles={10}
                label="Upload Organization / Event Photos"
                accept="image/*"
                responseField="photos"
                uploadFn={(files) =>
                  getAuthToken().then((token) =>
                    uploadOrganizerMedia(
                      token!,
                      API.ORGANIZER.UPLOAD_PHOTOS,
                      "photos",
                      files,
                    ),
                  )
                }
                onUploadSuccess={(urls) =>
                  setFormData((p) => ({ ...p, photos: urls as string[] }))
                }
              />
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {formData.photos.map((url, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted"
                    >
                      <img
                        src={resolveMediaUrl(url)}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleMediaDelete(
                            API.ORGANIZER.UPLOAD_PHOTOS,
                            url,
                            "photos",
                          )
                        }
                        className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Documents */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Business
                Verification
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium italic">
                Upload business licenses, tax forms, or other legal documents to
                get verified and build trust with talent.
              </p>
              <MediaUpload
                multiple
                maxFiles={5}
                label="Add Verification Documents"
                accept=".pdf,image/*"
                responseField="verificationDocuments"
                uploadFn={(files) =>
                  getAuthToken().then((token) =>
                    uploadOrganizerMedia(
                      token!,
                      API.ORGANIZER.UPLOAD_DOCS,
                      "verificationDocuments",
                      files,
                    ),
                  )
                }
                onUploadSuccess={(urls) =>
                  setFormData((p) => ({
                    ...p,
                    verificationDocuments: [
                      ...formData.verificationDocuments,
                      ...(urls as string[]),
                    ],
                  }))
                }
              />
              {formData.verificationDocuments &&
                formData.verificationDocuments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {formData.verificationDocuments.map((url, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group"
                      >
                        <span className="text-xs font-bold truncate max-w-[200px]">
                          {url.split("/").pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleMediaDelete(
                              API.ORGANIZER.UPLOAD_DOCS,
                              url,
                              "verificationDocuments" as any,
                            )
                          } // Cast as any because handleMediaDelete doesn't have it yet, or better fix handleMediaDelete
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </section>

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-6 pt-6 translate-y-4">
            <div className="w-full sm:w-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-border/40 text-sm font-bold uppercase tracking-widest hover:bg-secondary/40 transition-all"
              >
                Discard Changes
              </button>

              {hasProfile && !formData.isVerified && (
                <button
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={
                    requestingVerification || formData.verificationRequested
                  }
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.15em] hover:bg-primary/10 transition-all disabled:opacity-50"
                >
                  {formData.verificationRequested
                    ? "Request Pending"
                    : requestingVerification
                      ? "Requesting..."
                      : "Request Verification"}
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex items-center gap-3">
              {(formData.isVerified || formData.verificationRequested) && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider ${
                    formData.isVerified
                      ? "bg-success/10 text-success border border-success/25"
                      : "bg-warning/10 text-warning border border-warning/25"
                  }`}
                >
                  {formData.isVerified ? "Verified" : "Verification Pending"}
                </span>
              )}

              <button
                type="submit"
                disabled={saving || saved}
                className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-foreground text-background text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : saved ? (
                  <CheckCircle size={20} />
                ) : (
                  <Save size={20} />
                )}
                {saving
                  ? "Processing..."
                  : saved
                    ? "Published"
                    : hasProfile
                      ? "Update Profile"
                      : "Launch Profile"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
