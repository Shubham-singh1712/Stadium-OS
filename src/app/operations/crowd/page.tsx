"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { OperationalChart } from "@/components/ui/OperationalChart";
import { toast } from "sonner";

export default function CrowdIntelPage() {
  const crowd = useCortexStore((state) => state.crowd);
  const zones = useCortexStore((state) => state.zones);
  const startProtocol = useCortexStore((state) => state.startProtocol);
  const autoAssignStaff = useCortexStore((state) => state.autoAssignStaff);
  const broadcastEmergency = useCortexStore((state) => state.broadcastEmergency);


  const riskColor = crowd.riskScore > 70 ? "hsl(0,84%,60%)" : crowd.riskScore > 45 ? "hsl(42,95%,58%)" : "hsl(152,70%,50%)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Crowd Intelligence</h2>
        <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
          {crowd.prediction}
        </p>
      </div>

      {/* Risk Score Banner */}
      <div style={{
        padding: "1.5rem 2rem",
        borderRadius: "var(--radius-xl)",
        background: crowd.riskScore > 70 ? "hsl(0 84% 60% / 0.08)" : "hsl(42 95% 58% / 0.08)",
        border: `1px solid ${crowd.riskScore > 70 ? "hsl(0 84% 60% / 0.25)" : "hsl(42 95% 58% / 0.25)"}`,
        display: "flex", alignItems: "center", gap: "2rem",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", fontWeight: 900, color: riskColor, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {crowd.riskScore}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>Risk Score</div>
        </div>
        <div style={{ width: 1, height: "4rem", background: "hsl(var(--border))" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: riskColor, marginBottom: "0.375rem" }}>
            {crowd.riskLevel} Risk
          </div>
          <p style={{ fontSize: "0.9rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.6 }}>
            {crowd.prediction}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
            {crowd.hotspots.map((h) => (
              <span key={h} style={{
                padding: "0.25rem 0.625rem", borderRadius: "999px",
                background: "hsl(0 84% 60% / 0.12)", color: "hsl(0 84% 70%)",
                fontSize: "0.8125rem", fontWeight: 600,
                border: "1px solid hsl(0 84% 60% / 0.2)",
              }}>
                🔴 {h}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-danger" onClick={() => {
            broadcastEmergency();
          }}>
            🚨 Emergency Protocol
          </button>
          <button className="btn btn-primary" onClick={() => {
            startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
            toast.success("Initiating Crowd Redirection Review...");
          }}>
            ↔ Redirect Crowd
          </button>
        </div>
      </div>

      <CortexCard
        severity={crowd.riskScore > 70 ? "critical" : "warning"}
        title={`Crowd will peak at halftime in ~8 minutes`}
        insight={`Gate A and Food Court A are the primary hotspots. Cortex predicts a 23% surge in the next 10 minutes concentrated in the North and West sectors. Immediate deployment of 5 additional volunteers and opening Lane 4 at Gate A is recommended.`}
        actions={[
          {
            label: "Redirect Crowd →",
            variant: "primary",
            onClick: () => {
              startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
              toast.success("Initiating Crowd Redirection Review...");
            }
          },
          {
            label: "Assign Volunteers",
            variant: "success",
            onClick: () => {
              autoAssignStaff();
            }
          },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Density trend */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Density vs. Prediction</h3>
          <OperationalChart
            type="area"
            data={crowd.densityHistory}
            xKey="time"
            series={[
              { key: "density", color: "hsl(210,90%,60%)", name: "Actual %" },
              { key: "predicted", color: "hsl(0,84%,60%)", name: "Predicted %" }
            ]}
            height={220}
            ariaLabel="Crowd density breakdown chart"
          />
          <div className="sr-only">
            <h4>Density vs Prediction Trend Summary</h4>
            <p>Live crowd density matches predicted curves. Current occupancy rate is {crowd.occupancyRate}%.</p>
          </div>
        </div>

        {/* Zone occupancy */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Zone Occupancy</h3>
          <OperationalChart
            type="bar"
            data={zones.slice(0, 8).map(z => ({
              name: z.name.replace("Gate ", "G").replace("Food Court ", "FC").replace("Parking ", "P").replace("Restroom ", "R"),
              pct: Math.round((z.current / z.capacity) * 100),
              fill: z.status === "red" ? "hsl(0,84%,55%)" : z.status === "yellow" ? "hsl(42,95%,52%)" : "hsl(152,70%,45%)",
            }))}
            xKey="name"
            series={[
              { key: "pct", color: "hsl(152,70%,45%)", name: "Occupancy" }
            ]}
            height={220}
            ariaLabel="Gate flow rates chart"
          />
          <div className="sr-only">
            <h4>Zone Occupancy Summary</h4>
            <ul>
              {zones.slice(0, 8).map(z => (
                <li key={z.id}>{z.name}: {Math.round((z.current / z.capacity) * 100)}% ({z.status})</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
