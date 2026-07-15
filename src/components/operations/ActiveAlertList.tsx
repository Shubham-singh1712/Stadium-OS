import { useCortexStore } from "@/stores/cortexStore";

interface AlertItem {
  id: string;
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  message: string;
  zone: string;
  acknowledged: boolean;
}

export function ActiveAlertList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Active Alerts</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", overflowY: "auto", maxHeight: "320px" }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-${alert.severity}`}
            style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-sm)", opacity: alert.acknowledged ? 0.55 : 1 }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{alert.title}</p>
                <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.5 }}>{alert.message}</p>
                <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "0.375rem" }}>
                  📍 {alert.zone}
                </p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => useCortexStore.getState().acknowledgeAlert(alert.id)}
                  style={{
                    padding: "0.25rem 0.625rem", borderRadius: "var(--radius-sm)",
                    background: "hsl(var(--border))", border: "none", cursor: "pointer",
                    fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", flexShrink: 0,
                  }}
                >
                  Ack
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
