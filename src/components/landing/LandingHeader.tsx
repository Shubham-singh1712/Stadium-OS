"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function LandingHeader() {
  const [metrics, setMetrics] = useState({
    fans: 78420,
    confidence: 98.4,
    protocols: 2,
    sensors: 4192
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        fans: prev.fans + Math.floor(Math.random() * 5) - 1,
        confidence: Math.min(99.9, Math.max(97.0, prev.confidence + (Math.random() * 0.4 - 0.2))),
        protocols: prev.protocols,
        sensors: 4192 + Math.floor(Math.random() * 3) - 1
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center text-center select-none w-full">
      {/* Cortex AI badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-6"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/50">
          Cortex AI Core · System Nominal
        </span>
      </motion.div>

      {/* StadiumOS AI title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-black tracking-tighter mb-4 flex items-center justify-center gap-2 drop-shadow-2xl"
      >
        <span className="text-white">StadiumOS</span>
        <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">AI</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="text-sm md:text-base text-white/60 tracking-wide max-w-lg font-medium mb-10"
      >
        The intelligent operating system coordinating crowd dynamics, security, and operations for FIFA World Cup 2026.
      </motion.p>

      {/* Live Operations Strip */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-6 md:gap-12 px-8 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Active Fans</span>
          <motion.span 
            key={metrics.fans}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg font-bold text-white font-mono tracking-tight"
          >
            {metrics.fans.toLocaleString()}
          </motion.span>
        </div>
        
        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">AI Confidence</span>
          <motion.span 
            key={metrics.confidence}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg font-bold text-emerald-400 font-mono tracking-tight"
          >
            {metrics.confidence.toFixed(1)}%
          </motion.span>
        </div>

        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Protocols</span>
          <span className="text-lg font-bold text-amber-400 font-mono tracking-tight">
            {metrics.protocols}
          </span>
        </div>

        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Sensors</span>
          <motion.span 
            key={metrics.sensors}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg font-bold text-sky-400 font-mono tracking-tight"
          >
            {metrics.sensors.toLocaleString()}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
