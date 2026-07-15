import { MetricCard } from "@/components/ui/MetricCard";
import type { CrowdIntelligence, Alert, VendorMetrics, SustainabilityMetrics } from "@/types";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function OperationsKPIs({
  crowd,
  alerts,
  vendors,
  sustainability,
}: {
  crowd: CrowdIntelligence;
  alerts: Alert[];
  vendors: VendorMetrics[];
  sustainability: SustainabilityMetrics;
}) {
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
  const totalRevenue = vendors.reduce((sum, v) => sum + v.revenue, 0);

  return (
    <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
      <MetricCard label="Attendance" value={crowd.totalAttendance} unit="" icon="🏟️" color="hsl(var(--accent-blue))" progress={(crowd.totalAttendance / crowd.capacity) * 100} subtitle={`${crowd.capacity.toLocaleString()} capacity`} />
      <MetricCard label="Occupancy Rate" value={`${crowd.occupancyRate}%`} icon="📊" color="hsl(var(--accent-green))" subtitle="Stadium-wide average" />
      <MetricCard label="Risk Score" value={crowd.riskScore} unit="/100" icon="⚠️" color={crowd.riskScore > 70 ? "hsl(var(--accent-red))" : crowd.riskScore > 45 ? "hsl(var(--accent-yellow))" : "hsl(var(--accent-green))"} subtitle={crowd.riskLevel + " risk level"} />
      <MetricCard label="Active Alerts" value={activeAlerts} icon="🚨" color={activeAlerts > 2 ? "hsl(var(--accent-red))" : "hsl(var(--accent-yellow))"} subtitle={`${alerts.length - activeAlerts} acknowledged`} />
      <MetricCard label="Revenue Today" value={`$${(totalRevenue / 1000).toFixed(0)}K`} icon="💰" color="hsl(var(--accent-green))" delta={12} deltaLabel="vs. last match" />
      <MetricCard label="AI Score" value={sustainability.aiScore} unit="/100" icon="🌱" color="hsl(152 70% 50%)" subtitle="Sustainability rating" progress={sustainability.aiScore} progressColor="hsl(152 70% 50%)" />
    </motion.div>
  );
}
