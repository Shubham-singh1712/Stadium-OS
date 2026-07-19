import { motion } from "framer-motion";
import { OperationalChart } from "@/components/ui/OperationalChart";
import type { CopilotMessage, CopilotChart } from "@/types";
import { useCortexStore } from "@/stores/cortexStore";
import { toast } from "sonner";

export function CopilotMessageBubble({ msg }: { msg: CopilotMessage }) {
  const startProtocol = useCortexStore((state) => state.startProtocol);
  const executeOverflow = useCortexStore((state) => state.executeOverflow);
  const autoAssignStaff = useCortexStore((state) => state.autoAssignStaff);
  const dimArenaLights = useCortexStore((state) => state.dimArenaLights);
  const activateGreenMenu = useCortexStore((state) => state.activateGreenMenu);
  const openKiosk4B = useCortexStore((state) => state.openKiosk4B);
  const dispatchWasteSort = useCortexStore((state) => state.dispatchWasteSort);
  const formatContent = (content: string) => {

    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} style={{ fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>{line.replace(/\*\*/g, "")}</p>;
        }
        if (line.startsWith("- ")) {
          return <p key={i} style={{ paddingLeft: "1rem", color: "hsl(var(--foreground-muted))", fontSize: "0.9rem", marginBottom: "0.25rem" }}>• {line.slice(2)}</p>;
        }
        if (line.match(/^\d+\./)) {
          return <p key={i} style={{ paddingLeft: "1rem", color: "hsl(var(--foreground-muted))", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{line}</p>;
        }
        if (line === "") return <div key={i} style={{ height: "0.5rem" }} />;
        return <p key={i} style={{ color: "hsl(var(--foreground-muted))", fontSize: "0.9rem", lineHeight: 1.7 }}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
      }}
    >
      {msg.role === "cortex" && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", maxWidth: "85%" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-sm)", flexShrink: 0,
            background: "linear-gradient(135deg, hsl(210 90% 55%), hsl(152 70% 45%))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
          }}>✦</div>
          <div>
            <div style={{
              background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", marginBottom: "0.625rem",
            }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{
                  fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(210 90% 70%)",
                }}>✦ Cortex AI</span>
              </div>
              {formatContent(msg.content)}
            </div>

            {msg.charts && msg.charts.length > 0 && (
              <div style={{
                background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "0.625rem",
              }}>
                {msg.charts.map((chart: CopilotChart, i: number) => {
                  const xKey = Object.keys(chart.data[0] ?? {})[0] ?? "name";
                  const series = chart.keys.map((key, ki) => ({
                    key,
                    color: ki === 0 ? "hsl(210,90%,55%)" : "hsl(152,70%,45%)",
                    name: key,
                  }));
                  return (
                    <div key={i}>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.75rem", color: "hsl(var(--foreground))" }}>{chart.title}</p>
                      <div className="sr-only">
                        <h5>Chart: {chart.title}</h5>
                        <p>Bar chart data showing metrics for {chart.keys.join(", ")}.</p>
                      </div>
                      <OperationalChart
                        type="bar"
                        data={chart.data as Array<Record<string, unknown>>}
                        xKey={xKey}
                        series={series}
                        height={140}
                        ariaLabel="Copilot metric analysis chart"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {msg.actions && msg.actions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {msg.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === "a1") {
                        startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
                        toast.success("Initiating Protocol Delta-2 Review...");
                      } else if (action.id === "a2") {
                        executeOverflow("gate-c");
                      } else if (action.id === "s1") {
                        autoAssignStaff();
                      } else if (action.id === "e1") {
                        dimArenaLights();
                      } else if (action.id === "e2") {
                        activateGreenMenu();
                      } else if (action.id === "f1") {
                        openKiosk4B();
                      } else if (action.id === "f2") {
                        dispatchWasteSort();
                      } else {
                        toast.success(`Action applied: ${action.label}`);
                      }

                    }}
                    className={`btn btn-${action.variant === "primary" ? "primary" : action.variant === "danger" ? "danger" : (action.variant as string) === "success" ? "success" : "ghost"}`}

                    style={{ fontSize: "0.8125rem" }}
                  >
                    {action.icon} {action.label}
                  </button>

                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {msg.role === "user" && (
        <div style={{
          background: "linear-gradient(135deg, hsl(210 90% 50%), hsl(210 90% 40%))",
          borderRadius: "var(--radius-md)", padding: "0.875rem 1.25rem", maxWidth: "60%",
          boxShadow: "0 0 24px hsl(210 90% 60% / 0.2)",
        }}>
          <p style={{ fontSize: "0.9375rem", color: "white", lineHeight: 1.6 }}>{msg.content}</p>
        </div>
      )}
    </motion.div>
  );
}
