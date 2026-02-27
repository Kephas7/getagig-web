"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGigApplications, updateApplicationStatus } from "@/lib/api/application";
import { getGigById, Gig } from "@/lib/api/gig";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Loader2, User, CheckCircle, 
  XCircle, Clock, Music, Briefcase, Mail, 
  ChevronRight, ExternalLink, ShieldCheck
} from "lucide-react";
import { getAuthToken } from "@/lib/cookies";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function GigApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [gig, setGig] = useState<Gig | null>(null);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const [gigRes, appRes] = await Promise.all([
        getGigById(id as string),
        getGigApplications(token, id as string)
      ]);

      if (gigRes.success) setGig(gigRes.data);
      if (appRes.success) setApplications(appRes.data);
    } catch (err: any) {
      setError("Failed to load applications.");
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleStatusUpdate = async (appId: string, status: "accepted" | "rejected") => {
    setProcessingId(appId);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await updateApplicationStatus(token, appId, status);
      if (response.success) {
        toast.success(`Application ${status === "accepted" ? "accepted" : "rejected"}!`);
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <OrganizerHeader />

      <main className="mx-auto max-w-6xl px-5 lg:px-8 pt-32 pb-20">
        <motion.div {...fadeUp(0)} className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => router.push("/organizer/gigs")}
            className="p-3 rounded-2xl bg-card border border-border/60 text-muted-foreground hover:text-foreground transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
             <h1 className="text-4xl font-black tracking-tight">Talent <span className="text-primary">Applications</span></h1>
             <p className="mt-1 text-muted-foreground font-medium flex items-center gap-2">
                Managing applicants for <span className="text-foreground font-bold">{gig?.title}</span>
             </p>
          </div>
        </motion.div>

        {applications.length === 0 ? (
          <motion.div {...fadeUp(0.1)} className="bg-card border-2 border-dashed border-border/60 rounded-[3rem] p-20 text-center">
            <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
              <User size={40} className="text-primary/40" />
            </div>
            <h2 className="text-2xl font-black mb-2">No applications yet</h2>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              Hang tight! Your gig has been posted and talent will begin applying soon.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {applications.map((app, index) => (
                <motion.div 
                  key={app.id} 
                  {...fadeUp(index * 0.05)}
                  className="bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -z-10 transition-colors ${
                    app.status === 'accepted' ? 'bg-emerald-500/10' : 
                    app.status === 'rejected' ? 'bg-destructive/10' : 'bg-primary/5'
                  }`} />

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Musician Info */}
                    <div className="flex items-center gap-6 flex-1">
                       <div className="h-24 w-24 rounded-[2rem] bg-secondary flex items-center justify-center border-4 border-background shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
                          {app.musician?.profilePicture ? (
                            <img src={resolveMediaUrl(app.musician.profilePicture)} alt={app.musician.stageName} className="h-full w-full object-cover" />
                          ) : (
                            <User size={32} className="text-muted-foreground" />
                          )}
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className="text-2xl font-black">{app.musician?.stageName}</h3>
                             <ShieldCheck size={18} className="text-primary" />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                             {app.musician?.instruments.slice(0, 3).map((inst: string, iIdx: number) => (
                               <span key={`${inst}-${iIdx}`} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-lg border border-primary/10">
                                 {inst}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                       <div className="flex items-center justify-between md:justify-end gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Application Status</span>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                            app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            app.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {app.status === 'pending' ? <Clock size={12} /> : app.status === 'accepted' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {app.status}
                          </div>
                       </div>

                       <div className="flex gap-3">
                          <Link 
                            href={`/musician/profile/${app.musicianId}`}
                            className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-secondary hover:bg-secondary/70 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                          >
                            Profile <ExternalLink size={14} />
                          </Link>
                          
                          {app.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                disabled={processingId === app.id}
                                className="h-12 w-12 rounded-2xl border border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                              >
                                <XCircle size={20} />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                disabled={processingId === app.id}
                                className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {processingId === app.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Accept
                              </button>
                            </>
                          )}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
