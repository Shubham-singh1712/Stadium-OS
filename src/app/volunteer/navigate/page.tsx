"use client";

import { useVolunteerStore } from "@/stores/volunteerStore";
import dynamic from "next/dynamic";
const StadiumMap = dynamic(() => import("@/components/stadium/StadiumMap").then((m) => m.StadiumMap), {
  ssr: false,
  loading: () => <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-md)", color: "hsl(var(--foreground-muted))" }}>Loading Map...</div>,
});
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const STAFF_DESTINATIONS = [
  { label: "Gate A",                     icon: "🚪", status: "CRITICAL", statusColor: "hsl(0,84%,60%)"   },
  { label: "Gate C",                     icon: "🚪", status: "OPEN",     statusColor: "hsl(152,70%,50%)" },
  { label: "Food Court B",              icon: "🍔", status: "MODERATE", statusColor: "hsl(42,90%,60%)"  },
  { label: "Restroom N",                icon: "🚻", status: "CLEAR",    statusColor: "hsl(152,70%,50%)" },
  { label: "Medical Bay 1",            icon: "⚕️", status: "STANDBY",  statusColor: "hsl(210,90%,60%)" },
  { label: "Section 112",              icon: "💺", status: "CLEAR",    statusColor: "hsl(152,70%,50%)" },
  { label: "Volunteer Base (East Wing)", icon: "🏠", status: "BASE",     statusColor: "hsl(152,70%,50%)" },
];

export default function VolunteerNavigatePage() {
  const pathname = usePathname();
  const { tasks } = useVolunteerStore();

  const activeTasks = tasks.filter(t => t.status === "accepted" || t.status === "in_progress");
  const [navTarget, setNavTarget] = useState("Gate A");
  const [routeGenerated, setRouteGenerated] = useState(false);

  useEffect(() => {
    if (activeTasks.length > 0) {
      setNavTarget(activeTasks[0].zone);
      setRouteGenerated(true);
    }
  }, [activeTasks.length]);

  const selectDestination = (dest: string) => {
    setNavTarget(dest);
    setRouteGenerated(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Volunteer Hub</h1>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            Sara Mitchell · Badge VOL-2026-4421 · East Wing
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="live-dot" />
          <span style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>On Duty · Cortex AI</span>
        </div>
      </div>



      {/* Active Task Banner */}
      {activeTasks.length > 0 && (
        <div style={{
          padding: "0.875rem 1.25rem", borderRadius: "var(--radius-md)",
          background: "hsl(210 90% 60% / 0.08)", border: "1px solid hsl(210 90% 60% / 0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "hsl(210,90%,70%)", fontWeight: 600, marginBottom: "0.2rem" }}>
              ✦ ACTIVE DEPLOYMENT — ROUTE PRE-FILLED
            </p>
            <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))" }}>
              {activeTasks[0].title} → <strong>{activeTasks[0].zone}</strong>
            </p>
          </div>
          <span style={{ fontSize: "0.75rem", color: "hsl(210,90%,70%)", fontWeight: 700, padding: "0.25rem 0.625rem", background: "hsl(210 90% 60% / 0.12)", borderRadius: "999px" }}>
            In Progress
          </span>
        </div>
      )}

      {/* ─── MAIN TWO-COLUMN LAYOUT ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.25rem", alignItems: "start" }}>

        {/* ── LEFT COLUMN: Map + Route Details ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontWeight: 600 }}>🗺️ Staff Wayfinding Map</h3>

            <StadiumMap
              role="volunteer"
              target={navTarget}
              active={routeGenerated}
              onNodeClick={(nodeName) => {
                if (nodeName.includes("Base")) return;
                selectDestination(nodeName);
              }}
            />

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <select
                value={navTarget}
                onChange={(e) => { setNavTarget(e.target.value); setRouteGenerated(false); }}
                style={{
                  flex: 1, padding: "0.625rem 0.875rem",
                  background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                  fontFamily: "var(--font-sans)", fontSize: "0.875rem", outline: "none",
                }}
              >
                {STAFF_DESTINATIONS.map(d => <option key={d.label}>{d.label}</option>)}
              </select>
              <button className="btn btn-primary" onClick={() => setRouteGenerated(true)}>
                Get Directions
              </button>
            </div>
          </div>

          {/* Route directions */}
          <AnimatePresence>
            {routeGenerated && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div style={{
                  padding: "1.25rem", borderRadius: "var(--radius-md)",
                  background: "hsl(152 70% 50% / 0.07)", border: "1px solid hsl(152 70% 50% / 0.2)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(152,70%,60%)", display: "block", marginBottom: "0.25rem" }}>✦ STAFF ACCESS ROUTE</span>
                      <h4 style={{ fontWeight: 700, fontSize: "1.125rem" }}>To: {navTarget}</h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>Mode</span>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "hsl(152,70%,55%)" }}>Staff Corridors</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1rem" }}>
                    {[
                      { step: 1, text: "Exit Volunteer Base and head east down Service Corridor",    time: "1 min"   },
                      { step: 2, text: "Use Staff Elevator E3 to descend to Level 1",               time: "1.5 min" },
                      { step: 3, text: `Follow green staff markers to ${navTarget}`,                time: "2 min"   },
                    ].map(s => (
                      <div key={s.step} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", background: "hsl(152 70% 45%)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 700, color: "white", flexShrink: 0,
                        }}>{s.step}</div>
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{s.text}</p>
                          <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>{s.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-success" style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => toast.success("Route guidance active. Follow staff signage.")}>
                    Start Wayfinding
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT COLUMN: Quick Dispatch + Zone Status ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1rem" }}>

          {/* Active tasks summary */}
          <div className="glass-card">
            <h3 style={{ fontWeight: 600, marginBottom: "0.875rem", fontSize: "0.9375rem" }}>📋 My Active Tasks</h3>
            {activeTasks.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))" }}>No active tasks. Check the Tasks tab.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {activeTasks.map(t => (
                  <div key={t.id} style={{
                    padding: "0.75rem", borderRadius: "var(--radius-sm)",
                    background: "hsl(210 90% 60% / 0.08)", border: "1px solid hsl(210 90% 60% / 0.2)",
                  }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t.title}</p>
                    <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))" }}>📍 {t.zone}</p>
                    <button className="btn btn-primary" style={{ marginTop: "0.5rem", fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                      onClick={() => selectDestination(t.zone)}>
                      Navigate Here
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Dispatch destinations */}
          <div className="glass-card">
            <h3 style={{ fontWeight: 600, marginBottom: "0.875rem", fontSize: "0.9375rem" }}>⚡ Quick Dispatch</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {STAFF_DESTINATIONS.map(d => (
                <button
                  key={d.label}
                  onClick={() => selectDestination(d.label)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.625rem 0.875rem", borderRadius: "var(--radius-sm)",
                    background: navTarget === d.label ? "hsl(152 70% 50% / 0.1)" : "hsl(var(--surface-2))",
                    border: navTarget === d.label ? "1px solid hsl(152 70% 50% / 0.35)" : "1px solid transparent",
                    cursor: "pointer", width: "100%", textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                    <span>{d.icon}</span>
                    <span style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>{d.label}</span>
                  </span>
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700, padding: "2px 6px", borderRadius: "999px",
                    background: `${d.statusColor}18`, color: d.statusColor, border: `1px solid ${d.statusColor}35`,
                  }}>
                    {d.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
