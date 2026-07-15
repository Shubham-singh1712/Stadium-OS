"use client";

import { motion } from "framer-motion";
import { useCortexStore } from "@/stores/cortexStore";
import { useState } from "react";

interface StadiumMapProps {
  role: "fan" | "volunteer";
  target: string;
  active: boolean;
  onNodeClick?: (targetName: string) => void;
}

// labelDir controls where the badge is drawn relative to the node dot
type LabelDir = "above" | "below" | "left" | "right";

interface MapNode {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  color: string;
  labelDir: LabelDir;
}

const NODES: MapNode[] = [
  { id: "rest-n",    name: "Restroom N",               label: "Restroom N",        x: 50, y: 14, color: "hsl(210,80%,60%)",  labelDir: "below"  },
  { id: "gate-a",    name: "Gate A",                   label: "Gate A",            x: 18, y: 32, color: "hsl(0,84%,60%)",    labelDir: "right"  },
  { id: "gate-c",    name: "Gate C",                   label: "Gate C",            x: 82, y: 32, color: "hsl(152,70%,50%)",  labelDir: "left"   },
  { id: "medical-1", name: "Medical Bay 1",             label: "Medical Bay",       x: 10, y: 56, color: "hsl(0,84%,60%)",    labelDir: "right"  },
  { id: "food-b",    name: "Food Court B",              label: "Food Court B",      x: 68, y: 52, color: "hsl(42,90%,60%)",   labelDir: "above"  },
  { id: "metro",     name: "Metro East",               label: "Metro East",        x: 90, y: 56, color: "hsl(210,90%,60%)",  labelDir: "left"   },
  { id: "seat",      name: "My Seat (112-G-14)",       label: "Seat 112",          x: 25, y: 78, color: "hsl(210,90%,60%)",  labelDir: "left"  },
  { id: "base",      name: "Volunteer Base (East Wing)",label: "VOL Base",          x: 75, y: 78, color: "hsl(152,70%,50%)",  labelDir: "left"   },
  { id: "parking-c", name: "Parking C",                label: "Parking C",         x: 50, y: 88, color: "hsl(152,70%,50%)",  labelDir: "above"  },
];

// Bezier paths from Seat 112 (fan) or VOL Base (volunteer) to each destination
const FAN_PATHS: Record<string, string> = {
  "Restroom N":          "M 25,78 C 20,55 30,30 50,14",
  "Gate A":              "M 25,78 C 18,62 15,48 18,32",
  "Gate C":              "M 25,78 C 50,80 72,55 82,32",
  "Food Court B":        "M 25,78 C 40,72 55,62 68,52",
  "Medical Bay 1":       "M 25,78 C 18,72 12,64 10,56",
  "Metro East":          "M 25,78 C 55,82 80,68 90,56",
  "Parking C":           "M 25,78 C 35,82 45,86 50,88",
  "My Seat (112-G-14)":  "",
};

const VOLUNTEER_PATHS: Record<string, string> = {
  "Gate A":                    "M 75,78 C 50,65 30,48 18,32",
  "Gate C":                    "M 75,78 C 80,60 83,46 82,32",
  "Food Court B":              "M 75,78 C 74,68 70,60 68,52",
  "Section 112":               "M 75,78 C 55,78 40,78 25,78",
  "Restroom N":                "M 75,78 C 68,50 60,28 50,14",
  "Medical Bay 1":             "M 75,78 C 50,68 28,62 10,56",
  "Volunteer Base (East Wing)":"",
};

function getLabelTransform(node: MapNode): { x: number; y: number; anchor: "middle" | "start" | "end" } {
  const off = 8.5; // Slightly reduced offset for tighter spacing
  switch (node.labelDir) {
    case "below":  return { x: node.x,       y: node.y + off, anchor: "middle" };
    case "right":  return { x: node.x + off, y: node.y,       anchor: "start"  };
    case "left":   return { x: node.x - off, y: node.y,       anchor: "end"    };
    default:       return { x: node.x,       y: node.y - off, anchor: "middle" }; // above
  }
}

