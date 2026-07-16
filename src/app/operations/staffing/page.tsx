"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

// Static role breakdown (does not change with zone data but reflects overall composition)
const STAFF_ROLES = [
  { role: "Volunteers", needed: 165 },
  { role: "Security", needed: 90 },
  { role: "Medics", needed: 28 },
  { role: "Cleaners", needed: 70 },
  { role: "Operations", needed: 35 },
];

export default function StaffingPage() {
  const addTimelineEvent = useCortexStore((state) => state.addTimelineEvent);
  const autoAssignStaff = useCortexStore((state) => state.autoAssignStaff);
  const zones = useCortexStore((state) => state.zones);

  // ── Derive live sector gaps from store zones ──────────────────────────────
  const GATE_CAPACITY_TO_STAFF_RATIO = 250; // 1 staff per 250 capacity units
  const sectorGaps = zones
    .filter((z) => ["gate", "food_court", "parking", "medical"].includes(z.type))
    .slice(0, 8)
    .map((z) => {
      const needed = Math.max(2, Math.ceil(z.capacity / GATE_CAPACITY_TO_STAFF_RATIO));
      const occupancyPct = (z.current / z.capacity) * 100;
      // Higher occupancy → fewer staff available relative to need
      const staffed = Math.max(1, Math.round(needed * (occupancyPct > 80 ? 0.5 : occupancyPct > 60 ? 0.7 : 0.9)));
      const gap = Math.max(0, needed - staffed);
      return {
        sector: z.name,
        staffed,
        needed,
        gap,
        status: z.status,
      };
    });

  const totalGap = sectorGaps.reduce((s, z) => s + z.gap, 0);
  const criticalSectors = sectorGaps.filter((z) => z.gap >= 2).map((z) => z.sector).join(", ");

  // ── Staff roles with live occupancy context ──────────────────────────────
  const totalOccupancy = zones.reduce((s, z) => s + z.current, 0);
  const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);
  const occupancyFactor = totalCapacity > 0 ? totalOccupancy / totalCapacity : 0.9;

  const staffData = STAFF_ROLES.map((r) => {
    const deployed = Math.round(r.needed * (occupancyFactor * 0.85));
    return { ...r, deployed, available: Math.max(0, r.needed - deployed) };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Staffing Optimizer</h1>
        <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
          AI-driven staff allocation across all stadium sectors · Live data from {zones.length} zones
        </p>
      </div>

      <CortexCard
        severity="warning"
        icon="👥"
        title={`${totalGap} unfilled positions — ${criticalSectors || "all sectors nominal"}`}
        insight={`Cortex AI analysis: Live zone telemetry shows ${totalGap} staffing gaps across ${sectorGaps.filter(z => z.gap > 0).length} sectors. Current stadium occupancy at ${Math.round(occupancyFactor * 100)}% is driving demand. Recommending immediate redeployment of available staff from low-traffic zones to critical sectors.`}
        actions={[
          {
            label: "Auto-Assign Gaps",
            variant: "primary",
            onClick: () => {
              autoAssignStaff();
            }
          },
          {
            label: "Notify Supervisors",
            variant: "ghost",
            onClick: () => {
              toast.success("Supervisors notified of staffing gaps.");
              addTimelineEvent("staffing", "Supervisors notified of pending shortages", "info");
            }
          },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Staff by role */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Deployment by Role</h3>
          <div className="sr-only">
            <h4>Staff Deployment by Role Summary</h4>
            <ul>
              {staffData.map(s => (
                <li key={s.role}>{s.role}: {s.deployed} deployed of {s.needed} needed ({s.available} available)</li>
              ))}
            </ul>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {staffData.map((s) => {
              const pct = Math.round((s.deployed / s.needed) * 100);
              return (
                <div key={s.role}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                    <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{s.role}</span>
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8125rem" }}>
                      <span style={{ color: "hsl(var(--foreground-muted))" }}>{s.deployed}/{s.needed}</span>
                      <span style={{ color: s.available < 5 ? "hsl(var(--accent-red))" : "hsl(var(--accent-green))", fontWeight: 600 }}>
                        {s.available > 0 ? `+${s.available} avail` : "Fully deployed"}
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar-track">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ background: pct >= 90 ? "hsl(152,70%,50%)" : pct >= 70 ? "hsl(42,95%,58%)" : "hsl(0,84%,60%)" }}
                    />
                  </div>
                  <div className="staffing-pct-label">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live sector gaps chart from store */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Live Staffing Gaps by Sector</h3>
          <div className="sr-only">
            <h4>Live Staffing Gaps Summary</h4>
            <ul>
              {sectorGaps.map(s => (
                <li key={s.sector}>{s.sector}: {s.staffed} staffed, need {s.needed} (gap: {s.gap})</li>
              ))}
            </ul>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sectorGaps} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 10, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="staffed" name="Staffed" fill="hsl(210,90%,55%)" radius={[0, 4, 4, 0]} stackId="a" />
              <Bar dataKey="gap" name="Gap" fill="hsl(0,84%,55%)" radius={[0, 4, 4, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority deployment cards — live from store */}
      {sectorGaps.filter((s) => s.gap > 0).length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Priority Deployments</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.875rem" }}>
            {sectorGaps.filter((s) => s.gap > 0).map((sector) => (
              <div
                key={sector.sector}
                style={{
                  padding: "1rem", borderRadius: "var(--radius-md)",
                  background: sector.gap >= 4 ? "hsl(0 84% 60% / 0.07)" : sector.gap >= 2 ? "hsl(42 95% 58% / 0.07)" : "hsl(210 90% 60% / 0.07)",
                  border: `1px solid ${sector.gap >= 4 ? "hsl(0 84% 60% / 0.2)" : sector.gap >= 2 ? "hsl(42 95% 58% / 0.2)" : "hsl(210 90% 60% / 0.2)"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600 }}>{sector.sector}</span>
                  <span style={{
                    padding: "0.2rem 0.5rem", borderRadius: "999px",
                    background: sector.gap >= 4 ? "hsl(0 84% 60% / 0.15)" : "hsl(42 95% 58% / 0.15)",
                    color: sector.gap >= 4 ? "hsl(0,84%,70%)" : "hsl(42,95%,68%)",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    -{sector.gap} staff
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", marginBottom: "0.75rem" }}>
                  {sector.staffed} deployed / {sector.needed} needed · Zone status: {sector.status.toUpperCase()}
                </p>
                <button
                  className="btn btn-primary"
                  aria-label={`Assign ${sector.gap} staff to ${sector.sector}`}
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.8125rem" }}
                  onClick={() => {
                    toast.promise(new Promise(res => setTimeout(res, 1000)), {
                      loading: `Assigning ${sector.gap} staff to ${sector.sector}...`,
                      success: () => {
                        addTimelineEvent("staffing", `Deployed ${sector.gap} additional staff to ${sector.sector}`, "info");
                        return `Deployment successful`;
                      },
                      error: "Deployment failed",
                    });
                  }}
                >
                  Assign {sector.gap} Staff
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
