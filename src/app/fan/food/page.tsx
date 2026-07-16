"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { useAuthStore } from "@/stores/authStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function FoodPage() {
  const zones = useCortexStore((state) => state.zones);
  const vendors = useCortexStore((state) => state.vendors);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const userName = user?.name ? user.name.split(" ")[0] : "Alex";
  const userSector = user?.sector ?? "Section 112, Row G, Seat 14";

  const foodZones = zones.filter((z) => z.type === "food_court");
  const restroomZones = zones.filter((z) => z.type === "restroom");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Welcome, {userName}!</h2>
        <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
          Your seat: {userSector} · USA 🇺🇸 vs BRA 🇧🇷 · 73′
        </p>
      </div>

      {/* Top CortexCard */}
      <CortexCard
        severity="success"
        icon="🍔"
        title="Food Court B recommended — 4 min wait vs. 18 min at Court A"
        insight="Based on current queue lengths and predicted halftime rush, Food Court B has the shortest wait. If you leave now (pre-halftime), you'll arrive and be served before the major rush hits in ~8 minutes."
        actions={[
          { label: "Navigate to Food Court B", variant: "primary", onClick: () => router.push("/fan/navigation?target=Food Court B&generate=true") },
        ]}
      />



      {/* Food list and restrooms */}
      <motion.div key="food" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {foodZones.map((zone) => {
            const vendor = vendors.find((v) => v.zone === zone.name);
            const pct = Math.round((zone.current / zone.capacity) * 100);
            return (
              <div key={zone.id} className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{zone.name}</h3>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.375rem" }}>
                      <span style={{
                        fontSize: "0.8125rem", fontWeight: 600,
                        color: zone.status === "green" ? "hsl(152,70%,55%)" : zone.status === "yellow" ? "hsl(42,95%,65%)" : "hsl(0,84%,65%)",
                      }}>
                        {zone.status === "green" ? "🟢 Low wait" : zone.status === "yellow" ? "🟡 Moderate" : "🔴 Long wait"}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: zone.status === "green" ? "hsl(152,70%,55%)" : zone.status === "yellow" ? "hsl(42,95%,65%)" : "hsl(0,84%,65%)" }}>
                      {vendor?.waitMinutes ?? "?"}<span style={{ fontSize: "0.875rem", fontWeight: 400 }}> min</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>wait time</div>
                  </div>
                </div>

                <div className="progress-bar-track" style={{ marginBottom: "0.5rem" }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: zone.status === "green" ? "hsl(152,70%,50%)" : zone.status === "yellow" ? "hsl(42,95%,52%)" : "hsl(0,84%,55%)" }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginBottom: "0.75rem" }}>
                  {zone.current} / {zone.capacity} people · Queue: {zone.queueLength ?? "N/A"} people
                </p>

                {vendor && (
                  <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>
                    Popular: {vendor.popularItems.join(", ")}
                  </p>
                )}

                {zone.predictedPeak && (
                  <p style={{ fontSize: "0.75rem", color: "hsl(42,95%,68%)", marginTop: "0.5rem" }}>
                    ⚡ AI: Queue will triple in ~{zone.predictedPeak} min
                  </p>
                )}

                <Link
                  href={`/fan/navigation?target=${zone.name}&generate=true`}
                  className="btn btn-primary"
                  style={{ display: "inline-flex", marginTop: "0.875rem", textDecoration: "none" }}
                >
                  Navigate Here →
                </Link>
              </div>
            );
          })}

          {/* Restrooms */}
          <h3 style={{ fontWeight: 600, marginTop: "0.5rem" }}>🚻 Restroom Availability</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {restroomZones.map((zone) => {
              const pct = Math.round((zone.current / zone.capacity) * 100);
              return (
                <div key={zone.id} className="glass-card">
                  <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{zone.name}</h4>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: zone.status === "green" ? "hsl(152,70%,55%)" : "hsl(0,84%,60%)", marginBottom: "0.375rem" }}>
                    {zone.status === "green" ? "Available" : "Busy"}
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-subtle))", marginBottom: "0.75rem" }}>
                    Queue: {zone.queueLength ?? 0} people
                  </p>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: zone.status === "green" ? "hsl(152,70%,50%)" : "hsl(0,84%,55%)" }} />
                  </div>
                  <Link href={`/fan/navigation?target=${zone.name}&generate=true`} className="btn btn-ghost" style={{ display: "inline-flex", marginTop: "0.75rem", fontSize: "0.8125rem", textDecoration: "none" }}>
                    Navigate →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
