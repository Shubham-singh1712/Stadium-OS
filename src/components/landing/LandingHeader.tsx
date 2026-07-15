"use client";

import { motion } from "framer-motion";

export function LandingHeader() {
  return (
    <div className="flex flex-col items-center text-center select-none">
      {/* Cortex AI badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/50">
          Cortex AI · FIFA World Cup 2026
        </span>
      </motion.div>

      {/* StadiumOS AI title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="text-4xl md:text-6xl font-black tracking-tight mb-3 flex items-center justify-center gap-1"
      >
        <span className="text-white">StadiumOS</span>
        <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">AI</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="text-[13px] md:text-sm text-white/45 tracking-wide max-w-sm font-normal"
      >
        The AI Operating System powering FIFA World Cup 2026.
      </motion.p>
    </div>
  );
}
