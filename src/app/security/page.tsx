"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SecurityPage() {
  const crowd = useCortexStore((state) => state.crowd);
  const alerts = useCortexStore((state) => state.alerts);
  const zones = useCortexStore((state) => state.zones);
  const timelineEvents = useCortexStore((state) => state.timelineEvents);
  const startProtocol = useCortexStore((state) => state.startProtocol);
  const autoAssignStaff = useCortexStore((state) => state.autoAssignStaff);
  const addTimelineEvent = useCortexStore((state) => state.addTimelineEvent);

  const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.acknowledged);
  const warningAlerts = alerts.filter(a => a.severity === "warning" && !a.acknowledged);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Security Command</h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            {criticalAlerts.length} critical · {warningAlerts.length} warning · Officer Chen
          </p>
        </div>
        <button className="btn btn-danger" style={{ marginLeft: "auto" }} onClick={() => {
          toast.error("Emergency broadcast active. Security posts notified.");
          addTimelineEvent("Security", "Security broadcasted emergency broadcast stadium-wide.", "critical");
        }}>
          🚨 Emergency Broadcast
        </button>
      </div>

      {/* Risk metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        <MetricCard label="Risk Score" value={crowd.riskScore} unit="/100" icon="⚠️" color={crowd.riskScore > 70 ? "hsl(0,84%,60%)" : "hsl(42,95%,58%)"} subtitle={crowd.riskLevel} />
        <MetricCard label="Critical Zones" value={zones.filter(z => z.status === "red").length} icon="🔴" color="hsl(0,84%,60%)" subtitle="Require action" />
        <MetricCard label="Occupancy" value={`${crowd.occupancyRate}%`} icon="👥" color="hsl(210,90%,60%)" subtitle="Stadium-wide" />
        <MetricCard label="Unack. Alerts" value={alerts.filter(a => !a.acknowledged).length} icon="🚨" color="hsl(42,95%,58%)" subtitle="Pending review" />
      </div>

      <CortexCard
        severity={crowd.riskScore > 70 ? "critical" : "warning"}
        title={`Crowd risk is ${crowd.riskLevel} — ${crowd.hotspots.join(", ")} need immediate attention`}
        insight={`Cortex AI: Gate A is at 92% capacity with flow rate of 340 people/min — exceeding safe threshold of 280/min. Recommend crowd diversion to Gate C (30% capacity) immediately. Security Post 2 staffing is insufficient — recommend 3 additional officers from Sector F.`}
        actions={[
          {
            label: "Activate Diversion Protocol",
            variant: "primary",
            onClick: () => {
              startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
              toast.success("Initiating Protocol Delta-2 Review...");
            }
          },
          {
            label: "Request Backup",
            variant: "danger",
            onClick: () => {
              autoAssignStaff();
            }
          },
          {
            label: "Close Gate A Temp.",
            variant: "ghost",
            onClick: () => {
              toast.warning("Gate A temporary closure signal sent.");
              addTimelineEvent("Security", "Gate A closed temporarily.", "warning");
            }
          },
        ]}
      />

      {/* Crowd density chart */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Live Crowd Density — Stadium Wide</h3>
        <div className="sr-only">
          <h4>Live Crowd Density Summary</h4>
          <p>The actual crowd density has peaked at {crowd.occupancyRate}%, with risk level classified as {crowd.riskLevel}.</p>
        </div>
        <ResponsiveContainer width="100%" height={220} role="img" aria-label="Security operations crowd density chart">
          <AreaChart data={crowd.densityHistory}>
            <defs>
              <linearGradient id="secGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0,84%,60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(0,84%,60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, "Density"]} />
            <Area type="monotone" dataKey="density" stroke="hsl(0,84%,60%)" fill="url(#secGrad)" strokeWidth={2.5} dot={false} name="Density" />
            <Area type="monotone" dataKey="predicted" stroke="hsl(42,95%,58%)" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts, Event Timeline & Critical Zones Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "1.25rem" }}>
        {/* Active Alerts Feed */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Active Alerts — Priority Feed</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", overflowY: "auto", maxHeight: "320px" }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-${alert.severity}`}
                style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-sm)", opacity: alert.acknowledged ? 0.55 : 1 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {alert.severity === "critical" ? "🔴" : alert.severity === "warning" ? "🟡" : "🔵"} {alert.title}
                  </span>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => useCortexStore.getState().acknowledgeAlert(alert.id)}
                      style={{
                        padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)",
                        background: "hsl(var(--surface-3))", border: "none", cursor: "pointer",
                        fontSize: "0.75rem", color: "hsl(var(--foreground-muted))",
                      }}
                    >
                      Ack
                    </button>
                  )}
                </div>
                <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>{alert.message}</p>
                <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "0.25rem" }}>📍 {alert.zone}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Timeline Stream */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(190,100%,50%)" }} className="live-dot" />
            Live Activity Stream
          </h3>
          <div style={{
            display: "flex", flexDirection: "column", gap: "0.75rem",
            maxHeight: "320px", overflowY: "auto", paddingRight: "4px"
          }}>
            <AnimatePresence>
              {timelineEvents.map((evt) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex", gap: "10px", alignItems: "flex-start",
                    fontSize: "0.8125rem", borderBottom: "1px solid hsl(var(--border) / 0.15)",
                    paddingBottom: "8px"
                  }}
                >
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
                    padding: "0.15rem 0.4rem", borderRadius: "4px", flexShrink: 0,
                    background: evt.severity === "critical" ? "hsl(0 84% 60% / 0.12)" : evt.severity === "warning" ? "hsl(42 95% 58% / 0.12)" : "hsl(210 90% 60% / 0.1)",
                    color: evt.severity === "critical" ? "hsl(0 84% 65%)" : evt.severity === "warning" ? "hsl(42 95% 65%)" : "hsl(210 90% 70%)",
                  }}>
                    {evt.category}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "hsl(var(--foreground))", lineHeight: 1.4 }}>{evt.message}</p>
                    <span style={{ fontSize: "0.6875rem", color: "hsl(var(--foreground-subtle))" }}>
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Zone status list */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Critical & Warning Zones</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", overflowY: "auto", maxHeight: "320px" }}>
            {zones.filter(z => z.status !== "green").map((zone) => {
              const pct = Math.round((zone.current / zone.capacity) * 100);
              return (
                <div key={zone.id} style={{
                  padding: "0.875rem 1rem", borderRadius: "var(--radius-sm)",
                  background: zone.status === "red" ? "hsl(0 84% 60% / 0.07)" : "hsl(42 95% 58% / 0.07)",
                  border: `1px solid ${zone.status === "red" ? "hsl(0 84% 60% / 0.2)" : "hsl(42 95% 58% / 0.2)"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{zone.name}</span>
                    <span style={{ fontWeight: 700, color: zone.status === "red" ? "hsl(0,84%,65%)" : "hsl(42,95%,65%)", fontSize: "0.875rem" }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: zone.status === "red" ? "hsl(0,84%,55%)" : "hsl(42,95%,52%)" }} />
                  </div>
                  {zone.aiRecommendation && (
                    <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "0.375rem" }}>
                      ✦ {zone.aiRecommendation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
