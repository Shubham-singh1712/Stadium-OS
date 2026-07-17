"use client";

import { useState } from "react";
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
    color: "#3b82f6",
    rgb: "59,130,246",
    positionClass: "top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2",
    description: "Live match stats and immersive experiences.",
  },
  {
    role: "security" as UserRole,
    label: "Security",
    icon: Shield,
    color: "#ef4444",
    rgb: "239,68,68",
    positionClass: "right-[15%] top-1/2 translate-x-1/2 -translate-y-1/2",
    description: "Crowd density and safety protocol routing.",
  },
  {
    role: "operations" as UserRole,
    label: "Operations",
    icon: Sliders,
    color: "#a78bfa",
    rgb: "167,139,250",
    positionClass: "bottom-[15%] left-1/2 -translate-x-1/2 translate-y-1/2",
    description: "Real-time match operations and resource flow.",
  },
  {
    role: "volunteer" as UserRole,
    label: "Volunteer",
    icon: HelpingHand,
    color: "#10b981",
    rgb: "16,185,129",
    positionClass: "left-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2",
    description: "Manage assignments and guest services.",
  },
] as const;

interface RolePortalProps {
  onHoverChange: (role: UserRole | null) => void;
}

export function RolePortal({ onHoverChange }: RolePortalProps) {
  const router = useRouter();
  const { setRole } = useAuthStore();
  const [hoveredRole, setHoveredRoleState] = useState<UserRole | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const setHoveredRole = (role: UserRole | null) => {
    setHoveredRoleState(role);
    onHoverChange(role);
  };

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    router.push(`/${role}`);
  };

  const isAnyHovered = hoveredRole !== null;
  const hoveredPortal = PORTALS.find(p => p.role === hoveredRole);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] md:w-[520px] md:h-[520px] flex items-center justify-center"
    >
      <ConnectionOverlay
        hoveredRole={hoveredRole}
        shouldReduceMotion={shouldReduceMotion}
      />

      {/* Glowing AI Core */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 2.0, ease: "easeOut" }}
        className="absolute flex flex-col items-center justify-center z-20 pointer-events-none select-none"
      >
        <motion.div
          className="relative w-20 h-20 flex items-center justify-center rounded-full border border-white/[0.15] backdrop-blur-xl bg-black/40 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          animate={{
            borderColor: isAnyHovered 
              ? `rgba(${hoveredPortal?.rgb}, 0.5)` 
              : "rgba(255,255,255,0.15)",
            boxShadow: isAnyHovered
              ? `0 0 50px rgba(${hoveredPortal?.rgb}, 0.3), inset 0 0 20px rgba(${hoveredPortal?.rgb}, 0.2)`
              : "0 0 30px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,255,255,0.05)",
            scale: isAnyHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Inner core orb */}
          <motion.div
            className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_#ffffff]"
            animate={{
              backgroundColor: isAnyHovered ? hoveredPortal?.color : "#ffffff",
              boxShadow: isAnyHovered 
                ? `0 0 25px ${hoveredPortal?.color}, 0 0 50px ${hoveredPortal?.color}`
                : "0 0 15px #ffffff, 0 0 30px rgba(255,255,255,0.5)",
              scale: isAnyHovered ? [1, 1.2, 1] : [1, 1.05, 1],
            }}
            transition={{
              scale: { duration: isAnyHovered ? 2 : 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        </motion.div>
        <span className="mt-4 text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase">
          Cortex AI
        </span>
      </motion.div>

      {/* Portals rendering */}
      {PORTALS.map((portal, index) => {
        const Icon = portal.icon;
        const isHovered = hoveredRole === portal.role;
        // Softly illuminate other nodes if ANY node is hovered
        const isSoftIlluminated = isAnyHovered && !isHovered;
        
        // Node sequence delay: 2.4s, 2.6s, 2.8s, 3.0s
        const nodeDelay = 2.4 + (index * 0.2);

        return (
          <motion.div
            key={portal.role}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: nodeDelay, ease: "easeOut" }}
            className={`absolute z-30 ${portal.positionClass}`}
          >
            <motion.button
              onMouseEnter={() => setHoveredRole(portal.role)}
              onFocus={() => setHoveredRole(portal.role)}
              onMouseLeave={() => setHoveredRole(null)}
              onBlur={() => setHoveredRole(null)}
              onClick={() => handleSelectRole(portal.role)}
              className="relative flex flex-col items-center justify-center cursor-pointer outline-none select-none transition-all duration-500 group overflow-hidden"
              style={{
                width: isHovered ? "240px" : "130px",
                height: isHovered ? "240px" : "130px",
                borderRadius: isHovered ? "40px" : "50%",
                background: isHovered ? "rgba(10, 14, 23, 0.85)" : isSoftIlluminated ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
                border: "1px solid",
                borderColor: isHovered 
                  ? `rgba(${portal.rgb}, 0.6)` 
                  : isSoftIlluminated ? `rgba(${portal.rgb}, 0.15)` : "rgba(255, 255, 255, 0.1)",
                boxShadow: isHovered
                  ? `0 20px 50px rgba(0,0,0,0.5), inset 0 0 30px rgba(${portal.rgb}, 0.15)`
                  : isSoftIlluminated ? `0 0 15px rgba(${portal.rgb}, 0.05)` : "0 10px 30px rgba(0,0,0,0.3)",
                backdropFilter: isHovered ? "blur(30px)" : "blur(10px)",
              }}
              animate={{
                scale: isHovered ? 1.06 : isSoftIlluminated ? 0.95 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 25,
              }}
            >
              {/* Internal Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none rounded-inherit" />

              {/* Online Indicator */}
              <motion.div 
                className="absolute top-5 right-6 flex items-center gap-1.5 opacity-0 transition-opacity duration-300"
                animate={{ opacity: isHovered ? 0.7 : 0 }}
              >
                <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] animate-pulse" style={{ backgroundColor: portal.color, color: portal.color }} />
                <span className="text-[8px] font-semibold tracking-widest uppercase text-white/60">Online</span>
              </motion.div>

              {/* Emblem & Title */}
              <motion.div 
                className="flex flex-col items-center gap-3 z-20 pointer-events-none"
                animate={{ y: isHovered ? -20 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-500"
                  style={{
                    backgroundColor: isHovered ? `rgba(${portal.rgb}, 0.15)` : "rgba(255,255,255,0.05)",
                    boxShadow: isHovered ? `inset 0 0 15px rgba(${portal.rgb}, 0.3)` : "inset 0 0 10px rgba(255,255,255,0.02)"
                  }}
                >
                  <Icon
                    size={isHovered ? 26 : 22}
                    className="transition-colors duration-500"
                    style={{
                      color: isHovered ? portal.color : isSoftIlluminated ? `rgba(${portal.rgb}, 0.6)` : "rgba(255, 255, 255, 0.7)",
                    }}
                  />
                </div>
                <span
                  className="text-[11px] font-bold tracking-[0.25em] uppercase transition-colors duration-500"
                  style={{
                    color: isHovered ? "#ffffff" : isSoftIlluminated ? "rgba(255,255,255,0.4)" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {portal.label}
                </span>
              </motion.div>

              {/* Description & CTA */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="absolute bottom-12 flex flex-col items-center w-full px-8"
                  >
                    <p className="text-[11px] text-white/50 text-center font-medium leading-relaxed mb-6">
                      {portal.description}
                    </p>
                    
                    <div
                      className="px-6 py-2.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{ 
                        backgroundColor: `rgba(${portal.rgb}, 0.2)`,
                        color: portal.color,
                        border: `1px solid rgba(${portal.rgb}, 0.4)`,
                        boxShadow: `0 0 20px rgba(${portal.rgb}, 0.1)`
                      }}
                    >
                      Enter Command Center <span className="text-xl leading-[0] -mt-[2px] ml-1">→</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
