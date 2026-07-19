"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { OperationalChart } from "@/components/ui/OperationalChart";
import { motion } from "framer-motion";

export default function VendorsPage() {
  const vendors = useCortexStore((state) => state.vendors);
  const openKiosk4B = useCortexStore((state) => state.openKiosk4B);
  const preStageConcessions = useCortexStore((state) => state.preStageConcessions);

  const revenueData = vendors.map((v) => ({ name: v.name.split(" ")[0], revenue: v.revenue, queue: v.queueLength }));
  const totalRevenue = vendors.reduce((s, v) => s + v.revenue, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Vendor Analytics</h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            Total revenue: <span style={{ color: "hsl(var(--accent-green))", fontWeight: 700 }}>${(totalRevenue / 1000).toFixed(1)}K</span> · {vendors.length} active vendors
          </p>
        </div>
      </div>

      <CortexCard
        severity="info"
        icon="🏪"
        title="FIFA Grill and World Cup Brews need immediate support"
        insight="Both vendors in Food Court A are running at 62-70% efficiency with 18-minute wait times. Halftime rush in ~8 minutes will push queues to 50+ people. Cortex recommends pre-staging inventory now and opening adjacent kiosk space."
        actions={[
          {
            label: "Open Kiosk 4B",
            variant: "primary",
            onClick: () => {
              openKiosk4B();
            }
          },
          {
            label: "Pre-Stage Inventory",
            variant: "ghost",
            onClick: () => {
              preStageConcessions();
            }
          },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Revenue by Vendor ($)</h3>
          <div className="sr-only">
            <h4>Revenue by Vendor Summary</h4>
            <ul>
              {revenueData.map(v => (
                <li key={v.name}>{v.name}: ${v.revenue.toLocaleString()}</li>
              ))}
            </ul>
          </div>
          <OperationalChart
            type="bar"
            data={revenueData}
            xKey="name"
            series={[{ key: "revenue", color: "hsl(152,70%,45%)", name: "Revenue" }]}
            height={220}
            ariaLabel="Vendor queues and wait times chart"
          />
        </div>

        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Queue Length (people)</h3>
          <div className="sr-only">
            <h4>Queue Length Summary</h4>
            <ul>
              {revenueData.map(v => (
                <li key={v.name}>{v.name}: {v.queue} people</li>
              ))}
            </ul>
          </div>
          <OperationalChart
            type="bar"
            data={revenueData}
            xKey="name"
            series={[{ key: "queue", color: "hsl(210,90%,55%)", name: "Queue" }]}
            height={220}
            ariaLabel="Vendor revenue and efficiency chart"
          />
        </div>
      </div>

      {/* Vendor cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {vendors.map((v) => (
          <motion.div key={v.id} className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{v.name}</h3>
                <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-subtle))" }}>{v.zone}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "hsl(var(--accent-green))" }}>${(v.revenue / 1000).toFixed(1)}K</div>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>revenue</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.625rem", marginBottom: "1rem" }}>
              {[
                { label: "Queue", value: v.queueLength, unit: "ppl" },
                { label: "Wait", value: v.waitMinutes, unit: "min" },
                { label: "Efficiency", value: `${v.efficiency}%`, unit: "" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  padding: "0.625rem", borderRadius: "var(--radius-sm)",
                  background: "hsl(var(--surface-2))", textAlign: "center",
                }}>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>{stat.value}<span style={{ fontSize: "0.75rem", fontWeight: 400 }}>{stat.unit}</span></div>
                  <div style={{ fontSize: "0.6875rem", color: "hsl(var(--foreground-subtle))" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${v.efficiency}%`, background: v.efficiency > 80 ? "hsl(152,70%,50%)" : v.efficiency > 60 ? "hsl(42,95%,58%)" : "hsl(0,84%,60%)" }} />
            </div>

            {v.predictedRush && (
              <p style={{ fontSize: "0.75rem", color: "hsl(42,95%,68%)", marginTop: "0.75rem" }}>
                ⚠ Rush predicted: {v.predictedRush}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
