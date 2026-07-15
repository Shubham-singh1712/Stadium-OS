"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Compass, HelpingHand, Shield, Sliders } from "lucide-react";
import { ConnectionOverlay } from "./ConnectionOverlay";
import type { UserRole } from "@/types";

const PORTALS = [
  {
    role: "fan" as UserRole,
    label: "Fan",
    icon: Compass,
    color: "#3b82f6", // Electric Blue
    rgb: "59,130,246",
    positionClass: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    floatDelay: 0,
    description: "Access match tickets, live stats, and fan experiences.",
  },
  {
    role: "volunteer" as UserRole,
    label: "Volunteer",
    icon: HelpingHand,
    color: "#10b981", // Emerald
    rgb: "16,185,129",
    positionClass: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
    floatDelay: 1.5,
    description: "Manage coordinator assignments and guest services.",
  },
  {
    role: "security" as UserRole,
    label: "Security",
    icon: Shield,
    color: "#ef4444", // Crimson
    rgb: "239,68,68",
    positionClass: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
    floatDelay: 3.0,
    description: "Monitor stadium alerts, safety routing, and crowd density.",
  },
  {
    role: "operations" as UserRole,
    label: "Operations",
    icon: Sliders,
    color: "#a78bfa", // Purple
    rgb: "167,139,250",
    positionClass: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    floatDelay: 4.5,
    description: "Control real-time match operations and resource flow.",
  },
] as const;

interface RolePortalProps {
  onHoverChange: (role: UserRole | null) => void;
}

