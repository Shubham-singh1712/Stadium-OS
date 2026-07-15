"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { UserRole } from "@/types";

interface ConnectionOverlayProps {
  hoveredRole: UserRole | null;
  activeRole: UserRole | null;
  shouldReduceMotion: boolean | null;
}

const PORTALS = [
  { role: "fan" as UserRole, color: "#3b82f6", rgb: "59,130,246" },
  { role: "volunteer" as UserRole, color: "#10b981", rgb: "16,185,129" },
  { role: "security" as UserRole, color: "#ef4444", rgb: "239,68,68" },
  { role: "operations" as UserRole, color: "#a78bfa", rgb: "167,139,250" },
] as const;

const getSvgPath = (from: UserRole, to: UserRole): string => {
  const coords: Record<UserRole, { x: number; y: number }> = {
    fan: { x: 50, y: 0 },
    volunteer: { x: 0, y: 50 },
    security: { x: 100, y: 50 },
    operations: { x: 50, y: 100 },
  };

  const start = coords[from];
  const end = coords[to];
  const key = `${from}-${to}`;
  
  const controlPoints: Record<string, { x: number; y: number }> = {
    "fan-volunteer": { x: 28, y: 20 },
    "volunteer-fan": { x: 28, y: 20 },
    "fan-security": { x: 72, y: 20 },
    "security-fan": { x: 72, y: 20 },
    "operations-volunteer": { x: 28, y: 80 },
    "volunteer-operations": { x: 28, y: 80 },
    "operations-security": { x: 72, y: 80 },
    "security-operations": { x: 72, y: 80 },
    "fan-operations": { x: 30, y: 50 },
    "operations-fan": { x: 30, y: 50 },
    "volunteer-security": { x: 50, y: 30 },
    "security-volunteer": { x: 50, y: 30 },
  };

  const cp = controlPoints[key] || { x: 50, y: 50 };
  return `M ${start.x} ${start.y} Q ${cp.x} ${cp.y} ${end.x} ${end.y}`;
};

const getBranchSpeed = (targetRole: UserRole): number => {
  const speeds: Record<UserRole, number> = {
    fan: 1.4,
    volunteer: 1.9,
    security: 1.1,
    operations: 1.6,
  };
  return speeds[targetRole];
};

export function ConnectionOverlay({ hoveredRole, activeRole, shouldReduceMotion }: ConnectionOverlayProps) {
  if (shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="grad-fan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="grad-volunteer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="grad-security" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="grad-operations" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <AnimatePresence>
          {hoveredRole && (
            <g key={`trigger-${hoveredRole}`}>
              {(() => {
                const coords = {
                  fan: { x: 50, y: 0 },
                  volunteer: { x: 0, y: 50 },
                  security: { x: 100, y: 50 },
                  operations: { x: 50, y: 100 },
                };
                const end = coords[hoveredRole];
                const activePortal = PORTALS.find((p) => p.role === hoveredRole)!;
                const pathD = `M 50 50 L ${end.x} ${end.y}`;

                return (
                  <>
                    <motion.path
                      d={pathD}
                      stroke={activePortal.color}
                      strokeWidth="0.8"
                      strokeOpacity="0.05"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                    <motion.path
                      d={pathD}
                      stroke="#ffffff"
                      strokeWidth="0.6"
                      strokeLinecap="round"
                      strokeDasharray="2 48"
                      initial={{ strokeDashoffset: 50, opacity: 0 }}
                      animate={{ strokeDashoffset: 0, opacity: [0, 0.4, 0.4] }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.32,
                        ease: "easeOut"
                      }}
                    />
                  </>
                );
              })()}
            </g>
          )}

          {activeRole && (
            <motion.g
              key={`network-${activeRole}`}
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {PORTALS.filter((p) => p.role !== activeRole).map((target) => {
                const pathD = getSvgPath(activeRole, target.role);
                const activePortal = PORTALS.find((p) => p.role === activeRole)!;
                const branchSpeed = getBranchSpeed(target.role);
                
                return (
                  <g key={target.role}>
                    <motion.path
                      d={pathD}
                      stroke={`url(#grad-${activeRole})`}
                      strokeWidth="1.2"
                      strokeOpacity="0.03"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0, opacity: 0 }}
                      transition={{
                        pathLength: { duration: 0.45, ease: "easeOut" },
                        opacity: { duration: 0.2 }
                      }}
                    />
                    <motion.path
                      d={pathD}
                      stroke={`url(#grad-${activeRole})`}
                      strokeWidth="0.5"
                      strokeOpacity="0.08"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0, opacity: 0 }}
                      transition={{
                        pathLength: { duration: 0.45, ease: "easeOut" },
                        opacity: { duration: 0.2 }
                      }}
                    />
                    <motion.path
                      d={pathD}
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                      strokeDasharray="3 77"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: 1, 
                        opacity: [0, 0.45, 0.45],
                        strokeDashoffset: [100, 0] 
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        pathLength: { duration: 0.45, ease: "easeOut" },
                        opacity: { duration: 0.2 },
                        strokeDashoffset: {
                          duration: branchSpeed,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 0.45
                        }
                      }}
                    />
                  </g>
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
