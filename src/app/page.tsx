"use client";

import { useState, useEffect } from "react";
import { useMotionValue, useSpring, useTransform, useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { RolePortal } from "@/components/landing/RolePortal";
import { ConsoleTicker } from "@/components/landing/ConsoleTicker";
import type { UserRole } from "@/types";

const PORTALS = [
  { role: "fan" as UserRole, color: "#3b82f6" },
  { role: "volunteer" as UserRole, color: "#10b981" },
  { role: "security" as UserRole, color: "#ef4444" },
  { role: "operations" as UserRole, color: "#a78bfa" },
] as const;

export default function HomePage() {
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  // Motion Values for cursor tracking
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
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) - 0.5;
      const normalizedY = (e.clientY / window.innerHeight) - 0.5;
      
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY, mouseX, mouseY]);

  // Background Parallax Offsets
  const bgXVal = shouldReduceMotion ? 0 : useTransform(mouseXSpring, [-0.5, 0.5], [12, -12]);
  const bgYVal = shouldReduceMotion ? 0 : useTransform(mouseYSpring, [-0.5, 0.5], [12, -12]);

  const isAnyHovered = hoveredRole !== null;

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-between py-12 md:py-20 bg-[#01040a] font-sans holographic-grid">
      {/* 1. Full-screen football stadium background with Parallax & Zoom */}
      <motion.div
        className="absolute inset-0 z-0 select-none pointer-events-none"
        style={{ x: bgXVal, y: bgYVal }}
        animate={{ scale: shouldReduceMotion ? 1 : isAnyHovered ? 1.01 : 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 24 }}
      >
        <motion.img
          src="/stadium bg .png"
          alt="FIFA Stadium"
          className="w-full h-full object-cover object-center"
          animate={{
            filter: shouldReduceMotion
              ? "brightness(1)"
              : isAnyHovered 
                ? "brightness(1.08) contrast(1.02)"
                : ["brightness(0.94)", "brightness(1.04)", "brightness(0.94)"],
          }}
          transition={{
            filter: isAnyHovered 
              ? { duration: 0.6, ease: "easeOut" } 
              : { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </motion.div>

      {/* 2. Dark cinematic overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#01040a]/70 via-[#01040a]/85 to-[#01040a]" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(1,4,10,0.9)_100%)]" />

      {/* Subtle radial aura centered on the active hovered role */}
      <AnimatePresence>
        {hoveredRole && (
          <motion.div
            key={hoveredRole}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: `radial-gradient(circle 550px at 50% 55%, ${
                PORTALS.find((p) => p.role === hoveredRole)?.color
              }40 0%, transparent 100%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* 4. Cursor Ambient Glow */}
      {!shouldReduceMotion && (
        <motion.div
          className="pointer-events-none fixed w-[500px] h-[500px] rounded-full blur-[100px] bg-sky-500/[0.03] z-20"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-6 gap-16 md:gap-24">
        <LandingHeader />

        <RolePortal onHoverChange={setHoveredRole} />

        <ConsoleTicker />
      </div>
    </main>
  );
}
