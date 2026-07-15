interface GateTelemetryProps {
  flowRate: number;
  eta: number;
  confidence: number;
}

export function GateTelemetry({ flowRate, eta, confidence }: GateTelemetryProps) {
  return (
    <div style={{ fontFamily: "monospace", fontSize: "0.6875rem", color: "hsl(var(--foreground-muted))", display: "flex", gap: "0.75rem" }}>
      <span>FLOW:{flowRate}/M</span>
      <span>ETA:{eta}M</span>
      <span>CF:{confidence}%</span>
    </div>
  );
}
