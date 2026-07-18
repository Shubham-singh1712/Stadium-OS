"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { useAuthStore } from "@/stores/authStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import dynamic from "next/dynamic";
const StadiumMap = dynamic(() => import("@/components/stadium/StadiumMap").then((m) => m.StadiumMap), {
  ssr: false,
  loading: () => <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-md)", color: "hsl(var(--foreground-muted))" }}>Loading Map...</div>,
});
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";

const BASE_DESTINATIONS = [
  { label: "Gate A",            icon: "🚪", crowd: 92, crowdColor: "hsl(0,84%,60%)"   },
  { label: "Gate C",            icon: "🚪", crowd: 30, crowdColor: "hsl(152,70%,50%)" },
  { label: "Food Court B",      icon: "🍔", crowd: 45, crowdColor: "hsl(42,90%,60%)"  },
  { label: "Restroom N",        icon: "🚻", crowd: 20, crowdColor: "hsl(152,70%,50%)" },
  { label: "Medical Bay 1",     icon: "⚕️", crowd: 10, crowdColor: "hsl(152,70%,50%)" },
  { label: "Parking C",         icon: "🅿️", crowd: 60, crowdColor: "hsl(42,90%,60%)"  },
  { label: "My Seat (112-G-14)",icon: "💺", crowd: 0,  crowdColor: "hsl(152,70%,50%)" },
  { label: "Metro East",        icon: "🚇", crowd: 35, crowdColor: "hsl(152,70%,50%)" },
];

function NavigationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zones = useCortexStore((state) => state.zones);
  const user = useAuthStore((state) => state.user);

  const userName = user?.name ? user.name.split(" ")[0] : "Alex";
  const userSector = user?.sector ?? "Section 112, Row G, Seat 14";

  const [navTarget, setNavTarget] = useState("Gate A");
  const [routeGenerated, setRouteGenerated] = useState(false);

  // Check if redirection protocol is active in the store zones history
  const gateAZone = zones.find(z => z.id === "gate-a");
  const isRedirectActive = gateAZone?.actionHistory?.some(h => h.action.toLowerCase().includes("delta-2") || h.action.toLowerCase().includes("rerout"));

  useEffect(() => {
    const target = searchParams.get("target");
    const generate = searchParams.get("generate");
    if (target) setNavTarget(target);
    if (generate === "true") setRouteGenerated(true);
  }, [searchParams]);

  // If user tries to navigate to Gate A but redirect is active, steer them to Gate C
  useEffect(() => {
    if (isRedirectActive && navTarget === "Gate A") {
      setNavTarget("Gate C");
    }
  }, [isRedirectActive, navTarget]);

  const selectDestination = (dest: string) => {
    if (isRedirectActive && dest === "Gate A") {
      setNavTarget("Gate C");
    } else {
      setNavTarget(dest);
    }
    setRouteGenerated(true);
  };

  // Map store metrics into destinations list dynamically
  const getLiveZoneInfo = (label: string) => {
    const zone = zones.find(z => 
      z.name.toLowerCase() === label.toLowerCase() || 
      z.id.toLowerCase() === label.toLowerCase() ||
      (label === "Restroom N" && z.id === "rest-north") ||
      (label === "Parking C" && z.id === "park-c") ||
      (label === "Metro East" && z.id === "gate-d") // map Metro Exit to Gate D for mock
    );
    if (!zone) return null;
    
    const pct = Math.round((zone.current / zone.capacity) * 100);
    const color = zone.status === "red" 
      ? "hsl(0,84%,60%)" 
      : zone.status === "yellow" 
        ? "hsl(42,95%,58%)" 
        : "hsl(152,70%,50%)";
    return { crowd: pct, crowdColor: color };
  };

  const dynamicDestinations = BASE_DESTINATIONS.map(d => {
    const live = getLiveZoneInfo(d.label);
    if (!live) return d;
    return {
      ...d,
      crowd: live.crowd,
      crowdColor: live.crowdColor
    };
  });

  const destInfo = dynamicDestinations.find(d => d.label === navTarget || navTarget.includes(d.label) || d.label.includes(navTarget));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Welcome, {userName}!</h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            {userSector.split(",").join(" · ")} &nbsp;·&nbsp; USA 🇺🇸 vs BRA 🇧🇷 &nbsp;·&nbsp; 73′
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="live-dot" />
          <span style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>Live · Cortex AI</span>
        </div>
      </div>

      {/* Reroute Warning Banner */}
      <AnimatePresence>
        {isRedirectActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>🔀</span>
            <div style={{ fontSize: "0.875rem" }}>
              <span style={{ fontWeight: 700, color: "hsl(210, 90%, 65%)" }}>Cortex AI Wayfinding Alert</span> · Gate A is currently restricted under **Protocol Delta-2**. Pedestrian flow is diverted to Gate C. Navigation paths updated.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cortex AI Recommendation */}
      <CortexCard
        severity={isRedirectActive ? "success" : "warning"}
        icon="⚽"
        title="Halftime in ~8 min — Act now to beat the rush"
        insight={isRedirectActive 
          ? "Cortex AI Routing Notice: Gate A has been successfully bypassed. Alternate paths through Gate C (North Stand) are stable. Concession traffic at Food Court B is low." 
          : "Cortex AI recommends visiting the restroom in the next 5 minutes before the halftime rush. Food Court B currently has a 4-minute wait (vs. 18 minutes at Food Court A). Gate A is congested — use Gate C for fastest exit."
        }
        actions={[
          { label: "Navigate to Restroom", variant: "primary", onClick: () => selectDestination("Restroom N") },
          { label: "Check Food Queues",    variant: "ghost",   onClick: () => router.push("/fan/food") },
        ]}
      />



      {/* ─── MAIN TWO-COLUMN LAYOUT ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.25rem", alignItems: "start" }}>

        {/* ── LEFT COLUMN: Map + Controls ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass-card" style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontWeight: 600 }}>🗺️ Smart Navigation</h3>

            <StadiumMap
              role="fan"
              target={navTarget}
              active={routeGenerated}
              onNodeClick={(nodeName) => {
                if (nodeName.includes("Base")) return;
                selectDestination(nodeName);
              }}
            />

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <label htmlFor="fan-destination-select" className="sr-only">Select target destination</label>
              <select
                id="fan-destination-select"
                value={navTarget}
                onChange={(e) => { selectDestination(e.target.value); }}
                style={{
                  flex: 1, padding: "0.625rem 0.875rem",
                  background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                  fontFamily: "var(--font-sans)", fontSize: "0.875rem", outline: "none",
                }}
              >
                {dynamicDestinations.map(d => (
                  <option 
                    disabled={isRedirectActive && d.label === "Gate A"} 
                    key={d.label}
                  >
                    {d.label} {isRedirectActive && d.label === "Gate A" ? "(CLOSED)" : ""}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={() => setRouteGenerated(true)}>
                Generate Route
              </button>
            </div>
          </div>

          {/* Route directions card */}
          <AnimatePresence>
            {routeGenerated && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div style={{
                  padding: "1.25rem", borderRadius: "var(--radius-md)",
                  background: "hsl(152 70% 50% / 0.07)", border: "1px solid hsl(152 70% 50% / 0.2)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(152,70%,60%)", display: "block", marginBottom: "0.25rem" }}>✦ CORTEX AI ROUTE</span>
                      <h4 style={{ fontWeight: 700, fontSize: "1.125rem" }}>To: {navTarget}</h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: "hsl(152,70%,55%)", lineHeight: 1 }}>{isRedirectActive ? "6" : "4"}</div>
                      <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>min saved</div>
                    </div>
                  </div>

                  {destInfo && destInfo.crowd > 70 && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem",
                      borderRadius: "var(--radius-sm)", background: "hsl(0 84% 60% / 0.06)",
                      border: "1px solid hsl(0 84% 60% / 0.15)", marginBottom: "0.75rem",
                    }}>
                      <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                      <p style={{ fontSize: "0.875rem", color: "hsl(0,84%,70%)" }}>
                        {navTarget} is congested ({destInfo.crowd}%). AI has found a faster alternate path.
                      </p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1rem" }}>
                    {isRedirectActive && navTarget === "Gate C" ? [
                      { step: 1, text: "From your seat, exit to Section 112 corridor",             time: "1 min"   },
                      { step: 2, text: "Follow signs for detour — avoid Gate A completely",       time: "1 min"   },
                      { step: 3, text: "Proceed along North Concourse straight to Gate C",        time: "3 min"   },
                      { step: 4, text: "Arrive at Gate C (Rerouted path active)",                 time: "30 sec"  },
                    ].map(s => (
                      <div key={s.step} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", background: "hsl(210, 90%, 50%)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 700, color: "white", flexShrink: 0,
                        }}>{s.step}</div>
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{s.text}</p>
                          <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>{s.time}</p>
                        </div>
                      </div>
                    )) : [
                      { step: 1, text: "From your seat, head to Section 112 concourse exit",       time: "1 min"   },
                      { step: 2, text: "Turn left at the main corridor — avoid Gate A area",        time: "2 min"   },
                      { step: 3, text: "Take the escalator to Level 2",                             time: "30 sec"  },
                      { step: 4, text: `Arrive at ${navTarget}`,                                    time: "30 sec"  },
                    ].map(s => (
                      <div key={s.step} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", background: "hsl(152 70% 45%)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 700, color: "white", flexShrink: 0,
                        }}>{s.step}</div>
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{s.text}</p>
                          <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>{s.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-success" style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => toast.success("Navigation started! Follow the route above.")}>
                    ✦ Start Navigation
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT COLUMN: Quick Navigate + Crowd Info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1rem" }}>

          {/* Quick Destinations */}
          <div className="glass-card">
            <h3 style={{ fontWeight: 600, marginBottom: "0.875rem", fontSize: "0.9375rem" }}>⚡ Quick Navigate</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {dynamicDestinations.map(d => (
                <button
                  key={d.label}
                  disabled={isRedirectActive && d.label === "Gate A"}
                  onClick={() => selectDestination(d.label)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.625rem 0.875rem", borderRadius: "var(--radius-sm)",
                    background: navTarget === d.label ? "hsl(210 90% 60% / 0.12)" : "hsl(var(--surface-2))",
                    border: navTarget === d.label ? "1px solid hsl(210 90% 60% / 0.35)" : "1px solid transparent",
                    cursor: d.label === "Gate A" && isRedirectActive ? "not-allowed" : "pointer", 
                    width: "100%", textAlign: "left",
                    transition: "all 0.15s ease",
                    opacity: d.label === "Gate A" && isRedirectActive ? 0.35 : 1
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>
                    <span>{d.icon}</span>
                    <span style={{ color: "hsl(var(--foreground))" }}>{d.label} {isRedirectActive && d.label === "Gate A" ? "(CLOSED)" : ""}</span>
                  </span>
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700, padding: "2px 6px",
                    borderRadius: "999px", background: `${d.crowdColor}18`, color: d.crowdColor,
                    border: `1px solid ${d.crowdColor}35`,
                  }}>
                    {d.crowd > 0 ? `${d.crowd}%` : "Here"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Crowd density at key zones */}
          <div className="glass-card">
            <h3 style={{ fontWeight: 600, marginBottom: "0.875rem", fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "hsl(190,100%,50%)", display: "inline-block" }} />
              Zone Crowd Density
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {dynamicDestinations.filter(d => d.crowd > 0).map(d => (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "0.8125rem" }}>{d.icon} {d.label}</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: d.crowdColor }}>{d.crowd}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${d.crowd}%`, background: d.crowdColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency panel */}
          <div style={{
            padding: "1rem", borderRadius: "var(--radius-md)",
            background: "hsl(0 84% 60% / 0.06)", border: "1px solid hsl(0 84% 60% / 0.2)",
          }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "hsl(0,84%,70%)" }}>🆘 Need Help?</p>
            <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", marginBottom: "0.75rem" }}>
              Medical bay and staff are available at all gates.
            </p>
            <button className="btn btn-danger" style={{ width: "100%", justifyContent: "center", fontSize: "0.875rem" }}
              onClick={() => router.push("/fan/emergency")}>
              Emergency SOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NavigationPage() {
  return (
    <Suspense fallback={<div style={{ color: "hsl(var(--foreground-muted))" }}>Loading navigation...</div>}>
      <NavigationContent />
    </Suspense>
  );
}
