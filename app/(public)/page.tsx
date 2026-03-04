"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Music,
  MapPin,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Music,
      title: "Find Your Sound",
      desc: "Discover gigs that match your unique genre and style perfectly.",
    },
    {
      icon: MapPin,
      title: "Local & Touring",
      desc: "From hometown bars to cross-country corporate events, find gigs anywhere.",
    },
    {
      icon: DollarSign,
      title: "Secure Payments",
      desc: "Transparent pay rates and secure platform handling for peace of mind.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Organizers",
      desc: "We vet our event hosts so you can focus entirely on your performance.",
    },
    {
      icon: Zap,
      title: "Instant Connect",
      desc: "Direct messaging and real-time notifications keep you in the loop.",
    },
    {
      icon: Star,
      title: "Build Your Rep",
      desc: "Gain reviews and level up your profile to land bigger, better gigs.",
    },
  ];

  const highlights = [
    "Create a profile in minutes",
    "Apply to verified gigs",
    "Chat directly with organizers",
  ];

  return (
    <div className="selection:bg-primary/20 selection:text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-14 md:px-10 md:py-16">
        <div className="absolute inset-0 z-0 mesh-gradient opacity-40" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Trusted by Musicians & Organizers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-4xl font-black tracking-tight text-foreground md:text-6xl"
          >
            Find the right gig. <br className="hidden md:block" />
            Book faster with <span className="gradient-text">Get-a-Gig</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-base font-medium text-muted-foreground md:text-lg"
          >
            Connect directly with venues, event organizers, and studios looking
            for your exact sound. Build reputation, grow your network, and get
            booked with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-10 flex flex-wrap items-center justify-center gap-4"
          >
            {highlights.map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-foreground"
              >
                <CheckCircle2 size={16} className="text-primary" />
                {item}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register?role=musician"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto"
            >
              I'm a Musician
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/register?role=organizer"
              className="w-full rounded-full border border-border bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              I need Talent
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black tracking-tight md:text-4xl">
              Everything you need to gig
            </h2>
            <p className="mx-auto max-w-xl font-medium text-muted-foreground">
              Simple workflows for discovering, applying, and managing
              opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group rounded-3xl border border-border/60 bg-card p-7 transition-colors hover:border-primary/40"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pb-10 pt-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-10 text-center md:p-12">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />

          <h2 className="relative z-10 mb-4 text-3xl font-black tracking-tight md:text-4xl">
            Ready to hit the stage?
          </h2>
          <p className="relative z-10 mb-8 font-medium text-muted-foreground">
            Join thousands of musicians and organizers already booking through
            Get-a-Gig.
          </p>

          <Link
            href="/register"
            className="relative z-10 inline-flex rounded-full bg-foreground px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-background transition-transform hover:scale-105 active:scale-95"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground md:text-sm">
          © {new Date().getFullYear()} Get-a-Gig. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
