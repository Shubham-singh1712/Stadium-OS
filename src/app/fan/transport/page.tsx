"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { useAuthStore } from "@/stores/authStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { TransportOption } from "@/types";
import { toast } from "sonner";

const TRANSPORT_ICONS: Record<TransportOption["type"], string> = {
  metro: "🚇", bus: "🚌", taxi: "🚕", shuttle: "🚐", walk: "🚶",
};

const CROWDING_LABELS: Record<string, string> = {
  green: "Low crowd", yellow: "Moderate", red: "Very busy",
};

export default function TransportPage() {
  const transport = useCortexStore((state) => state.transport);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const userName = user?.name ? user.name.split(" ")[0] : "Alex";
  const userSector = user?.sector ?? "Section 112, Row G, Seat 14";

  const recommendedTransport = transport.find((t) => t.recommended);

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
        icon="🚇"
        title={`Metro Line 2 recommended — departs in ${recommendedTransport?.departureIn ?? 4} min`}
        insight={`${recommendedTransport?.aiNote ?? "Best departure option based on current crowd projections."} Leave 10 minutes before the final whistle to beat the post-match surge at Metro East Station.`}
        actions={[
          { label: "Navigate to Metro →", variant: "primary", onClick: () => router.push("/fan/navigation?target=Metro East&generate=true") },
        ]}
      />



      {/* Transport Tab Panel */}
      <motion.div key="transport" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {transport.map((t) => (
            <motion.div
              key={t.id}
              className="glass-card"
              style={{
                border: t.recommended ? "1px solid hsl(152 70% 50% / 0.35)" : "1px solid var(--glass-border)",
                background: t.recommended ? "hsl(152 70% 50% / 0.05)" : "var(--glass-bg)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0,
                  background: "hsl(var(--surface-2))", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem",
                }}>
                  {TRANSPORT_ICONS[t.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{t.name}</h3>
                    {t.recommended && (
                      <span style={{
                        fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
                        padding: "0.2rem 0.5rem", borderRadius: "999px",
                        background: "hsl(152 70% 50% / 0.15)", color: "hsl(152,70%,60%)",
                        border: "1px solid hsl(152 70% 50% / 0.3)",
                      }}>
                        ✦ AI Recommended
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1.25rem", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>Departs in</span>
                      <div style={{ fontWeight: 700, color: t.departureIn <= 5 ? "hsl(var(--accent-green))" : "hsl(var(--foreground))" }}>
                        {t.departureIn} min
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>Journey</span>
                      <div style={{ fontWeight: 700 }}>{t.duration} min</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>Crowding</span>
                      <div style={{ fontWeight: 700, color: t.crowding === "green" ? "hsl(152,70%,55%)" : t.crowding === "yellow" ? "hsl(42,95%,65%)" : "hsl(0,84%,65%)" }}>
                        {CROWDING_LABELS[t.crowding]}
                      </div>
                    </div>
                  </div>
                  {t.aiNote && (
                    <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-subtle))", lineHeight: 1.5 }}>✦ {t.aiNote}</p>
                  )}
                </div>
                <button
                  className={t.recommended ? "btn btn-success" : "btn btn-ghost"}
                  style={{ flexShrink: 0, alignSelf: "center" }}
                  onClick={() => toast.success(`Navigating to ${t.name} departure zone...`)}
                >
                  Go →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
