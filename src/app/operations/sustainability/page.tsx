"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { useVolunteerStore } from "@/stores/volunteerStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { OperationalChart } from "@/components/ui/OperationalChart";
import { motion } from "framer-motion";

export default function SustainabilityPage() {
  const s = useCortexStore((state) => state.sustainability);
  const activateGreenMenu = useCortexStore((state) => state.activateGreenMenu);
  const dimArenaLights = useCortexStore((state) => state.dimArenaLights);
  const rerouteShuttles = useCortexStore((state) => state.rerouteShuttles);
  const dispatchWasteSort = useCortexStore((state) => state.dispatchWasteSort);

  const tasks = useVolunteerStore((state) => state.tasks);
  const isWasteDispatched = tasks.some((t) => t.title === "Deploy Waste Sorting Chevrons");
  const isWasteCompleted = tasks.some((t) => t.title === "Deploy Waste Sorting Chevrons" && t.status === "completed");

  const activeOptimizations = [];
  if (s.greenMenuActivated) activeOptimizations.push("Green Menu Active (-2.1t CO₂)");
  if (s.lightingDimmed) activeOptimizations.push("Corridor Lighting Dimmed (-180 kWh)");
  if (s.shuttlesRerouted) activeOptimizations.push("Express Shuttle Rerouting (+3% Transit)");

  const dynamicInsight = activeOptimizations.length > 0
    ? `Active Protocols: ${activeOptimizations.join(" · ")}. Current public transport adoption is at ${s.publicTransportPercent}%. Renewable energy is at ${s.energyRenewablePercent}%. Operations dashboard, volunteer tasks, and fan menus have been synchronized.`
    : `Cortex AI analysis: Public transport adoption at ${s.publicTransportPercent}% (target: 60%) is driving strong carbon results. Renewable energy at ${s.energyRenewablePercent}% exceeds the 70% target. Recommendation: Activate vegetable-only kiosks at Food Court B and reduce arena lighting by 8% — estimated combined saving of 2.1t CO₂.`;

  const dynamicTitle = activeOptimizations.length > 0
    ? `Cortex optimization protocols active (${activeOptimizations.length}/3)`
    : "Stadium on track to beat carbon target by 14%";

  const metrics = [
    { label: "Carbon Footprint", value: `${(s.carbonKg / 1000).toFixed(1)}t`, target: `${(s.carbonTarget / 1000).toFixed(0)}t target`, pct: Math.round((s.carbonKg / s.carbonTarget) * 100), color: s.carbonKg < s.carbonTarget * 0.8 ? "hsl(152,70%,50%)" : "hsl(42,95%,58%)", icon: "🌍" },
    { label: "Waste Recycled", value: `${s.wasteRecycledPercent}%`, target: `${s.wasteKg}kg generated`, pct: s.wasteRecycledPercent, color: "hsl(152,70%,50%)", icon: "♻️" },
    { label: "Renewable Energy", value: `${s.energyRenewablePercent}%`, target: `${(s.energyKwh / 1000).toFixed(0)} MWh total`, pct: s.energyRenewablePercent, color: "hsl(210,90%,60%)", icon: "⚡" },
    { label: "Public Transport", value: `${s.publicTransportPercent}%`, target: "of all attendees", pct: s.publicTransportPercent, color: "hsl(265,70%,65%)", icon: "🚌" },
  ];

  const radarData = [
    { subject: "Carbon", value: 100 - Math.round((s.carbonKg / s.carbonTarget) * 100) },
    { subject: "Waste", value: s.wasteRecycledPercent },
    { subject: "Energy", value: s.energyRenewablePercent },
    { subject: "Transport", value: s.publicTransportPercent },
    { subject: "Walking", value: 82 },
    { subject: "Water", value: 70 },
  ];

  const trendData = Array.from({ length: 10 }, (_, i) => ({
    hour: `${12 + i}:00`,
    carbon: Math.round(s.carbonKg * (0.6 + i * 0.04) / 1000 * 10) / 10,
    waste: Math.round(s.wasteKg * (0.5 + i * 0.05)),
    energy: Math.round(s.energyKwh * (0.55 + i * 0.045)),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Sustainability Center</h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>AI Score: {s.aiScore}/100 · Trend: {s.trend === "improving" ? "📈 Improving" : s.trend === "neutral" ? "➡ Stable" : "📉 Worsening"}</p>
        </div>
        <div style={{
          padding: "1rem 1.5rem", borderRadius: "var(--radius-lg)",
          background: "hsl(152 70% 50% / 0.1)", border: "1px solid hsl(152 70% 50% / 0.25)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "hsl(152,70%,55%)", lineHeight: 1 }}>{s.aiScore}</div>
          <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", marginTop: "0.25rem" }}>AI Eco Score</div>
        </div>
      </div>

      {/* Cortex AI Insight */}
      <CortexCard
        severity={activeOptimizations.length > 0 ? "info" : "success"}
        icon="🌱"
        title={dynamicTitle}
        insight={dynamicInsight}
        actions={[
          { 
            label: s.greenMenuActivated ? "Green Menu Active" : "Activate Green Menu", 
            variant: "success", 
            onClick: () => {
              if (!s.greenMenuActivated) activateGreenMenu();
            }
          },
          { 
            label: s.lightingDimmed ? "Lights Dimmed" : "Dim Arena Lights 8%", 
            variant: "ghost", 
            onClick: () => {
              if (!s.lightingDimmed) dimArenaLights();
            } 
          },
        ]}
      />

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>{m.label}</span>
              <span style={{ fontSize: "1.25rem" }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: "1.875rem", fontWeight: 800, color: m.color, letterSpacing: "-0.03em", marginBottom: "0.375rem" }}>
              {m.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginBottom: "0.75rem" }}>{m.target}</div>
            <div className="progress-bar-track">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${m.pct}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{ background: m.color }}
              />
            </div>
            <div style={{ textAlign: "right", fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "0.25rem" }}>{m.pct}%</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Carbon trend */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Carbon Footprint Trend (tons)</h3>
          <OperationalChart
            type="area"
            data={trendData}
            xKey="hour"
            series={[{ key: "carbon", color: "hsl(152,70%,50%)", name: "CO₂ (t)" }]}
            height={200}
            ariaLabel="Energy consumption and carbon footprint chart"
          />
          <div className="sr-only">
            <h4>Carbon Footprint Trend Summary</h4>
            <p>Carbon footprint has decreased from 12.2 tons at 18:00 to 8.4 tons at 21:00.</p>
          </div>
        </div>

        {/* Radar */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Eco Performance Radar</h3>
          <ResponsiveContainer width="100%" height={200} role="img" aria-label="Sustainability metrics radar chart">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(215 20% 20%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(215 15% 50%)" }} />
              <Radar name="Score" dataKey="value" stroke="hsl(152,70%,50%)" fill="hsl(152,70%,50%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="sr-only">
            <h4>Eco Performance Summary</h4>
            <ul>
              <li>Carbon Score: 84 out of 100</li>
              <li>Waste Score: 68 out of 100</li>
              <li>Energy Score: 74 out of 100</li>
              <li>Transport Score: 62 out of 100</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>⚡ AI Sustainability Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.875rem" }}>
          {[
            { title: "Green Food Menu", desc: "Activate at Food Court B — est. -2.1t CO₂", impact: "−14% Carbon", icon: "🥗", action: "Activate" },
            { title: "Smart Lighting", desc: "Reduce corridor lighting by 12% in Sector C", impact: "−180 kWh", icon: "💡", action: "Apply" },
            { title: "Shuttle Routing", desc: "Reroute 3 buses via shorter path to reduce emissions", impact: "−0.4t CO₂", icon: "🚌", action: "Reroute" },
            { title: "Waste Sort Alert", desc: "Dispatch volunteers to bin stations in Section D", impact: "+8% Recycling", icon: "♻️", action: "Dispatch" },
          ].map((rec) => {
            const done =
              rec.action === "Activate" ? s.greenMenuActivated :
              rec.action === "Apply"    ? s.lightingDimmed :
              rec.action === "Reroute"  ? s.shuttlesRerouted :
              isWasteDispatched;

            const handleClick = () => {
              if (done) return;
              if (rec.action === "Activate") activateGreenMenu();
              else if (rec.action === "Apply") dimArenaLights();
              else if (rec.action === "Reroute") rerouteShuttles();
              else if (rec.action === "Dispatch") dispatchWasteSort();
            };

            const buttonLabel =
              rec.action === "Activate" ? (s.greenMenuActivated ? "Active"    : "Activate") :
              rec.action === "Apply"    ? (s.lightingDimmed     ? "Applied"   : "Apply")    :
              rec.action === "Reroute"  ? (s.shuttlesRerouted   ? "Rerouted"  : "Reroute")  :
              (isWasteCompleted ? "Completed" : isWasteDispatched ? "Dispatched" : "Dispatch");

            return (
              <div key={rec.title} className="sus-rec-card">
                <div className="sus-rec-header">
                  <span style={{ fontSize: "1.25rem" }}>{rec.icon}</span>
                  <span className="sus-rec-title">{rec.title}</span>
                </div>
                <p className="sus-rec-desc">{rec.desc}</p>
                <div className="sus-rec-footer">
                  <span className="sus-rec-impact">{rec.impact}</span>
                  <button
                    className="btn btn-success btn-sus-action"
                    disabled={!!done}
                    onClick={handleClick}
                    style={{ opacity: done ? 0.6 : 1, cursor: done ? "not-allowed" : "pointer" }}
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
