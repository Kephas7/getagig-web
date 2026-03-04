"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGigs, Gig } from "@/lib/api/gig";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Music,
  Loader2,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { resolveMediaUrl } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function MusicianGigsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [totalGigs, setTotalGigs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await getGigs();
        if (response.success) {
          setGigs(response.data.gigs);
          setTotalGigs(response.data.total);
        }
      } catch (err: any) {
        setError("Failed to load gigs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  const filteredGigs = gigs.filter((gig) => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const searchable = [
      gig.title,
      gig.description,
      gig.eventType,
      gig.location,
      ...(gig.genres || []),
      ...(gig.instruments || []),
      gig.organizer?.displayName,
      gig.organizer?.organizationName,
      gig.organizer?.username,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
    const matchesType =
      filterType === "all" ||
      gig.eventType.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Hunting for available gigs…
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MusicianHeader />

      <main className="mx-auto max-w-6xl px-5 lg:px-8 pt-30 pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3 border border-primary/20">
              <Sparkles size={14} />
              Live Opportunities
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Find Your Next <span className="text-primary">Gig</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Explore live performances, studio sessions, and corporate
              opportunities tailored to your sound.
            </p>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <motion.div
          {...fadeUp(0.1)}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8"
        >
          <div className="md:col-span-2 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by gig title, description, or keyword..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/90 border border-border/60 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-border transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative md:col-span-1">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <select
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-card/90 border border-border/60 outline-none transition-all appearance-none text-sm font-medium cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-border"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Event Types</option>
              <option value="wedding">Weddings</option>
              <option value="club">Club / Venue</option>
              <option value="private">Private Gigs</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div className="md:col-span-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold uppercase tracking-wide text-primary">
            {searchTerm || filterType !== "all"
              ? filteredGigs.length
              : totalGigs}{" "}
            Gigs Found
          </div>
        </motion.div>

        {/* Gig Grid */}
        <AnimatePresence mode="popLayout">
          {filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGigs.map((gig, index) => (
                <motion.div
                  key={gig.id}
                  layout
                  {...fadeUp(0.2 + index * 0.05)}
                  className="group flex flex-col bg-card border border-border/60 rounded-3xl p-6 transition-colors"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {gig.organizer?.profilePicture ? (
                        <img
                          src={resolveMediaUrl(gig.organizer.profilePicture)}
                          alt={
                            gig.organizer.displayName ||
                            gig.organizer.organizationName ||
                            gig.organizer.username ||
                            "Organizer"
                          }
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                          {(
                            gig.organizer?.displayName ||
                            gig.organizer?.organizationName ||
                            gig.organizer?.username ||
                            "O"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          Organizer
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {gig.organizer?.displayName ||
                            gig.organizer?.organizationName ||
                            gig.organizer?.username ||
                            "Organizer"}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wide">
                      {gig.status}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {gig.title}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <MapPin size={16} className="text-primary/70" />
                      {gig.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <DollarSign size={16} className="text-primary/70" />
                      <span className="text-foreground font-semibold">
                        Rs. {gig.payRate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Clock size={16} className="text-primary/70" />
                      Due: {new Date(gig.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto mb-6">
                    {gig.genres.slice(0, 2).map((genre, gIdx) => (
                      <span
                        key={`${genre}-${gIdx}`}
                        className="px-3 py-1 rounded-lg bg-secondary/50 text-[11px] font-medium text-muted-foreground"
                      >
                        {genre}
                      </span>
                    ))}
                    {gig.genres.length > 2 && (
                      <span className="px-3 py-1 rounded-lg bg-secondary/30 text-[11px] font-medium text-muted-foreground/60">
                        +{gig.genres.length - 2}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/musician/gigs/${gig.id}`}
                    className="flex items-center justify-between w-full px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold uppercase tracking-wide transition-colors hover:opacity-90 group/btn"
                  >
                    View Details
                    <ArrowRight
                      size={18}
                      className="translate-x-0 group-hover/btn:translate-x-1 transition-transform"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              {...fadeUp(0.2)}
              className="text-center py-16 px-8 rounded-3xl border border-dashed border-border/60 bg-secondary/5"
            >
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                <Music size={32} />
              </div>
              <h2 className="text-xl font-semibold mb-2">No matching gigs</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find any gigs matching your criteria. Try adjusting
                your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-colors hover:opacity-90"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
