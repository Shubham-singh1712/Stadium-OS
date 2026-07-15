"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { motion, AnimatePresence } from "framer-motion";
import type { StadiumZone } from "@/types";

const STATUS_COLORS = {
  green: { fill: "hsl(152,70%,40%)", stroke: "hsl(152,70%,60%)", glow: "hsl(152 70% 50% / 0.4)" },
  yellow: { fill: "hsl(42,80%,40%)", stroke: "hsl(42,95%,60%)", glow: "hsl(42 95% 58% / 0.4)" },
  red: { fill: "hsl(0,74%,40%)", stroke: "hsl(0,84%,62%)", glow: "hsl(0 84% 60% / 0.4)" },
};

const ZONE_ICONS: Record<string, string> = {
  gate: "🚪", food_court: "🍔", restroom: "🚻", parking: "🅿️",
  medical: "⚕️", security: "🛡️", seating: "💺", exit: "🚪",
};

function StadiumSVG({ zones, onZoneClick, selectedZoneId }: {
  zones: StadiumZone[];
  onZoneClick: (zone: StadiumZone) => void;
  selectedZoneId: string | null;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-label="Stadium Digital Twin"
      role="img"
    >
      {/* Stadium oval */}
      <ellipse cx="50" cy="50" rx="42" ry="38"
        fill="hsl(215 20% 9%)" stroke="hsl(215 20% 20%)" strokeWidth="0.5" />

      {/* Field */}
      <ellipse cx="50" cy="50" rx="30" ry="25"
        fill="hsl(152 60% 18%)" stroke="hsl(152 60% 28%)" strokeWidth="0.4" />
      <ellipse cx="50" cy="50" rx="22" ry="18"
        fill="none" stroke="hsl(152 60% 30%)" strokeWidth="0.3" strokeDasharray="1 0.5" />
      <circle cx="50" cy="50" r="4" fill="none" stroke="hsl(152 60% 30%)" strokeWidth="0.3" />
      <line x1="50" y1="25" x2="50" y2="75" stroke="hsl(152 60% 30%)" strokeWidth="0.3" />

      {/* Zone circles */}
      {zones.map((zone) => {
        const colors = STATUS_COLORS[zone.status];
        const isSelected = zone.id === selectedZoneId;
        const r = zone.type === "parking" ? 4.5 : zone.type === "seating" ? 3 : 3.5;
        return (
          <g
            key={zone.id}
            onClick={() => onZoneClick(zone)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onZoneClick(zone);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${zone.name} — ${zone.status === "green" ? "Optimal flow" : zone.status === "yellow" ? "Moderate congestion" : "Critical congestion"}`}
            style={{ cursor: "pointer", outline: "none" }}
          >
            {isSelected && (
              <circle
                cx={zone.x} cy={zone.y} r={r + 2.5}
                fill="none" stroke="white" strokeWidth="0.5" opacity={0.6}
                style={{ animation: "cortexPulse 1.5s ease-in-out infinite" }}
              />
            )}
            <circle
              cx={zone.x} cy={zone.y} r={r}
              fill={colors.fill} stroke={isSelected ? "white" : colors.stroke} strokeWidth={isSelected ? 1.0 : 0.6}
              style={{
                filter: `drop-shadow(0 0 ${isSelected ? 4 : 2}px ${colors.glow})`,
                transition: "r 0.2s ease",
              }}
            />
            {/* Icon */}
            <text
              x={zone.x} y={zone.y + 1.2}
              textAnchor="middle" fontSize="2.5"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {ZONE_ICONS[zone.type] ?? "●"}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g>
        <circle cx="4" cy="95" r="1.2" fill="hsl(152,70%,40%)" stroke="hsl(152,70%,60%)" strokeWidth="0.5" aria-describedby="legend-low-desc" />
        <text id="legend-low-desc" x="6.5" y="95.8" fontSize="2" fill="hsl(215 15% 55%)">Low</text>
        <circle cx="16" cy="95" r="1.2" fill="hsl(42,80%,40%)" stroke="hsl(42,95%,60%)" strokeWidth="0.5" aria-describedby="legend-mod-desc" />
        <text id="legend-mod-desc" x="18.5" y="95.8" fontSize="2" fill="hsl(215 15% 55%)">Moderate</text>
        <circle cx="32" cy="95" r="1.2" fill="hsl(0,74%,40%)" stroke="hsl(0,84%,62%)" strokeWidth="0.5" aria-describedby="legend-crit-desc" />
        <text id="legend-crit-desc" x="34.5" y="95.8" fontSize="2" fill="hsl(215 15% 55%)">Critical</text>
      </g>
    </svg>
  );
}

export default function DigitalTwinPage() {
  const zones = useCortexStore((state) => state.zones);
  const startProtocol = useCortexStore((state) => state.startProtocol);
  const executeOverflow = useCortexStore((state) => state.executeOverflow);
  const autoAssignStaff = useCortexStore((state) => state.autoAssignStaff);
  const [selectedZone, setSelectedZone] = useState<StadiumZone | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredZones = filterType === "all" ? zones : zones.filter((z) => z.type === filterType);
  const zoneTypes = ["all", "gate", "food_court", "parking", "restroom", "medical", "security"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>AI Digital Twin</h1>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            Live stadium representation · {zones.filter(z => z.status === "red").length} critical zones
          </p>
        </div>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {zoneTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: "0.375rem 0.875rem", borderRadius: "999px",
                background: filterType === type ? "hsl(210 90% 55%)" : "var(--glass-bg)",
                border: `1px solid ${filterType === type ? "transparent" : "var(--glass-border)"}`,
                color: filterType === type ? "white" : "hsl(var(--foreground-muted))",
                cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500,
                transition: "all 0.15s ease",
                textTransform: "capitalize",
              }}
            >
              {type === "food_court" ? "Food" : type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>
        {/* SVG Map */}
        <div className="glass-card" style={{ padding: "1rem", aspectRatio: "1 / 0.85", position: "relative" }}>
          <StadiumSVG
            zones={filteredZones}
            onZoneClick={setSelectedZone}
            selectedZoneId={selectedZone?.id ?? null}
          />
        </div>

        {/* Detail Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <AnimatePresence mode="wait">
            {selectedZone ? (
              <motion.div
                key={selectedZone.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="glass-card">
                  {/* Zone header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span>{ZONE_ICONS[selectedZone.type]}</span>
                        <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>{selectedZone.name}</h2>
                      </div>
                      <div style={{
                        display: "inline-flex", padding: "0.25rem 0.625rem",
                        borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: STATUS_COLORS[selectedZone.status].fill + "40",
                        color: STATUS_COLORS[selectedZone.status].stroke,
                        border: `1px solid ${STATUS_COLORS[selectedZone.status].stroke}50`,
                        textTransform: "capitalize",
                      }}>
                        {selectedZone.status === "green" ? "✓ Optimal" : selectedZone.status === "yellow" ? "⚠ Moderate" : "🔴 Critical"}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedZone(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--foreground-subtle))", fontSize: "1.25rem" }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Occupancy */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>Occupancy</span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
                        {selectedZone.current.toLocaleString()} / {selectedZone.capacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedZone.current / selectedZone.capacity) * 100}%` }}
                        transition={{ duration: 0.7 }}
                        style={{ background: STATUS_COLORS[selectedZone.status].stroke }}
                      />
                    </div>
                    <div style={{ textAlign: "right", fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "0.25rem" }}>
                      {Math.round((selectedZone.current / selectedZone.capacity) * 100)}% full
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                    {selectedZone.queueLength !== undefined && (
                      <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "hsl(var(--surface-2))" }}>
                        <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginBottom: "0.25rem" }}>Queue</p>
                        <p style={{ fontWeight: 700, fontSize: "1.125rem" }}>{selectedZone.queueLength} <span style={{ fontSize: "0.8125rem", fontWeight: 400 }}>people</span></p>
                      </div>
                    )}
                    {selectedZone.predictedPeak !== undefined && (
                      <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", background: "hsl(var(--surface-2))" }}>
                        <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginBottom: "0.25rem" }}>Peak in</p>
                        <p style={{ fontWeight: 700, fontSize: "1.125rem" }}>{selectedZone.predictedPeak} <span style={{ fontSize: "0.8125rem", fontWeight: 400 }}>min</span></p>
                      </div>
                    )}
                  </div>

                  {/* AI Recommendation */}
                  {selectedZone.aiRecommendation && (
                    <CortexCard
                      title="AI Recommendation"
                      insight={selectedZone.aiRecommendation}
                      severity={selectedZone.status === "red" ? "critical" : selectedZone.status === "yellow" ? "warning" : "success"}
                      actions={[{
                        label: "Take Action",
                        variant: "primary",
                        onClick: () => {
                          if (selectedZone.id === "gate-a") {
                            startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
                            toast.success("Initiating Protocol Delta-2 Review...");
                          } else if (selectedZone.id === "gate-d") {
                            executeOverflow("gate-d");
                          } else if (selectedZone.id === "food-a") {
                            autoAssignStaff();
                          } else {
                            toast.success("Active action triggered for " + selectedZone.name);
                          }
                        }
                      }]}
                      animate={false}
                    />
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card"
                style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏟️</div>
                <p style={{ fontWeight: 600, marginBottom: "0.375rem" }}>Select a Zone</p>
                <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))" }}>
                  Click any zone on the map to view live analytics and AI recommendations.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zone summary list */}
          <div className="glass-card" style={{ padding: "1rem" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9375rem" }}>All Zones</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "280px", overflowY: "auto" }}>
              {zones.map((zone) => {
                const pct = Math.round((zone.current / zone.capacity) * 100);
                return (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.625rem",
                      padding: "0.625rem 0.75rem", borderRadius: "var(--radius-sm)",
                      background: selectedZone?.id === zone.id ? "hsl(210 90% 60% / 0.1)" : "transparent",
                      border: `1px solid ${selectedZone?.id === zone.id ? "hsl(210 90% 60% / 0.3)" : "transparent"}`,
                      cursor: "pointer", textAlign: "left", width: "100%",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: STATUS_COLORS[zone.status].stroke,
                      boxShadow: `0 0 6px ${STATUS_COLORS[zone.status].glow}`,
                    }} />
                    <span style={{ fontSize: "0.8125rem", fontWeight: 500, flex: 1 }}>{zone.name}</span>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 600,
                      color: zone.status === "red" ? "hsl(var(--accent-red))" : zone.status === "yellow" ? "hsl(var(--accent-yellow))" : "hsl(var(--accent-green))",
                    }}>
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
