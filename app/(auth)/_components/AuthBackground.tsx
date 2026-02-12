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
        className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px]"
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
        className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[100px]"
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
        className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-pink-500/15 blur-[100px]"
      />
    </div>
  );
}
