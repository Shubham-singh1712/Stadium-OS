"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { useAuthStore } from "@/stores/authStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function FanPage() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const userName = user?.name ? user.name.split(" ")[0] : "Alex";
  const userSector = user?.sector ?? "Section 112, Row G, Seat 14";
  const seatSection = userSector.split(",")[0] || "Section 112";
  const seatDetails = userSector.split(",").slice(1).join(" · ") || "Row G · Seat 14 · Level 1";

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
        severity="warning"
        icon="⚽"
        title="Halftime in ~8 min — Act now to beat the rush"
        insight="Cortex AI recommends visiting the restroom in the next 5 minutes before the halftime rush. Food Court B currently has a 4-minute wait (vs. 18 minutes at Food Court A). Parking Lot A is nearly full — if you're driving, your exit route via Gate C is currently the fastest."
        actions={[
          { label: "Navigate to Restroom", variant: "primary", onClick: () => router.push("/fan/navigation?target=Restroom N&generate=true") },
          { label: "Check Food Queues", variant: "ghost", onClick: () => router.push("/fan/food") },
        ]}
      />



      {/* Tab Panel: Overview */}
      <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {/* Seat finder */}
          <div className="glass-card">
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>💺</div>
            <h3 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Your Seat</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "hsl(var(--accent-blue))", marginBottom: "0.5rem" }}>{seatSection}</p>
            <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", marginBottom: "0.75rem" }}>{seatDetails}</p>
            <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-subtle))", marginBottom: "1rem" }}>
              ✦ Nearest restroom: 45m north · Nearest food: Food Court B (200m east)
            </p>
            <Link href={`/fan/navigation?target=My Seat (${seatSection.replace("Section ", "")})&generate=true`} className="btn btn-primary" style={{ display: "flex", width: "100%", justifyContent: "center", textDecoration: "none" }}>
              Navigate Me →
            </Link>
          </div>

          {/* Match live */}
          <div className="glass-card" style={{ background: "hsl(210 90% 50% / 0.05)", border: "1px solid hsl(210 90% 60% / 0.2)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>⚽</div>
            <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Live Match</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem" }}>🇺🇸</div>
                <div style={{ fontWeight: 700 }}>USA</div>
              </div>
              <div style={{
                background: "hsl(var(--accent-green))", color: "black",
                padding: "0.5rem 1rem", borderRadius: "var(--radius-sm)",
                fontWeight: 800, fontSize: "1.5rem",
              }}>2 – 1</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem" }}>🇧🇷</div>
                <div style={{ fontWeight: 700 }}>BRA</div>
              </div>
            </div>
            <div style={{ textAlign: "center", color: "hsl(var(--foreground-muted))", fontSize: "0.875rem" }}>
              73′ · Semi-Final · FIFA World Cup 2026
            </div>
          </div>

          {/* Emergency SOS preview */}
          <div className="glass-card" style={{ background: "hsl(0 84% 60% / 0.04)", border: "1px solid hsl(0 84% 60% / 0.15)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>🆘</div>
            <h3 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Emergency</h3>
            <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Need urgent medical help, security, or want to report an altercation? Request immediate volunteer assistance.
            </p>
            <Link href="/fan/emergency" className="btn btn-danger" style={{ display: "flex", width: "100%", justifyContent: "center", textDecoration: "none" }}>
              Report / Request SOS
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
