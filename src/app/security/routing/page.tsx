"use client";

import { CortexCard } from "@/components/cortex/CortexCard";
import dynamic from "next/dynamic";
const StadiumMap = dynamic(() => import("@/components/stadium/StadiumMap").then((m) => m.StadiumMap), {
  ssr: false,
  loading: () => <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-md)", color: "hsl(var(--foreground-muted))" }}>Loading Map...</div>,
});
import { useCortexStore } from "@/stores/cortexStore";
import { GateActionCard } from "@/components/cortex/GateActionCard";
import { toast } from "sonner";

export default function SecurityRoutingPage() {
  const addTimelineEvent = useCortexStore((state) => state.addTimelineEvent);
  const executeRedirect = useCortexStore((state) => state.executeRedirect);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Emergency Routing</h2>

      <CortexCard
        severity="critical"
        icon="🚨"
        title="Gate A blocked — Protocol Delta-2 recommended"
        insight="Cortex AI has determined that Gate A should be temporarily closed for incoming fan flow. All fans should be rerouted through Gate C (north) and Gate D (east). Estimated crowd relief: 40% in 8 minutes with this protocol."
        actions={[
          { 
            label: "Activate Protocol Delta-2", 
            variant: "primary", 
            onClick: () => {
              toast.promise(new Promise(res => setTimeout(res, 1500)), {
                loading: 'Activating Protocol Delta-2...',
                success: () => {
                  addTimelineEvent("security", "Protocol Delta-2 activated. Gate A restricted. C and D expanded.", "critical");
                  executeRedirect("gate-a", "gate-c");
                  return 'Protocol Delta-2 active.';
                },
                error: 'Failed to activate protocol.',
              });
            }
          },
          { 
            label: "Alert All Staff", 
            variant: "danger", 
            onClick: () => {
              toast.success('Security staff notified of routing changes.');
              addTimelineEvent("security", "All staff alerted to routing emergency", "warning");
            } 
          },
          { 
            label: "Public Announcement", 
            variant: "ghost", 
            onClick: () => {
              toast.success('PA system announcement queued.');
              addTimelineEvent("operations", "Public announcement queued for Gate A closure", "info");
            } 
          },
        ]}
      />

      <div style={{ maxWidth: "640px" }} className="glass-card">
        <h3 style={{ fontWeight: 600, marginBottom: "12px" }}>🗺️ Active Flow Rerouting Map</h3>
        <StadiumMap role="volunteer" target="Gate C" active={true} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        <GateActionCard
          zoneId="gate-a"
          actionType="redirect"
          description="Closing incoming lane — fans rerouted to C"
          destinationZoneId="gate-c"
        />
        <GateActionCard
          zoneId="gate-b"
          actionType="monitor"
          description="Keep 1 additional officer on standby"
        />
        <GateActionCard
          zoneId="gate-c"
          actionType="expand"
          description="Open all 4 lanes — primary alternative"
        />
        <GateActionCard
          zoneId="gate-d"
          actionType="expand"
          description="Secondary alternative — East side"
        />
      </div>
    </div>
  );
}
