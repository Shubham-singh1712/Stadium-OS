"use client";

import { useState, useEffect } from "react";
import { useCortexStore } from "@/stores/cortexStore";
import { MetricCard } from "@/components/ui/MetricCard";
import { OperationsKPIs } from "@/components/operations/OperationsKPIs";
import { OperationsTimeline } from "@/components/operations/OperationsTimeline";
import { CortexCard } from "@/components/cortex/CortexCard";
import { ActiveAlertList } from "@/components/operations/ActiveAlertList";
import { VendorPerformanceList } from "@/components/operations/VendorPerformanceList";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="tooltip">
        <p style={{ marginBottom: "0.25rem", fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, fontSize: "0.875rem", fontWeight: 600 }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const stagger = { show: { transition: { staggerChildren: 0.07 } } };

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function OperationsPage() {
  const crowd = useCortexStore((state) => state.crowd);
  const zones = useCortexStore((state) => state.zones);
  const alerts = useCortexStore((state) => state.alerts);
  const vendors = useCortexStore((state) => state.vendors);
  const sustainability = useCortexStore((state) => state.sustainability);
  const lastUpdated = useCortexStore((state) => state.lastUpdated);
  const timelineEvents = useCortexStore((state) => state.timelineEvents);
  const activeProtocol = useCortexStore((state) => state.activeProtocol);
  const startProtocol = useCortexStore((state) => state.startProtocol);
  const setProtocolStatus = useCortexStore((state) => state.setProtocolStatus);
  const cancelProtocol = useCortexStore((state) => state.cancelProtocol);
  const addTimelineEvent = useCortexStore((state) => state.addTimelineEvent);

  const isGateAActiveProtocol = activeProtocol && activeProtocol.zoneId === "gate-a";
  const workflowStep = isGateAActiveProtocol ? activeProtocol.status : "idle";


  const execProgress = isGateAActiveProtocol ? activeProtocol.progress : 0;

  const criticalZones = zones.filter((z) => z.status === "red").length;
  const warningZones = zones.filter((z) => z.status === "yellow").length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
  const totalRevenue = vendors.reduce((sum, v) => sum + v.revenue, 0);
  // Zone type counts for bar chart
  const zoneData = [
    { name: "Gates", green: zones.filter(z => z.type === "gate" && z.status === "green").length, yellow: zones.filter(z => z.type === "gate" && z.status === "yellow").length, red: zones.filter(z => z.type === "gate" && z.status === "red").length },
    { name: "Food", green: zones.filter(z => z.type === "food_court" && z.status === "green").length, yellow: zones.filter(z => z.type === "food_court" && z.status === "yellow").length, red: zones.filter(z => z.type === "food_court" && z.status === "red").length },
    { name: "Parking", green: zones.filter(z => z.type === "parking" && z.status === "green").length, yellow: zones.filter(z => z.type === "parking" && z.status === "yellow").length, red: zones.filter(z => z.type === "parking" && z.status === "red").length },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page header */}
      <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
            Command Center
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            FIFA World Cup 2026 — Semi-Final · Stadium AI Prime
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="live-dot" />
          <span style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>
            Live · {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <OperationsKPIs crowd={crowd} alerts={alerts} vendors={vendors} sustainability={sustainability} />
      {/* ─── CORTEX AI PROTOCOL PIPELINE ─── */}
      <motion.div variants={fadeUp} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", borderTop: "3px solid hsl(210, 90%, 50%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="live-dot" style={{ background: "hsl(210, 90%, 55%)", boxShadow: "0 0 8px hsl(210, 90%, 55%)" }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Cortex AI Tactical Operations</h2>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", marginTop: "2px" }}>
              {workflowStep === "idle" ? "Autonomous monitoring active. Review suggestions below." : "Supervised decision pipeline active."}
            </p>
          </div>

          <span style={{
            fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
            background: workflowStep !== "idle" ? "rgba(59, 130, 246, 0.15)" : "rgba(245, 158, 11, 0.1)",
            color: workflowStep !== "idle" ? "hsl(210, 90%, 65%)" : "hsl(42,95%,65%)",
            border: `1px solid ${workflowStep !== "idle" ? "rgba(59, 130, 246, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            letterSpacing: "0.05em"
          }}>
            {workflowStep === "idle" ? "MONITORING ACTIVE" : workflowStep.toUpperCase()}
          </span>
        </div>

        {/* Dynamic Card Display */}
        <AnimatePresence mode="wait">
          {workflowStep === "idle" ? (
            <motion.div key="idle-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <CortexCard
                severity={crowd.riskScore > 75 ? "critical" : "warning"}
                title="Protocol Delta-2 Recommendation — Gate A Crowd Surge"
                insight={`Cortex AI predicts Gate A density will reach 97% in 5 minutes due to the halftime surge. Opening Lane 4 and executing Protocol Delta-2 (Crowd Redistribution to Gate C) is estimated to reduce bottleneck congestion by 25%.`}
                actions={[
                  {
                    label: "Review Protocol Delta-2",
                    variant: "primary",
                    onClick: () => startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution")
                  }
                ]}
                icon="✦"
              />
            </motion.div>
          ) : workflowStep === "review" ? (
            <motion.div key="review-card" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "hsl(215 20% 12% / 0.8)", border: "1px solid hsl(215 20% 20%)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
                <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9375rem" }}>
                  📋 PROTOCOL DELTA-2 DETAILS & JUSTIFICATION
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "10px", fontSize: "0.8125rem" }}>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Recommended Protocol</span>
                    <span style={{ color: "#fff", fontWeight: "bold" }}>Protocol Delta-2 (Crowd Redistribution)</span>
                  </div>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Reasoning for Action</span>
                    <span style={{ color: "#fff" }}>Gate A crowd flow limit hit 420/min</span>
                  </div>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Current Gate A Density</span>
                    <span style={{ color: "hsl(0,84%,65%)", fontWeight: "bold" }}>{zones.find(z => z.id === "gate-a")?.current ? Math.round((zones.find(z => z.id === "gate-a")!.current / 2000) * 100) : 92}%</span>
                  </div>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Predicted Gate A Density (5m)</span>
                    <span style={{ color: "hsl(0,84%,70%)", fontWeight: "bold" }}>97% (Stampede Risk)</span>
                  </div>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Expected Relief</span>
                    <span style={{ color: "hsl(152,70%,60%)", fontWeight: "bold" }}>-25% Gate A Bottleneck</span>
                  </div>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Confidence Score</span>
                    <span style={{ color: "hsl(152,70%,60%)", fontWeight: "bold" }}>94%</span>
                  </div>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Resolution ETA</span>
                    <span style={{ color: "hsl(210, 90%, 65%)" }}>4 Minutes</span>
                  </div>
                  <div>
                    <span style={{ color: "hsl(var(--foreground-muted))", display: "block", fontSize: "0.7rem" }}>Simulation Results</span>
                    <span style={{ color: "hsl(42,95%,60%)" }}>Alternate paths through Gate C are stable</span>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem", fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>
                  <strong>Operational SOP Parameters:</strong> Lock Gate A secondary entryways. Trigger digital signs directing flows towards North Stands. Reassign volunteer standby teams to Junction 7A.
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn btn-primary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 700 }} onClick={() => setProtocolStatus("executing")}>
                  ⚡ Approve Protocol Execution
                </button>
                <button className="btn btn-ghost" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }} onClick={() => cancelProtocol()}>
                  ✕ Reject Proposal
                </button>
              </div>
            </motion.div>
          ) : workflowStep === "executing" ? (
            <motion.div key="executing-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
              background: "#000", border: "1px solid hsl(210, 90%, 50%)", borderRadius: "var(--radius-md)", padding: "1.25rem",
              fontFamily: "monospace", fontSize: "0.75rem", color: "hsl(210, 90%, 65%)", display: "flex", flexDirection: "column", gap: "0.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>&gt; CORTEX COGNITIVE ACTUATOR: EXEC_PROT_DELTA-2</span>
                <span>{execProgress}%</span>
              </div>
              <div style={{ height: "6px", width: "100%", background: "#111", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${execProgress}%`, background: "hsl(210, 90%, 60%)" }} />
              </div>
              <div style={{ color: "rgba(59, 130, 246, 0.6)" }}>
                {execProgress < 30 && "> RECONFIGURING DIGITAL STAND SIGNALS..."}
                {execProgress >= 30 && execProgress < 70 && "> BROADCASTING ROUTE MAP TO WAYFINDING MOBILE NET..."}
                {execProgress >= 70 && "> PUSHING COORDINATION CHEVRONS TO FIELD STAFF..."}
              </div>
            </motion.div>
          ) : workflowStep === "verifying" ? (
            <motion.div key="verifying-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
              background: "rgba(245, 158, 11, 0.08)", border: "1px solid hsl(42,95%,50%)", borderRadius: "var(--radius-md)",
              padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(42,95%,65%)"
            }}>
              <span className="cortex-pulse" style={{ fontWeight: 700, fontSize: "0.875rem" }}>🔍 VERIFYING SENSOR CALIBRATION AND FLOW RELIEF...</span>
            </motion.div>
          ) : (
            <motion.div key="success-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{
              background: "rgba(16, 185, 129, 0.08)", border: "1px solid hsl(152,70%,50%)", borderRadius: "var(--radius-md)",
              padding: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "hsl(152,70%,60%)"
            }}>
              <span style={{ fontSize: "1.75rem", fontWeight: "bold" }}>✓</span>
              <span style={{ fontWeight: 800, fontSize: "0.9375rem" }}>PROTOCOL DELTA-2 SUCCESSFULLY ENGAGED</span>
              <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))" }}>Gate A risk minimized. Concourse flow rates nominal. Continuous monitoring active.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>      {/* Charts Row */}
      <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Crowd density chart */}
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: "0.125rem" }}>Crowd Density</h3>
              <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>Real-time vs. predicted</p>
            </div>
            <span style={{
              fontSize: "0.75rem", padding: "0.25rem 0.625rem", borderRadius: "999px",
              background: "hsl(210 90% 60% / 0.12)", color: "hsl(210 90% 70%)", fontWeight: 500,
            }}>
              Live
            </span>
          </div>
          <p className="sr-only">
            Crowd Flow chart showing real-time attendance trends against predicted values over the last hour.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={crowd.densityHistory}>
              <defs>
                <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(210,90%,60%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(210,90%,60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152,70%,50%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(152,70%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="density" name="density" stroke="hsl(210,90%,60%)" fill="url(#densityGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="predicted" name="predicted" stroke="hsl(152,70%,50%)" fill="url(#predGrad)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "hsl(var(--foreground-muted))" }}>
              <div style={{ width: 12, height: 2, background: "hsl(210,90%,60%)", borderRadius: 2 }} />
              Actual
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "hsl(var(--foreground-muted))" }}>
              <div style={{ width: 12, height: 2, background: "hsl(152,70%,50%)", borderRadius: 2, opacity: 0.7 }} />
              Predicted
            </div>
          </div>
        </div>

        {/* Zone status chart */}
        <div className="glass-card">
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "0.125rem" }}>Zone Status Overview</h3>
            <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>
              {criticalZones} critical · {warningZones} warning zones
            </p>
          </div>
          <p className="sr-only">
            Zone Status Overview chart. Current numbers are: {criticalZones} critical, {warningZones} warning.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={zoneData} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                labelStyle={{ color: "hsl(var(--foreground-muted))", marginBottom: 4 }}
              />
              <Bar dataKey="green" name="OK" fill="hsl(152,70%,50%)" radius={[4,4,0,0]} />
              <Bar dataKey="yellow" name="Warning" fill="hsl(42,95%,58%)" radius={[4,4,0,0]} />
              <Bar dataKey="red" name="Critical" fill="hsl(0,84%,60%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Alerts, Live Timeline & Vendor Row */}
      <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "1.25rem" }}>
        <ActiveAlertList alerts={alerts} />

        {/* Live Event Timeline */}
        <OperationsTimeline timelineEvents={timelineEvents} />

        <VendorPerformanceList vendors={vendors} />
      </motion.div>

      {/* Predictions */}
      <motion.div variants={fadeUp}>
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>⚡ Cortex Predictions — Next 30 Minutes</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.875rem" }}>
            {[
              { label: "Gate A", prediction: "Will reach 95% in ~5 min", severity: "red", icon: "🚧", action: "Redirect" },
              { label: "Food Court B", prediction: "Halftime rush in ~8 min — queue will triple", severity: "yellow", icon: "🍔", action: "Open Kiosk 4B" },
              { label: "Parking Lot A", prediction: "Full in ~12 min — reroute incoming vehicles", severity: "red", icon: "🚗", action: "Activate C" },
              { label: "Metro East", prediction: "High crowding 30 min post-final whistle", severity: "yellow", icon: "🚇", action: "Deploy Staff" },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  background: p.severity === "red" ? "hsl(0 84% 60% / 0.06)" : "hsl(42 95% 58% / 0.06)",
                  border: `1px solid ${p.severity === "red" ? "hsl(0 84% 60% / 0.2)" : "hsl(42 95% 58% / 0.2)"}`,
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span>{p.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{p.label}</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                  {p.prediction}
                </p>
              <button
                  aria-label={`Execute action: ${p.action} for ${p.label}`}
                  id={`pred-btn-${p.label.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{
                    padding: "0.375rem 0.75rem", borderRadius: "var(--radius-sm)",
                    background: p.severity === "red" ? "hsl(0 84% 55%)" : "hsl(42 95% 52%)",
                    color: p.severity === "red" ? "white" : "hsl(20 10% 10%)",
                    border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600,
                  }}
                  onClick={() => {
                    toast.promise(new Promise(res => setTimeout(res, 1000)), {
                      loading: `Executing: ${p.action}...`,
                      success: () => {
                        addTimelineEvent("automation", `AI executed automated action: ${p.action} for ${p.label}`, p.severity === "red" ? "critical" : "warning");
                        return `Successfully executed ${p.action}`;
                      },
                      error: 'Action failed',
                    });
                  }}
                >
                  {p.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