export function RolePortal({ onHoverChange }: RolePortalProps) {
  const router = useRouter();
  const { setRole } = useAuthStore();
  const [hoveredRole, setHoveredRoleState] = useState<UserRole | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  
  const [mouseOffset, setMouseOffset] = useState<Record<UserRole, { x: number; y: number }>>({
    fan: { x: 0, y: 0 },
    volunteer: { x: 0, y: 0 },
    security: { x: 0, y: 0 },
    operations: { x: 0, y: 0 },
  });

  const shouldReduceMotion = useReducedMotion();

  const setHoveredRole = (role: UserRole | null) => {
    setHoveredRoleState(role);
    onHoverChange(role);
  };

  useEffect(() => {
    if (hoveredRole) {
      const timer = setTimeout(() => {
        setActiveRole(hoveredRole);
      }, 320); // Core-to-portal flight duration
      return () => clearTimeout(timer);
    } else {
      setActiveRole(null);
    }
  }, [hoveredRole]);

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    router.push(`/${role}`);
  };

  const handlePortalMouseMove = (role: UserRole, e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // Normalized -1 to 1
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2); // Normalized -1 to 1
    setMouseOffset((prev) => ({
      ...prev,
      [role]: { x: x * 6, y: y * 6 }, // Magnet offset max 6px
    }));
  };

  const handlePortalMouseLeave = (role: UserRole) => {
    setHoveredRole(null);
    setMouseOffset((prev) => ({
      ...prev,
      [role]: { x: 0, y: 0 },
    }));
  };

  const isAnyHovered = hoveredRole !== null;
  const isAnyActive = activeRole !== null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
      className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] flex items-center justify-center"
    >
      <ConnectionOverlay
        hoveredRole={hoveredRole}
        activeRole={activeRole}
        shouldReduceMotion={shouldReduceMotion}
      />

      {/* Central Cortex AI Core Node */}
      <div className="absolute w-8 h-8 flex items-center justify-center z-20 pointer-events-none select-none">
        <motion.div
          className="absolute inset-0 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          animate={{
            scale: isAnyHovered ? [1, 1.25, 1] : 1,
            borderColor: isAnyHovered 
              ? `rgba(${PORTALS.find((p) => p.role === hoveredRole)?.rgb}, 0.3)` 
              : "rgba(255, 255, 255, 0.08)",
          }}
          transition={{
            scale: { duration: 0.6, ease: "easeInOut" }
          }}
        >
          {/* Inner Glowing Core Dot */}
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-white/60"
            animate={{
              backgroundColor: isAnyHovered 
                ? PORTALS.find((p) => p.role === hoveredRole)?.color 
                : "rgba(255,255,255,0.35)",
              boxShadow: isAnyHovered
                ? `0 0 10px ${PORTALS.find((p) => p.role === hoveredRole)?.color}`
                : "0 0 0px transparent",
              scale: isAnyHovered ? [1, 1.35, 1] : 1,
            }}
            transition={{
              scale: { duration: 0.6, ease: "easeInOut" }
            }}
          />
        </motion.div>
      </div>

      {/* Portals rendering */}
      {PORTALS.map((portal) => {
        const Icon = portal.icon;
        const isHovered = hoveredRole === portal.role;
        const isActive = activeRole === portal.role;

        // Repel / displacement logic
        let xOffset = 0;
        let yOffset = 0;

        if (isActive) {
          yOffset = -9;
        } else if (isAnyActive) {
          if (portal.role === "fan") {
            yOffset = -3;
          } else if (portal.role === "volunteer") {
            xOffset = -3;
          } else if (portal.role === "security") {
            xOffset = 3;
          } else if (portal.role === "operations") {
            yOffset = 3;
          }
        }

        const magX = mouseOffset[portal.role]?.x || 0;
        const magY = mouseOffset[portal.role]?.y || 0;

        return (
          <div
            key={portal.role}
            className={`absolute w-28 h-28 flex items-center justify-center z-10 ${portal.positionClass}`}
          >
            <motion.div
              className="w-full h-full relative flex items-center justify-center"
              animate={{
                y: shouldReduceMotion ? 0 : [-6, 6, -6],
              }}
              transition={
                shouldReduceMotion
                  ? {}
                  : {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: portal.floatDelay,
                    }
              }
            >
              {/* Outer aura on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.12 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-[-12px] rounded-[32px] pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, rgba(${portal.rgb}, 0.15) 0%, transparent 70%)`,
                      border: `1px solid rgba(${portal.rgb}, 0.2)`,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Floating particles */}
              <AnimatePresence>
                {isActive && !shouldReduceMotion && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.6, scale: 1, y: [-3, 3, -3] }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
                      className="absolute w-1.5 h-1.5 rounded-full bg-white/60 pointer-events-none z-30"
                      style={{ top: "-14px", left: "24px", boxShadow: `0 0 6px ${portal.color}` }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.5, scale: 1, y: [3, -3, 3] }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }}
                      className="absolute w-1 h-1 rounded-full bg-white/50 pointer-events-none z-30"
                      style={{ bottom: "-12px", right: "32px", boxShadow: `0 0 5px ${portal.color}` }}
                    />
                  </>
                )}
              </AnimatePresence>

              <motion.button
                onMouseEnter={() => setHoveredRole(portal.role)}
                onMouseMove={(e) => handlePortalMouseMove(portal.role, e)}
                onMouseLeave={() => handlePortalMouseLeave(portal.role)}
                onClick={() => handleSelectRole(portal.role)}
                className="absolute flex flex-col items-center justify-center p-4 cursor-pointer outline-none select-none overflow-hidden transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                style={{
                  boxShadow: isActive
                    ? `0 16px 40px rgba(${portal.rgb}, 0.24)`
                    : "0 8px 32px rgba(0, 0, 0, 0.4)",
                  border: "1px solid",
                  borderColor: isActive
                    ? `rgba(${portal.rgb}, 0.38)`
                    : "rgba(255, 255, 255, 0.06)",
                }}
                animate={{
                  x: xOffset + magX,
                  y: yOffset + magY,
                  width: isActive ? "260px" : "112px",
                  height: isActive ? "154px" : "112px",
                  borderRadius: isActive ? "22px" : "56px",
                  scale: isHovered ? 1.03 : isAnyHovered ? 0.92 : 1,
                  opacity: isAnyHovered && !isHovered ? 0.45 : 1,
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.085)" : "rgba(255, 255, 255, 0.02)",
                  backdropFilter: isActive ? "brightness(1.22) blur(24px)" : "brightness(1) blur(16px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                }}
              >
                {/* Reflection effect */}
                <AnimatePresence>
                  {isActive && !shouldReduceMotion && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="absolute inset-0 pointer-events-none select-none z-10"
                      style={{
                        background: "linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%)"
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Node tag */}
                <div className="absolute top-2 right-3 flex items-center gap-1 opacity-40 transition-opacity">
                  <span className="w-1 h-1 rounded-full bg-white/40 transition-colors duration-300" style={{ backgroundColor: isActive ? portal.color : undefined }} />
                  <span className="text-[7px] font-semibold tracking-wider text-white/30 uppercase select-none">Node</span>
                </div>

                {/* Emblem & Title */}
                <div className="flex flex-col items-center gap-1.5 select-none pointer-events-none z-20">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center relative mb-0.5 bg-white/[0.01] shadow-[inset_0_1px_6px_rgba(255,255,255,0.03)] transition-colors duration-300">
                    <Icon
                      size={20}
                      className="transition-colors duration-300 relative z-10 animate-none"
                      style={{
                        color: isActive ? portal.color : "rgba(255, 255, 255, 0.5)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] sm:text-[10px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
                    style={{
                      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {portal.label}
                  </span>
                </div>

                {/* Description & CTA */}
                <AnimatePresence>
                  {isActive && (
                    <div className="flex flex-col items-center w-full z-20">
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ delay: 0.08, type: "spring", stiffness: 180, damping: 20 }}
                        className="text-[11px] text-white/55 font-normal leading-normal max-w-[210px] text-center mt-2.5"
                      >
                        {portal.description}
                      </motion.p>
                      
                      <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ delay: 0.18, type: "spring", stiffness: 180, damping: 20 }}
                        className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 mt-2.5 transition-transform duration-300 hover:translate-x-1"
                        style={{ color: portal.color }}
                      >
                        Enter Command Center →
                      </motion.span>
                    </div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}
