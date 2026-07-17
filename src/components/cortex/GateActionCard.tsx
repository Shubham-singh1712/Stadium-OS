"use client";

import { motion } from "framer-motion";
import { useCortexStore } from "@/stores/cortexStore";
import { getStatusColor } from "@/lib/utils";
import { useGateCardLogic } from "@/hooks/useGateCardLogic";
import { GateTelemetry } from "./GateTelemetry";
import { GateSparkline } from "./GateSparkline";
import { GateLogs } from "./GateLogs";
import { GateControls } from "./GateControls";

interface GateActionCardProps {
  zoneId: string;
  actionType: "redirect" | "monitor" | "expand";
  description: string;
  destinationZoneId?: string;
}

export function GateActionCard({ zoneId, actionType, description, destinationZoneId = "gate-c" }: GateActionCardProps) {
  const zones = useCortexStore((state) => state.zones);
  const zone = zones.find(z => z.id === zoneId);

  if (!zone) return null;

  const {
    isMonitoring,
    elapsedTime,
    displayPct,
    displayFlowRate,
    displayEta,
    displayConfidence,
    sparkline,
    workflowStep,
    execProgress,
    handleActionClick,
    approveProtocol,
    cancelProtocolClick,
    abortProtocol,
    toggleChecklistItem,
    activeProtocol,
  } = useGateCardLogic(zone, actionType, zoneId);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const statusColor = getStatusColor(displayPct) === "red" 
    ? "hsl(0,84%,60%)" 
    : getStatusColor(displayPct) === "yellow" 
      ? "hsl(42,95%,58%)" 
      : "hsl(152,70%,50%)";

  const isWarning = getStatusColor(displayPct) === "yellow";
  const isCritical = getStatusColor(displayPct) === "red";

  const protocolName = actionType === "redirect" 
    ? "Protocol Delta-2" 
    : actionType === "expand" 
      ? "Protocol Atlas-3" 
      : "Protocol Echo-4";

  const protocolTitle = actionType === "redirect" 
    ? "Crowd Redistribution" 
    : actionType === "expand" 
      ? "Overflow Lane Activation" 
      : "Volunteer Reinforcement";

  return (
    <motion.div
      className="glass-card"
      layout="position"
      animate={workflowStep === "success" ? {
        borderColor: "rgba(16, 185, 129, 0.5)",
        boxShadow: "0 0 24px rgba(16, 185, 129, 0.2)",
      } : workflowStep === "executing" ? {
        borderColor: "rgba(59, 130, 246, 0.4)",
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)",
      } : isMonitoring ? {
        borderColor: "rgba(59, 130, 246, 0.4)",
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)",
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "0.75rem",
        position: "relative",
        overflow: "hidden",
        borderTop: `3px solid ${statusColor}`,
      }}
    >
      <div style={{ position: "absolute", top: -50, right: -50, width: 100, height: 100, borderRadius: "50%", background: statusColor, filter: "blur(60px)", opacity: 0.15, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ fontWeight: 800, fontSize: "1rem" }}>{zone.name}</h3>
            {isMonitoring ? (
              <span className="live-dot" style={{ background: "hsl(210 90% 60%)", boxShadow: "0 0 8px hsl(210 90% 60%)" }} />
            ) : workflowStep !== "idle" ? (
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(210, 90%, 60%)" }} className="cortex-pulse" />
            ) : null}
          </div>
          <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", marginTop: "2px" }}>
            {actionType === "monitor" && isMonitoring 
              ? `Live Link Active · Elapsed: ${formatTime(elapsedTime)}` 
              : description}
          </p>
        </div>

        {/* Status Badge */}
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            padding: "0.15rem 0.4rem",
            borderRadius: "999px",
            background: workflowStep !== "idle"
              ? "rgba(59, 130, 246, 0.15)"
              : isMonitoring
                ? "rgba(210, 90, 60, 0.15)"
                : `${statusColor}15`,
            color: workflowStep !== "idle"
              ? "hsl(210, 90%, 65%)"
              : isMonitoring
                ? "hsl(210, 90%, 65%)"
                : statusColor,
            border: `1px solid ${workflowStep !== "idle"
              ? "rgba(59, 130, 246, 0.3)"
              : isMonitoring
                ? "rgba(210, 90, 60, 0.3)"
                : `${statusColor}30`}`,
            letterSpacing: "0.05em",
          }}
        >
          {workflowStep === "review"
            ? "REVIEW PROTOCOL"
            : workflowStep === "executing"
              ? "EXECUTING OVERRIDE"
              : workflowStep === "verifying"
                ? "VERIFYING SEN-CAL"
                : workflowStep === "success"
                  ? "✓ COMPLIANT"
                  : isMonitoring
                    ? "LIVE FEED"
                    : isCritical
                      ? "AVOID"
                      : isWarning
                        ? "MODERATE"
                        : "OPEN"}
        </span>
      </div>

      {/* Main density value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0" }}>
        <span style={{ fontSize: "1.75rem", fontWeight: 900, color: statusColor, letterSpacing: "-0.04em" }}>
          {displayPct}%
        </span>
        <span style={{ fontSize: "0.7rem", color: "hsl(var(--foreground-subtle))" }}>
          density ({zone.current} / {zone.capacity})
        </span>
      </div>

      {/* Telemetry Display */}
      <GateTelemetry flowRate={displayFlowRate} eta={displayEta} confidence={displayConfidence} />

      {/* Sparkline & Progress Track */}
      <div>
        <GateSparkline sparkline={sparkline} isMonitoring={isMonitoring} />
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${displayPct}%`,
              background: `linear-gradient(90deg, ${statusColor}cc, ${statusColor})`,
              boxShadow: `0 0 10px ${statusColor}`,
            }}
          />
        </div>
      </div>

      {/* Cortex AI Box with Structured Explain-WHY Recommendation Parameters */}
      <GateLogs
        workflowStep={workflowStep}
        actionType={actionType}
        isCritical={isCritical}
        protocolName={protocolName}
        protocolTitle={protocolTitle}
        displayConfidence={displayConfidence}
        displayPct={displayPct}
        zone={zone}
      />

      {/* Action Pipeline Controls */}
      <GateControls
        workflowStep={workflowStep}
        execProgress={execProgress}
        protocolName={protocolName}
        protocolTitle={protocolTitle}
        isCritical={isCritical}
        isWarning={isWarning}
        isMonitoring={isMonitoring}
        actionType={actionType}
        approveProtocol={approveProtocol}
        cancelProtocolClick={cancelProtocolClick}
        handleActionClick={handleActionClick}
        abortProtocol={abortProtocol}
        toggleChecklistItem={toggleChecklistItem}
        activeProtocol={activeProtocol}
      />
    </motion.div>
  );
}
