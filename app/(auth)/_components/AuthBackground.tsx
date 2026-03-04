"use client";

import { motion } from "framer-motion";

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden mesh-gradient">
      {/* Animated Blobs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-[10%] -left-[5%] h-[40%] w-[40%] rounded-full bg-white/8 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -right-[10%] top-[20%] h-[35%] w-[35%] rounded-full blur-[100px]"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--spotlight) 22%, transparent)",
        }}
      />
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-[10%] left-[20%] h-[45%] w-[45%] rounded-full bg-white/6 blur-[100px]"
      />

      <div
        className="absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--spotlight) 18%, transparent) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
