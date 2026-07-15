import type { StadiumZone } from "@/types";

interface GateLogsProps {
  workflowStep: string;
  actionType: "redirect" | "monitor" | "expand";
  isCritical: boolean;
  protocolName: string;
  protocolTitle: string;
  displayConfidence: number;
  displayPct: number;
  zone: StadiumZone;
}

export function GateLogs({
  workflowStep,
  actionType,
  isCritical,
  protocolName,
  protocolTitle,
  displayConfidence,
  displayPct,
  zone
}: GateLogsProps) {
  return (
    <div style={{
      background: "hsl(215 20% 12% / 0.6)",
      border: "1px solid hsl(215 20% 20%)",
      borderRadius: "var(--radius-sm)",
      padding: "0.75rem",
      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "0.75rem" }}>🤖</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "hsl(210,90%,65%)", letterSpacing: "0.05em" }}>CORTEX AI LOGS</span>
      </div>

      {workflowStep === "review" || (actionType !== "monitor" && isCritical) ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem" }}>
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
            <span style={{ color: "hsl(210,90%,65%)", fontWeight: "bold" }}>{protocolName}</span> · <span style={{ color: "#fff", fontWeight: 500 }}>{protocolTitle}</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", color: "hsl(var(--foreground-muted))" }}>
            <div>
              <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.65rem" }}>Reason</span>
              <span style={{ color: "#fff" }}>{actionType === "redirect" ? "Gate A flow exceeds warning threshold (280/min)" : "Lane occupancy exceeds 85% limits"}</span>
            </div>
            <div>
              <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.65rem" }}>Confidence Score</span>
              <span style={{ color: "hsl(152,70%,60%)", fontWeight: "bold" }}>{displayConfidence}%</span>
            </div>
            <div>
              <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.65rem" }}>Current Density</span>
              <span style={{ color: "hsl(0,84%,65%)" }}>{displayPct}%</span>
            </div>
            <div>
              <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.65rem" }}>Predicted Density (5m)</span>
              <span style={{ color: "hsl(0,84%,70%)", fontWeight: "bold" }}>{actionType === "redirect" ? "97%" : "88%"}</span>
            </div>
            <div>
              <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.65rem" }}>Expected Relief</span>
              <span style={{ color: "hsl(152,70%,60%)" }}>{actionType === "redirect" ? "-25% Congestion" : "Capacity +500 (-12%)"}</span>
            </div>
            <div>
              <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.65rem" }}>Resolution ETA</span>
              <span style={{ color: "hsl(210,90%,65%)" }}>{actionType === "redirect" ? "4 Minutes" : "2 Minutes"}</span>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px", fontSize: "0.7rem", color: "hsl(var(--foreground-subtle))" }}>
            <span style={{ color: "hsl(var(--foreground-subtle))", fontWeight: 600 }}>Sim Results:</span> Projected stampede trigger and turnstile blockages within 300 seconds if not executed.
          </div>
        </div>
      ) : (
        <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.5 }}>
          {zone.aiRecommendation || "Flow rate is nominal. Telemetry checks compliant."}
        </p>
      )}
    </div>
  );
}
