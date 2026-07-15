"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function VendorsPage() {
  const vendors = useCortexStore((state) => state.vendors);
  const addTimelineEvent = useCortexStore((state) => state.addTimelineEvent);

  const revenueData = vendors.map((v) => ({ name: v.name.split(" ")[0], revenue: v.revenue, queue: v.queueLength }));
  const totalRevenue = vendors.reduce((s, v) => s + v.revenue, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Vendor Analytics</h1>
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
              toast.success("Kiosk 4B activated.");
              addTimelineEvent("Facility", "Vendor Operations activated adjacent Kiosk 4B at Food Court A.", "info");
            }
          },
          {
            label: "Pre-Stage Inventory",
            variant: "ghost",
            onClick: () => {
              toast.success("Inventory alert sent to kitchen.");
              addTimelineEvent("Facility", "Inventory pre-stage signal broadcasted to concessions kitchens.", "info");
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="hsl(152,70%,45%)" radius={[4,4,0,0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} people`, "Queue"]} />
              <Bar dataKey="queue" fill="hsl(210,90%,55%)" radius={[4,4,0,0]} name="Queue" />
            </BarChart>
          </ResponsiveContainer>
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
