"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { toast } from "sonner";

export default function SecurityAlertsPage() {
  const alerts = useCortexStore((state) => state.alerts);
  const acknowledgeAlert = useCortexStore((state) => state.acknowledgeAlert);
  const dismissAlert = useCortexStore((state) => state.dismissAlert);
  const addTimelineEvent = useCortexStore((state) => state.addTimelineEvent);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Alerts</h1>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            {alerts.filter(a => !a.acknowledged).length} unacknowledged
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => alerts.forEach(a => acknowledgeAlert(a.id))}>
          Acknowledge All
        </button>
      </div>

      <CortexCard
        severity="critical"
        title="2 critical alerts require immediate action"
        insight="Cortex AI has escalated Gate A congestion and Parking A overflow as critical. Both are projected to worsen in the next 10 minutes without intervention."
        actions={[
          {
            label: "Take Action",
            variant: "primary",
            onClick: () => {
              toast.success("AI actions dispatched successfully.");
              addTimelineEvent("Security", "AI dispatched response units to Gate A and Parking A.", "warning");
            }
          }
        ]}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-${alert.severity}`}
            style={{ padding: "1.25rem", borderRadius: "var(--radius-md)", opacity: alert.acknowledged ? 0.55 : 1 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{
                    fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 700,
                    padding: "0.2rem 0.5rem", borderRadius: "999px",
                    background: alert.severity === "critical" ? "hsl(0 84% 60% / 0.15)" : alert.severity === "warning" ? "hsl(42 95% 58% / 0.15)" : "hsl(210 90% 60% / 0.15)",
                    color: alert.severity === "critical" ? "hsl(0,84%,70%)" : alert.severity === "warning" ? "hsl(42,95%,68%)" : "hsl(210,90%,70%)",
                  }}>
                    {alert.severity}
                  </span>
                  {alert.acknowledged && <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>✓ Acknowledged</span>}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.375rem" }}>{alert.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.6 }}>{alert.message}</p>
                <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "0.5rem" }}>
                  📍 {alert.zone} · {alert.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="btn btn-ghost"
                    style={{ fontSize: "0.8125rem" }}
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  style={{ padding: "0.375rem 0.75rem", borderRadius: "var(--radius-sm)", background: "none", border: "1px solid hsl(var(--border))", cursor: "pointer", fontSize: "0.8125rem", color: "hsl(var(--foreground-subtle))" }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
