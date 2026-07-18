import { toast } from "sonner";

interface CortexToastOptions {
  title: string;
  message: string;
  severity: "info" | "warning" | "critical" | "success";
  category?: string;
}

export function showCortexToast({ title, message, severity, category = "CORTEX SEC-OPS" }: CortexToastOptions) {
  const styles = {
    info: { border: "rgba(59, 130, 246, 0.4)", bg: "rgba(10, 15, 30, 0.95)", glow: "rgba(59, 130, 246, 0.15)", led: "#3b82f6", text: "#60a5fa" },
    warning: { border: "rgba(245, 158, 11, 0.4)", bg: "rgba(15, 15, 10, 0.95)", glow: "rgba(245, 158, 11, 0.15)", led: "#f59e0b", text: "#fbbf24" },
    critical: { border: "rgba(239, 68, 68, 0.4)", bg: "rgba(20, 10, 10, 0.95)", glow: "rgba(239, 68, 68, 0.2)", led: "#ef4444", text: "#f87171" },
    success: { border: "rgba(16, 185, 129, 0.4)", bg: "rgba(10, 20, 15, 0.95)", glow: "rgba(16, 185, 129, 0.15)", led: "#10b981", text: "#34d399" },
  }[severity];

  toast.custom(() => (
    <div
      role={severity === "critical" || severity === "warning" ? "alert" : "status"}
      aria-live={severity === "critical" || severity === "warning" ? "assertive" : "polite"}
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        boxShadow: `0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${styles.glow}, inset 0 0 12px rgba(255, 255, 255, 0.01)`,
        borderRadius: "10px",
        padding: "14px 16px",
        width: "360px",
        fontFamily: "monospace",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        backdropFilter: "blur(16px)",
        borderLeft: `4px solid ${styles.led}`,
        position: "relative",
        overflow: "hidden",
        pointerEvents: "auto"
      }}
    >
      {/* HUD Scanner lines effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.015) 2px, rgba(255, 255, 255, 0.015) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Title Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: styles.led,
              boxShadow: `0 0 8px ${styles.led}`,
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: styles.text, letterSpacing: "0.08em" }}>
            {category.toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
        <h4 style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#fff", letterSpacing: "-0.01em" }}>
          {title}
        </h4>
        <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.4 }}>
          {message}
        </p>
      </div>

      {/* Footer Diagnostic */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>
        <span>ENGINE: v2.0.26</span>
        <span>STATUS: ACTIVE_INTEGRATION</span>
      </div>
    </div>
  ), {
    duration: 4000,
  });
}
