"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Music, MapPin, DollarSign, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";

export default function Home() {
  const features = [
    { icon: Music, title: "Find Your Sound", desc: "Discover gigs that match your unique genre and style perfectly." },
    { icon: MapPin, title: "Local & Touring", desc: "From hometown bars to cross-country corporate events, find gigs anywhere." },
    { icon: DollarSign, title: "Secure Payments", desc: "Transparent pay rates and secure platform handling for peace of mind." },
    { icon: ShieldCheck, title: "Verified Organizers", desc: "We vet our event hosts so you can focus entirely on your performance." },
    { icon: Zap, title: "Instant Connect", desc: "Direct messaging and real-time notifications keep you in the loop." },
    { icon: Star, title: "Build Your Rep", desc: "Gain reviews and level up your profile to land bigger, better gigs." },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground overflow-hidden">
      
      {/* Navbar (Public) */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass-morphism py-4">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Music size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter">Get-a-Gig</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-bold bg-foreground text-background px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all">
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6">
        <div className="absolute inset-0 z-0 mesh-gradient opacity-60" />
        
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-8 border border-primary/20 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The #1 Network for Live Music
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-foreground mb-8"
          >
            Stop waiting. <br className="hidden md:block" />
            Start <span className="gradient-text">Playing.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-12"
          >
            Connect directly with venues, event organizers, and studios looking for your exact sound. Book gigs, build your network, and get paid.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register?role=musician" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all group flex items-center justify-center gap-2">
              I'm a Musician
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register?role=organizer" className="w-full sm:w-auto px-8 py-4 rounded-full bg-card border border-border text-foreground font-bold text-lg hover:bg-secondary transition-all">
              I need Talent
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-secondary/30 border-t border-border/40 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Everything you need to gig.</h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto">We handle the boring logistics so you can focus entirely on the performance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 rounded-[2rem] bg-card border border-border/60 hover:border-primary/30 transition-colors group"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 relative z-10">Ready to hit the stage?</h2>
          <p className="text-muted-foreground font-medium mb-10 relative z-10">Join thousands of musicians already booking daily.</p>
          
          <Link href="/register" className="inline-flex px-8 py-4 rounded-full bg-foreground text-background font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10 relative z-10">
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-border/40">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">© {new Date().getFullYear()} Get-a-Gig. All rights reserved.</p>
      </footer>
    </div>
  );
}