export function StadiumMap({ role, target, active, onNodeClick }: StadiumMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const zones = useCortexStore((state) => state.zones);

  const getLiveColor = (node: MapNode) => {
    const zone = zones.find(z => 
      z.id === node.id || 
      z.id.replace("-north", "-n").replace("-south", "-s") === node.id ||
      z.name.toLowerCase() === node.name.toLowerCase()
    );
    if (!zone) return node.color;
    if (zone.status === "red") return "hsl(0,84%,60%)";
    if (zone.status === "yellow") return "hsl(42,95%,58%)";
    return "hsl(152,70%,50%)";
  };

  const paths = role === "fan" ? FAN_PATHS : VOLUNTEER_PATHS;
  const matchKey = Object.keys(paths).find(
    k => k.toLowerCase().includes(target.toLowerCase()) || target.toLowerCase().includes(k.toLowerCase())
  );
  const activePath = matchKey ? paths[matchKey] : "";

  return (
    <div style={{
      width: "100%", aspectRatio: "16 / 11", borderRadius: "var(--radius-xl)",
      background: "radial-gradient(ellipse at center, hsl(215 25% 10%) 0%, hsl(215 28% 5%) 100%)", 
      border: "1px solid hsl(215 20% 16%)",
      boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)",
      position: "relative", overflow: "hidden", minHeight: "300px"
    }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }} role="img" aria-label="Interactive Stadium Map">
        <defs>
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210,100%,65%)" />
            <stop offset="100%" stopColor="hsl(190,100%,55%)" />
          </linearGradient>
          
          <linearGradient id="stadiumOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(215,40%,25%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(210,50%,35%)" stopOpacity="0.1" />
          </linearGradient>

          <filter id="glowSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.0" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <filter id="glowStrong" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          
          <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0.8" stdDeviation="1" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* ── Stadium structure ── */}
        <g opacity="0.85">
          {/* Inner soft glow for stadium outline */}
          <ellipse cx="50" cy="50" rx="45.5" ry="35.5" fill="none" stroke="url(#stadiumOuterGrad)" strokeWidth="1.5" filter="url(#glowSoft)" />
          
          {/* Outer perimeter - Thinner and elegant */}
          <ellipse cx="50" cy="50" rx="46" ry="36" fill="hsl(215 30% 12% / 0.2)" stroke="hsl(215 30% 25% / 0.6)" strokeWidth="0.6" />
          
          {/* Middle tier ring - extremely subtle */}
          <ellipse cx="50" cy="50" rx="38" ry="28" fill="none" stroke="hsl(215 25% 20% / 0.4)" strokeWidth="0.4" strokeDasharray="3 4" />
          
          {/* Section radials - thin elegant strokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 50 + 22 * Math.cos(rad); const y1 = 50 + 17 * Math.sin(rad);
            const x2 = 50 + 46 * Math.cos(rad); const y2 = 50 + 36 * Math.sin(rad);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(215 25% 22% / 0.3)" strokeWidth="0.3" />;
          })}
        </g>

        {/* Stand labels - Soft gray, high hierarchy contrast */}
        <g fill="hsl(215 15% 35%)" fontWeight={600} letterSpacing="0.15em" style={{ userSelect: "none" }}>
          <text x="50" y="8.5" textAnchor="middle" fontSize="2.2">NORTH STAND</text>
          <text x="50" y="97.5" textAnchor="middle" fontSize="2.2">SOUTH STAND</text>
          <text x="2"  y="50" textAnchor="middle" fontSize="2.2" transform="rotate(-90 2 50)">WEST</text>
          <text x="98" y="50" textAnchor="middle" fontSize="2.2" transform="rotate(90 98 50)">EAST</text>
        </g>

        {/* Soccer pitch - premium subtle rendering */}
        <g opacity="0.7">
          <ellipse cx="50" cy="50" rx="18" ry="11" fill="hsl(190 50% 50% / 0.02)" stroke="hsl(190 60% 40% / 0.15)" strokeWidth="0.4" />
          <ellipse cx="50" cy="50" rx="11" ry="7"  fill="none" stroke="hsl(190 60% 40% / 0.1)" strokeWidth="0.3" />
          <line x1="50" y1="39" x2="50" y2="61" stroke="hsl(190 60% 40% / 0.15)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="3.5" fill="none" stroke="hsl(190 60% 40% / 0.15)" strokeWidth="0.3" />
        </g>

        {/* ── Active Neon Route ── */}
        {active && activePath && (
          <g>
            {/* Soft background glow trace */}
            <path d={activePath} fill="none" stroke="hsl(190,100%,50%)" strokeWidth="3" strokeLinecap="round"
              style={{ filter: "blur(3px)", opacity: 0.15 }} />
            
            {/* Main AI route line - thin and elegant */}
            <motion.path
              d={activePath} fill="none" stroke="url(#neonGrad)" strokeWidth="1.0" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            
            {/* Flowing AI light pulse - small data packets */}
            <motion.path
              d={activePath} fill="none" stroke="#fff" strokeWidth="1.2"
              strokeLinecap="round" strokeDasharray="1.5 24"
              initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -25.5 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              filter="url(#glowSoft)"
            />
          </g>
        )}

        {/* ── Nodes ── */}
        {NODES.map((node) => {
          const isSource = node.id === (role === "fan" ? "seat" : "base");
          const isTarget = active && matchKey && (
            node.name.toLowerCase().includes(target.toLowerCase()) ||
            target.toLowerCase().includes(node.name.toLowerCase())
          );
          const isHovered = hoveredNode === node.id;
          const isActive = isSource || isTarget;
          
          const lp = getLabelTransform(node);
          const badgePad = 2.0; // tighter padding
          const charW = 1.6; // smaller text means smaller character width estimate
          const textW = node.label.length * charW;
          const bw = textW + badgePad * 2;
          const bh = 4.2; // thinner chip height

          return (
            <g key={node.id}
              onClick={() => onNodeClick?.(node.name)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNodeClick?.(node.name);
                }
              }}
              style={{ cursor: "pointer", outline: "none" }}
              tabIndex={0}
              role="button"
              aria-label={`Stadium Zone: ${node.name}`}
            >
              {/* Sonar ripples on target - refined & subtle */}
              {isTarget && (
                <>
                  <circle cx={node.x} cy={node.y} r="1.5" fill="none" stroke="hsl(190,100%,65%)" strokeWidth="0.6">
                    <animate attributeName="r" values="1.5;9;1.5" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={node.x} cy={node.y} r="3" fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.4">
                    <animate attributeName="r" values="3;15;3" dur="3.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="3.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* Node dot - premium glass orb */}
              <motion.circle
                cx={node.x} cy={node.y}
                r={isActive ? 2.4 : 1.6}
                fill={isSource ? "hsl(210,95%,65%)" : isTarget ? "hsl(190,100%,60%)" : getLiveColor(node)}
                stroke={isActive ? "hsl(215,25%,10%)" : "hsl(215,30%,45%)"}
                strokeWidth={isActive ? 0.8 : 0.4}
                animate={{ 
                  scale: isHovered ? 1.4 : 1,
                  fill: isHovered ? "hsl(190,100%,55%)" : (isActive ? (isSource ? "hsl(210,95%,65%)" : "hsl(190,100%,60%)") : getLiveColor(node))
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                filter={isActive || isHovered ? "url(#glowStrong)" : "none"}
              />

              {/* HUD label badge - floating premium glass chip */}
              <motion.g 
                transform={`translate(${lp.x}, ${lp.y})`}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: isActive || isHovered ? 1 : 0.7 }}
                transition={{ duration: 0.2 }}
                filter="url(#dropShadow)"
              >
                {/* Dark glass backdrop */}
                <rect
                  x={lp.anchor === "middle" ? -bw / 2 : lp.anchor === "end" ? -bw : 0}
                  y={-bh / 2}
                  width={bw} height={bh} rx="2.1"
                  fill="hsl(215 30% 12% / 0.75)"
                  stroke={isSource ? "hsl(210,80%,50% / 0.8)" : isTarget ? "hsl(190,100%,50% / 0.8)" : isHovered ? "hsl(190,100%,50% / 0.5)" : `${getLiveColor(node)}50`}
                  strokeWidth="0.4"
                />
                
                {/* Inner highlight for glass effect */}
                <rect
                  x={(lp.anchor === "middle" ? -bw / 2 : lp.anchor === "end" ? -bw : 0) + 0.2}
                  y={-bh / 2 + 0.2}
                  width={bw - 0.4} height={bh / 2} rx="1.9"
                  fill="hsl(0 0% 100% / 0.05)"
                  style={{ pointerEvents: "none" }}
                />

                {/* Typography - crisp, premium hierarchy */}
                <text
                  textAnchor={lp.anchor} y="1.1"
                  fontSize="2.4" 
                  fontWeight={isActive || isHovered ? 600 : 500}
                  fill={isActive ? "#ffffff" : isHovered ? "hsl(190,100%,80%)" : "hsl(215,20%,85%)"}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {node.label}
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
