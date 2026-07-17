"use client";

import { useState, useEffect } from "react";
import { useMotionValue, useSpring, useTransform, useReducedMotion, motion } from "framer-motion";
import { RolePortal } from "@/components/landing/RolePortal";
import type { UserRole } from "@/types";

export default function HomePage() {
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { stiffness: 70, damping: 24 };
  const cursorSpringConfig = { stiffness: 120, damping: 28 };

  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);
  const cursorXSpring = useSpring(cursorX, cursorSpringConfig);
  const cursorYSpring = useSpring(cursorY, cursorSpringConfig);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const normalizedX = (e.clientX / window.innerWidth) - 0.5;
          const normalizedY = (e.clientY / window.innerHeight) - 0.5;
          
          mouseX.set(normalizedX);
          mouseY.set(normalizedY);
          cursorX.set(e.clientX);
          cursorY.set(e.clientY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY, mouseX, mouseY]);

  const transformX = useTransform(mouseXSpring, [-0.5, 0.5], [15, -15]);
  const transformY = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const bgXVal = shouldReduceMotion ? 0 : transformX;
  const bgYVal = shouldReduceMotion ? 0 : transformY;

  const isAnyHovered = hoveredRole !== null;

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-between bg-[#01040a] font-sans py-4 md:py-8">
      {/* 1. Full-screen football stadium background with Parallax & Zoom */}
      <motion.div
        className="absolute inset-0 z-0 select-none pointer-events-none"
        style={{ x: bgXVal, y: bgYVal }}
        animate={{ scale: shouldReduceMotion ? 1 : isAnyHovered ? 1.03 : 1.01 }}
        transition={{ type: "spring", stiffness: 90, damping: 24 }}
      >
        <motion.img
          src="/stadium bg .png"
          alt="FIFA Stadium"
          className="w-full h-full object-cover object-center"
          animate={{
            filter: shouldReduceMotion
              ? "brightness(0.85)"
              : isAnyHovered 
                ? "brightness(0.7) blur(5px) contrast(1.15)"
                : "brightness(0.8) blur(1px)",
          }}
          transition={{
            filter: { duration: 1.2, ease: "easeOut" } 
          }}
        />
        
        {/* Ambient atmospheric motion and floodlight glow */}
        <motion.div 
          className="absolute inset-0 bg-blue-500/10 mix-blend-screen"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Faint moving light rays */}
        <motion.div 
          className="absolute top-0 left-1/4 w-[20%] h-full bg-gradient-to-b from-white/10 to-transparent blur-3xl transform -skew-x-12"
          animate={{ x: ["-10%", "10%", "-10%"], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-0 right-1/4 w-[20%] h-full bg-gradient-to-b from-white/10 to-transparent blur-3xl transform skew-x-12"
          animate={{ x: ["10%", "-10%", "10%"], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* 2. Deep space cinematic overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#01040a]/80 via-[#01040a]/40 to-[#01040a]/90" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(1,4,10,0.98)_100%)]" />

      {/* Subtle ambient particles */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full blur-[1px]"
            initial={{ 
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000) 
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* 3. Cursor Ambient Glow */}
      {!shouldReduceMotion && (
        <motion.div
          className="pointer-events-none fixed w-[500px] h-[500px] rounded-full blur-[100px] bg-sky-400/[0.04] z-20"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      )}

      {/* Content Wrapper */}
      <div className="relative z-30 flex flex-col items-center justify-between w-full h-full max-w-7xl px-4 flex-1">
        
        {/* Header Story */}
        <div className="flex flex-col items-center text-center mt-2 mb-2 select-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
              CORTEX AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 flex items-center justify-center gap-1 drop-shadow-2xl"
          >
            <span className="text-white">StadiumOS</span>
            <span className="bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="text-xs md:text-sm text-white/50 tracking-wide max-w-md font-medium"
          >
            One AI. Four Operational Roles. One Stadium.
          </motion.p>
        </div>

        {/* The Diamond Core */}
        <div className="flex-1 w-full flex items-center justify-center my-2">
          <RolePortal onHoverChange={setHoveredRole} />
        </div>

        {/* Footer Instruction */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3.5 }}
          className="mt-4 mb-2 flex flex-col items-center gap-1 select-none"
        >
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-semibold">Select your operational role</span>
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/70 font-bold">Enter StadiumOS AI</span>
        </motion.div>

      </div>
    </main>
  );
}
