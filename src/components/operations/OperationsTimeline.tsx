import { motion, AnimatePresence } from "framer-motion";
import type { TimelineEvent } from "@/types";

export function OperationsTimeline({
  timelineEvents,
  matchMinute,
}: {
  timelineEvents: TimelineEvent[];
  matchMinute?: number;
}) {
  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(190,100%,50%)" }} className="live-dot" />
        Live Activity Stream
        {matchMinute !== undefined && (
          <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 600, color: "hsl(210,90%,65%)" }}>
            {matchMinute}′
          </span>
        )}
      </h3>
      <div style={{
        display: "flex", flexDirection: "column", gap: "0.75rem",
        maxHeight: "320px", overflowY: "auto", paddingRight: "4px"
      }}>
        <AnimatePresence>
          {timelineEvents.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                fontSize: "0.8125rem", borderBottom: "1px solid hsl(var(--border) / 0.15)",
                paddingBottom: "8px"
              }}
            >
              <span style={{
                fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
                padding: "0.15rem 0.4rem", borderRadius: "4px", flexShrink: 0,
                background: evt.severity === "critical" ? "hsl(0 84% 60% / 0.12)" : evt.severity === "warning" ? "hsl(42 95% 58% / 0.12)" : "hsl(210 90% 60% / 0.1)",
                color: evt.severity === "critical" ? "hsl(0 84% 65%)" : evt.severity === "warning" ? "hsl(42 95% 65%)" : "hsl(210 90% 70%)",
              }}>
                {evt.category}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ color: "hsl(var(--foreground))", lineHeight: 1.4 }}>{evt.message}</p>
                <span style={{ fontSize: "0.6875rem", color: "hsl(var(--foreground-subtle))" }}>
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  {matchMinute !== undefined && (
                    <span style={{ marginLeft: "0.375rem", color: "hsl(210,90%,60%)", fontWeight: 600 }}>· {matchMinute}′</span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
