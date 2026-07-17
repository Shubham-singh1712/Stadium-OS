"use client";

import { useState } from "react";
import type { StadiumZone } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "hsl(215 20% 12% / 0.6)",
      border: "1px solid hsl(215 20% 20%)",
      borderRadius: "var(--radius-sm)",
      padding: "0.5rem",
      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expanded ? "6px" : "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.7rem" }}>🤖</span>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "hsl(210,90%,65%)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Cortex AI Insight</span>
        </div>
        
        {/* Basic compact info */}
        {workflowStep === "review" || (actionType !== "monitor" && isCritical) ? (
          <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.65rem" }}>
             <span style={{ color: "hsl(152,70%,60%)", fontWeight: 700 }}>{displayConfidence}% Conf</span>
             <span style={{ color: "hsl(210,90%,65%)" }}>ETA: {actionType === "redirect" ? "4m" : "2m"}</span>
          </div>
        ) : null}
      </div>

      {workflowStep === "review" || (actionType !== "monitor" && isCritical) ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.7rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
             <div style={{ lineHeight: 1.2 }}>
                <span style={{ color: "hsl(210,90%,65%)", fontWeight: 700 }}>{protocolName}</span>
                <span style={{ color: "hsl(var(--foreground-muted))", margin: "0 4px" }}>·</span> 
                <span style={{ color: "#fff", fontWeight: 500 }}>{protocolTitle}</span>
             </div>
             <button 
                onClick={() => setExpanded(!expanded)}
                style={{ 
                  background: "transparent", border: "none", color: "hsl(var(--foreground-muted))", 
                  fontSize: "0.6rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px",
                  padding: "0 0 0 4px", flexShrink: 0
                }}
             >
               {expanded ? "Collapse" : "View Full Analysis"}
               {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
             </button>
          </div>
          
          {!expanded && (
             <div style={{ color: "hsl(var(--foreground-muted))", fontSize: "0.65rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
               {actionType === "redirect" ? "Gate flow >280/min; projected stampede within 5m." : "Lane occupancy >85%; capacity adjustment required."}
             </div>
          )}

          {expanded && (
            <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", color: "hsl(var(--foreground-muted))" }}>
                <div>
                  <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.6rem" }}>Reason</span>
                  <span style={{ color: "#fff", fontSize: "0.65rem" }}>{actionType === "redirect" ? "Gate flow >280/min" : "Lane >85% full"}</span>
                </div>
                <div>
                  <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.6rem" }}>Current ➔ Predicted Density</span>
                  <span style={{ color: "hsl(0,84%,65%)", fontSize: "0.65rem" }}>{displayPct}% ➔ <span style={{ fontWeight: 700 }}>{actionType === "redirect" ? "97%" : "88%"}</span></span>
                </div>
                <div>
                  <span style={{ color: "hsl(var(--foreground-subtle))", display: "block", fontSize: "0.6rem" }}>Expected Relief</span>
                  <span style={{ color: "hsl(152,70%,60%)", fontSize: "0.65rem" }}>{actionType === "redirect" ? "-25% Congestion" : "Capacity +500 (-12%)"}</span>
                </div>
              </div>
              
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px", fontSize: "0.6rem", color: "hsl(var(--foreground-subtle))", lineHeight: 1.3 }}>
                <span style={{ color: "hsl(var(--foreground-subtle))", fontWeight: 700 }}>Sim Results:</span> Projected stampede trigger and turnstile blockages within 300 seconds if not executed.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          style={{ 
            fontSize: "0.65rem", 
            color: "hsl(var(--foreground-muted))", 
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: "2px"
          }}
          dangerouslySetInnerHTML={{ 
            __html: (zone.aiRecommendation || "Flow rate is nominal. Telemetry checks compliant.")
              .replace(/\*\*(.*?)\*\*/g, "<strong style='color:#fff'>$1</strong>") 
          }}
        />
      )}
    </div>
  );
}
