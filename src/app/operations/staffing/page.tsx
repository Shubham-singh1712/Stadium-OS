"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

const STAFF_DATA = [
  { role: "Volunteers", deployed: 142, needed: 165, available: 23 },
  { role: "Security", deployed: 88, needed: 90, available: 2 },
  { role: "Medics", deployed: 24, needed: 28, available: 4 },
  { role: "Cleaners", deployed: 56, needed: 70, available: 14 },
  { role: "Operations", deployed: 31, needed: 35, available: 4 },
];

const SECTOR_GAPS = [
  { sector: "Gate A", staffed: 4, needed: 8, gap: 4 },
  { sector: "Food Court A", staffed: 6, needed: 9, gap: 3 },
  { sector: "Parking A", staffed: 3, needed: 5, gap: 2 },
  { sector: "Gate D", staffed: 6, needed: 7, gap: 1 },
  { sector: "Medical Bay 2", staffed: 4, needed: 4, gap: 0 },
  { sector: "Food Court B", staffed: 4, needed: 4, gap: 0 },
];

export default function StaffingPage() {
  const addTimelineEvent = useCortexStore((state) => state.addTimelineEvent);
  const autoAssignStaff = useCortexStore((state) => state.autoAssignStaff);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Staffing Optimizer</h1>
        <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
          AI-driven staff allocation across all stadium sectors
        </p>
      </div>

      <CortexCard
        severity="warning"
        icon="👥"
        title="23 unfilled positions — Gate A and Food Court A most critical"
        insight="Cortex AI analysis: Current staffing leaves Gate A 50% understaffed and Food Court A 33% understaffed. Halftime in ~8 minutes will amplify these gaps. Recommending immediate redeployment of 4 cleaners from low-traffic Sector E to Gate A and Food Court A."
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
              toast.success('Supervisors notified of staffing gaps.');
              addTimelineEvent("staffing", "Supervisors notified of pending shortages", "info");
            } 
          },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Staff by role */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Deployment by Role</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {STAFF_DATA.map((s) => {
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
                  <div style={{ textAlign: "right", fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "0.25rem" }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector gaps chart */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Staffing Gaps by Sector</h3>
          <div className="sr-only">
            <h4>Staffing Gaps by Sector Summary</h4>
            <ul>
              {SECTOR_GAPS.map(s => (
                <li key={s.sector}>{s.sector}: {s.staffed} staffed, need {s.needed} (gap: {s.gap})</li>
              ))}
            </ul>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={SECTOR_GAPS} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 10, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="staffed" name="Staffed" fill="hsl(210,90%,55%)" radius={[0,4,4,0]} stackId="a" />
              <Bar dataKey="gap" name="Gap" fill="hsl(0,84%,55%)" radius={[0,4,4,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector action cards */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Priority Deployments</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.875rem" }}>
          {SECTOR_GAPS.filter(s => s.gap > 0).map((sector) => (
            <div key={sector.sector} style={{
              padding: "1rem", borderRadius: "var(--radius-md)",
              background: sector.gap >= 4 ? "hsl(0 84% 60% / 0.07)" : sector.gap >= 2 ? "hsl(42 95% 58% / 0.07)" : "hsl(210 90% 60% / 0.07)",
              border: `1px solid ${sector.gap >= 4 ? "hsl(0 84% 60% / 0.2)" : sector.gap >= 2 ? "hsl(42 95% 58% / 0.2)" : "hsl(210 90% 60% / 0.2)"}`,
            }}>
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
                {sector.staffed} deployed / {sector.needed} needed
              </p>
              <button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", fontSize: "0.8125rem" }}
                onClick={() => {
                  toast.promise(new Promise(res => setTimeout(res, 1000)), {
                    loading: `Assigning ${sector.gap} staff to ${sector.sector}...`,
                    success: () => {
                      addTimelineEvent("staffing", `Deployed ${sector.gap} additional staff to ${sector.sector}`, "info");
                      return `Deployment successful`;
                    },
                    error: 'Deployment failed',
                  });
                }}
              >
                Assign {sector.gap} Staff
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
