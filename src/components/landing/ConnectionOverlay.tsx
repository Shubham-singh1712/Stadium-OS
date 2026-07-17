"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { UserRole } from "@/types";

interface ConnectionOverlayProps {
  hoveredRole: UserRole | null;
  shouldReduceMotion: boolean | null;
}

const PORTALS = [
  { role: "fan" as UserRole, color: "#3b82f6" },
  { role: "volunteer" as UserRole, color: "#10b981" },
  { role: "security" as UserRole, color: "#ef4444" },
  { role: "operations" as UserRole, color: "#a78bfa" },
] as const;

export function ConnectionOverlay({ hoveredRole, shouldReduceMotion }: ConnectionOverlayProps) {
  if (shouldReduceMotion) return null;

  const isAnyHovered = hoveredRole !== null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 2.2 }}
      className="absolute inset-0 pointer-events-none z-0"
    >
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        
        {/* Subtle persistent background connection lines */}
        <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.15" strokeDasharray="1 2">
          {/* Diamond outline */}
          <line x1="50" y1="15" x2="85" y2="50" />
          <line x1="85" y1="50" x2="50" y2="85" />
          <line x1="50" y1="85" x2="15" y2="50" />
          <line x1="15" y1="50" x2="50" y2="15" />
          
          {/* Cross lines to the Cortex AI core */}
          <line x1="50" y1="50" x2="50" y2="15" />
          <line x1="50" y1="50" x2="85" y2="50" />
          <line x1="50" y1="50" x2="50" y2="85" />
          <line x1="50" y1="50" x2="15" y2="50" />
        </g>

        {/* Softly illuminate the other roles' connections to center when ANY node is hovered */}
        <AnimatePresence>
          {isAnyHovered && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {PORTALS.filter(p => p.role !== hoveredRole).map(p => {
                const coords: Record<UserRole, { x: number; y: number }> = {
                  fan: { x: 50, y: 15 },
                  security: { x: 85, y: 50 },
                  operations: { x: 50, y: 85 },
                  volunteer: { x: 15, y: 50 },
                };
                const end = coords[p.role];
                return (
                  <motion.line 
                    key={`soft-${p.role}`}
                    x1="50" y1="50" x2={end.x} y2={end.y}
                    stroke={p.color}
                    strokeWidth="0.15"
                    strokeOpacity="0.2"
                  />
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Active Neural Energy Flow */}
        <AnimatePresence>
          {hoveredRole && (
            <g key={`neural-${hoveredRole}`}>
              {(() => {
                const coords = {
                  fan: { x: 50, y: 15 },
                  security: { x: 85, y: 50 },
                  operations: { x: 50, y: 85 },
                  volunteer: { x: 15, y: 50 },
                };
                const end = coords[hoveredRole];
                const activePortal = PORTALS.find((p) => p.role === hoveredRole)!;
                
                // Draw line from center to the hovered node
                const pathD = `M 50 50 L ${end.x} ${end.y}`;

                return (
                  <>
                    {/* The thick colored beam */}
                    <motion.path
                      d={pathD}
                      stroke={activePortal.color}
                      strokeWidth="0.5"
                      strokeOpacity="0.6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{ filter: `drop-shadow(0 0 4px ${activePortal.color})` }}
                    />
                    
                    {/* The traveling energy pulse */}
                    <motion.path
                      d={pathD}
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeDasharray="2 15"
                      initial={{ strokeDashoffset: 17, opacity: 0 }}
                      animate={{ strokeDashoffset: 0, opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ filter: "drop-shadow(0 0 6px #ffffff)" }}
                    />
                  </>
                );
              })()}
            </g>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
}
