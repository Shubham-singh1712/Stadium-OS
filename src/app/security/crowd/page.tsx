"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { getStatusColor } from "@/lib/utils";
import { showCortexToast } from "@/lib/cortexToast";
import type { StadiumZone } from "@/types";

// Local Sub-component for individual zone observation card
function ZoneObserverCard({ zone }: { zone: StadiumZone }) {
  const [isCctvActive, setIsCctvActive] = useState(false);
  const [isTelemetryActive, setIsTelemetryActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animated Telemetry
  const [displayFlowRate, setDisplayFlowRate] = useState(zone.flowRate || 180);
  const [displayEta, setDisplayEta] = useState(zone.criticalEta || 12);
  const [displayConfidence, setDisplayConfidence] = useState(zone.confidenceScore || 94);
  const [sparkline, setSparkline] = useState<number[]>(zone.densitySparkline || Array.from({ length: 20 }, () => 50));
  const [cctvLogs, setCctvLogs] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const telemetryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pct = Math.round((zone.current / zone.capacity) * 100);

  // Live timer for CCTV connection duration
  useEffect(() => {
    if (isCctvActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      // Scrolling diagnostic logs
      setCctvLogs([
        `[${new Date().toLocaleTimeString()}] SYN_OK: FEED ESTABLISHED`,
        `[${new Date().toLocaleTimeString()}] PORT: 90${Math.floor(Math.random() * 90) + 10} CONNEC`,
      ]);

      const logPrompts = [
        "FLOW: density optimal",
        "SENSOR: Turnstile check passed",
        "AI_ANALYTICS: No flow anomalies",
        "ANOMALY_INDEX: 0.04 (Nominal)",
        "LOG: CCTV compression 265 ok",
        "SENSOR: RFID scanner reset",
        "DATA_BUS: Sync status active",
      ];

      logsIntervalRef.current = setInterval(() => {
        const randomLog = logPrompts[Math.floor(Math.random() * logPrompts.length)];
        setCctvLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ${randomLog}`,
          ...prev.slice(0, 4)
        ]);
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (logsIntervalRef.current) clearInterval(logsIntervalRef.current);
      setElapsedTime(0);
      setCctvLogs([]);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (logsIntervalRef.current) clearInterval(logsIntervalRef.current);
    };
  }, [isCctvActive]);

  // Telemetry Link drifting and sparkline update
  useEffect(() => {
    if (isTelemetryActive) {
      telemetryIntervalRef.current = setInterval(() => {
        setDisplayFlowRate(prev => Math.max(50, Math.min(480, prev + Math.floor(Math.random() * 19) - 9)));
        setDisplayEta(prev => Math.max(2, Math.min(60, prev + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : -2) : 0))));
        setDisplayConfidence(prev => Math.max(88, Math.min(99, prev + (Math.random() > 0.5 ? 1 : -1))));
        setSparkline(prev => {
          const next = [...prev.slice(1)];
          const drift = Math.max(10, Math.min(98, prev[prev.length - 1] + Math.floor(Math.random() * 11) - 5));
          next.push(drift);
          return next;
        });
      }, 2000);
    } else {
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    }

    return () => {
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    };
  }, [isTelemetryActive]);

  // Sync with store updates if telemetry isn't actively drifting locally
  useEffect(() => {
    if (!isTelemetryActive) {
      if (zone.flowRate) setDisplayFlowRate(zone.flowRate);
      if (zone.criticalEta) setDisplayEta(zone.criticalEta);
      if (zone.confidenceScore) setDisplayConfidence(zone.confidenceScore);
      if (zone.densitySparkline) setSparkline(zone.densitySparkline);
    }
  }, [zone.flowRate, zone.criticalEta, zone.confidenceScore, zone.densitySparkline, isTelemetryActive]);

  const handleCctvToggle = () => {
    const nextState = !isCctvActive;
    setIsCctvActive(nextState);

    if (nextState) {
      showCortexToast({
        title: "CCTV Camera Feed Engaged",
        message: `Securing encrypted stream for CAM-${zone.id.toUpperCase()} at ${zone.name}.`,
        severity: "info",
        category: "CCTV OVERLAY"
      });
    } else {
      showCortexToast({
        title: "CCTV Camera Feed Terminated",
        message: `CCTV connection closed for ${zone.name}. Link state idle.`,
        severity: "success",
        category: "CCTV OVERLAY"
      });
    }
  };

  const handleTelemetryToggle = () => {
    const nextState = !isTelemetryActive;
    setIsTelemetryActive(nextState);

    if (nextState) {
      showCortexToast({
        title: "Telemetry Sync Active",
        message: `Began streaming active density sensors on ${zone.name}.`,
        severity: "info",
        category: "SENSOR NET"
      });
    } else {
      showCortexToast({
        title: "Telemetry Sync Concluded",
        message: `Sensor link deactivated for ${zone.name}. Metrics cached.`,
        severity: "success",
        category: "SENSOR NET"
      });
    }
  };

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const isCritical = zone.status === "red";
  const isWarning = zone.status === "yellow";
  const statusColor = isCritical ? "hsl(0,84%,60%)" : isWarning ? "hsl(42,95%,58%)" : "hsl(152,70%,50%)";
  const statusBg = isCritical ? "hsl(0 84% 60% / 0.08)" : isWarning ? "hsl(42 95% 58% / 0.08)" : "hsl(152 70% 50% / 0.05)";
  const statusBorder = isCritical ? "hsl(0 84% 60% / 0.3)" : isWarning ? "hsl(42 95% 58% / 0.3)" : "hsl(152 70% 50% / 0.2)";

  return (
    <motion.div
      className="glass-card"
      animate={isCctvActive ? {
        borderColor: "rgba(16, 185, 129, 0.4)",
        boxShadow: "0 0 24px rgba(16, 185, 129, 0.15)",
      } : isTelemetryActive ? {
        borderColor: "rgba(59, 130, 246, 0.4)",
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.12)",
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        display: "flex", flexDirection: "column", gap: "1rem", padding: "1.25rem",
        background: statusBg, border: "1px solid hsl(var(--glass-border))",
        position: "relative", overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: -50, right: -50, width: 100, height: 100, borderRadius: "50%", background: statusColor, filter: "blur(60px)", opacity: 0.12, pointerEvents: "none" }} />

      {/* Top: Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 70px", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 6px", background: "rgba(0,0,0,0.3)", borderRadius: "999px", border: `1px solid ${statusColor}30` }}>
              <motion.div
                animate={isCctvActive ? { opacity: [1, 0.2, 1], scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: isCctvActive ? "hsl(152,70%,50%)" : statusColor, boxShadow: `0 0 6px ${isCctvActive ? "hsl(152,70%,50%)" : statusColor}` }}
              />
              <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em", color: isCctvActive ? "hsl(152,70%,60%)" : statusColor }}>
                {isCctvActive ? "FEED ACTIVE" : isTelemetryActive ? "TELEMETRY" : zone.status.toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>{zone.name}</h3>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 900, color: "hsl(var(--foreground))", lineHeight: 1, letterSpacing: "-0.04em" }}>
              {pct}%
            </span>
            <span style={{ fontSize: "0.6875rem", color: "hsl(var(--foreground-muted))" }}>density</span>
          </div>

          <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "hsl(var(--foreground-muted))", marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <span>FLOW:{displayFlowRate}/M</span>
            <span>ETA:{displayEta}M</span>
            <span>CF:{displayConfidence}%</span>
          </div>
        </div>

        {/* Small CCTV Thumbnail */}
        <div style={{ width: "70px", height: "70px", background: "hsl(215 20% 8%)", borderRadius: "6px", overflow: "hidden", position: "relative", border: `1px solid ${statusBorder}`, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)` }} />
          <motion.div animate={isCctvActive ? { y: [0, 70, 0] } : { y: [0, 70, 0] }} transition={isCctvActive ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 5, repeat: Infinity, ease: "linear" }} style={{ width: "100%", height: "1.5px", background: isCctvActive ? "hsl(152,70%,50%)" : statusColor, opacity: isCctvActive ? 0.95 : 0.4, filter: "blur(1px)" }} />
          <div style={{ position: "absolute", bottom: 2, right: 3, fontSize: "0.45rem", fontFamily: "monospace", color: isCctvActive ? "hsl(152,70%,50%)" : statusColor, opacity: 0.8 }}>CAM_0{zone.id.charCodeAt(zone.id.length - 1) % 9 + 1}</div>
          {isCctvActive && (
            <div style={{ position: "absolute", top: 3, left: 4, width: 4, height: 4, borderRadius: "50%", background: "hsl(0,84%,60%)" }} />
          )}
        </div>
      </div>

      {/* Expanded CCTV Feed & Log Drawer */}
      <AnimatePresence>
        {isCctvActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: "#000",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "6px",
              padding: "8px 10px",
              overflow: "hidden",
              fontFamily: "monospace",
              fontSize: "0.625rem",
              color: "hsl(152,70%,55%)",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "2px", fontWeight: "bold" }}>
              <span>🎥 CAM_OVERLAY_NET</span>
              <span>LIVE // TIME: {formatTime(elapsedTime)}</span>
            </div>
            <div style={{ fontSize: "0.58rem", color: "rgba(16, 185, 129, 0.5)", textTransform: "uppercase" }}>
              FPS: 30 · RES: 1080P · BITRATE: 4.8MBPS
            </div>
            <div style={{ height: "60px", overflowY: "hidden", display: "flex", flexDirection: "column-reverse", gap: "2px" }}>
              {cctvLogs.map((log, index) => (
                <div key={index} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Middle: Sparkline */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", height: "24px", gap: "2px", marginBottom: "0.375rem" }}>
          {sparkline.map((val, i) => (
            <motion.div key={i} animate={{ height: `${val}%` }} style={{ flex: 1, background: val > 80 ? "hsl(0,84%,60%)" : val > 50 ? "hsl(42,95%,58%)" : "hsl(152,70%,50%)", opacity: isTelemetryActive ? 0.8 : 0.4, borderRadius: "1px 1px 0 0" }} />
          ))}
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: statusColor }} />
        </div>
      </div>

      {/* Cortex AI Box */}
      <div style={{
        background: "hsl(215 20% 12% / 0.6)", border: `1px solid hsl(215 20% 22%)`,
        borderRadius: "var(--radius-sm)", padding: "0.75rem",
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.75rem" }}>🤖</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "hsl(210,90%,65%)", letterSpacing: "0.05em" }}>CORTEX AI</span>
        </div>
        <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.5 }}>
          {zone.aiRecommendation || "Flow rate is optimal. No active anomalies detected."}
        </p>
      </div>

      {/* Bottom: Action buttons (Connect CCTV / Telemetry Link) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "auto" }}>
        <button
          className="btn btn-ghost"
          onClick={handleCctvToggle}
          style={{
            justifyContent: "center", fontSize: "0.75rem", padding: "0.5rem 0.25rem",
            ...(isCctvActive ? { background: "rgba(16, 185, 129, 0.15)", borderColor: "hsl(152,70%,50%)", color: "hsl(152,70%,60%)" } : {})
          }}
        >
          {isCctvActive ? "⏹ Disconnect" : "📡 Connect CCTV"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={handleTelemetryToggle}
          style={{
            justifyContent: "center", fontSize: "0.75rem", padding: "0.5rem 0.25rem",
            ...(isTelemetryActive ? { background: "rgba(59, 130, 246, 0.15)", borderColor: "hsl(210,90%,50%)", color: "hsl(210,90%,60%)" } : {})
          }}
        >
          {isTelemetryActive ? "⏹ Unlink Tele" : "📊 Telemetry Link"}
        </button>
      </div>
    </motion.div>
  );
}

export default function SecurityCrowdPage() {
  const crowd = useCortexStore((state) => state.crowd);
  const zones = useCortexStore((state) => state.zones);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Crowd Map</h2>

      {/* Density heat summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Crowd", value: crowd.totalAttendance.toLocaleString(), icon: "👥", color: "hsl(210,90%,60%)" },
          { label: "Occupancy", value: `${crowd.occupancyRate}%`, icon: "📊", color: "hsl(42,95%,58%)" },
          { label: "Risk Score", value: crowd.riskScore, icon: "⚠️", color: crowd.riskScore > 70 ? "hsl(0,84%,60%)" : "hsl(42,95%,58%)" },
          { label: "Critical Zones", value: zones.filter(z => z.status === "red").length, icon: "🔴", color: "hsl(0,84%,60%)" },
        ].map(m => (
          <div key={m.label} className="glass-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{m.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Live Crowd Density History</h3>
        <div className="sr-only">
          <h4>Live Crowd Density History Summary</h4>
          <p>The actual crowd density peaks at {crowd.occupancyRate}%, with risk level classified as {crowd.riskLevel}.</p>
        </div>
        <ResponsiveContainer width="100%" height={300} role="img" aria-label="Sector density distribution chart">
          <AreaChart data={crowd.densityHistory}>
            <defs>
              <linearGradient id="cmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0,84%,60%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(0,84%,60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, "Density"]} />
            <Area type="monotone" dataKey="density" stroke="hsl(0,84%,60%)" fill="url(#cmGrad)" strokeWidth={2.5} dot={false} name="Density" />
            <Area type="monotone" dataKey="predicted" stroke="hsl(210,90%,60%)" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── SECURITY COMMAND CENTER HEADER ── */}
      <div style={{ marginTop: "1rem", marginBottom: "0.25rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem", color: "hsl(var(--foreground))" }}>Security Command Center</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", fontWeight: 500, marginRight: "0.5rem" }}>Real-Time Crowd Monitoring</span>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", background: "hsl(0 84% 60% / 0.1)", border: "1px solid hsl(0 84% 60% / 0.2)", borderRadius: "999px" }}>
            <span style={{ fontSize: "0.7rem", color: "hsl(0,84%,65%)", fontWeight: 600 }}>🔴 {zones.filter(z => z.status === "red").length} Critical Gates</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", background: "hsl(152 70% 50% / 0.1)", border: "1px solid hsl(152 70% 50% / 0.2)", borderRadius: "999px" }}>
            <span style={{ fontSize: "0.7rem", color: "hsl(152,70%,60%)", fontWeight: 600 }}>🟢 {zones.filter(z => z.status === "green").length} Normal Gates</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: "999px" }}>
            <span style={{ fontSize: "0.7rem", color: "hsl(var(--foreground-muted))", fontWeight: 600 }}>⚠️ Overall Risk Index: {crowd.riskScore}</span>
          </div>
        </div>
      </div>

      {/* ── AI GATE CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {zones.map(zone => (
          <ZoneObserverCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
}
