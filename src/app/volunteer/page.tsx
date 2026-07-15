"use client";

import { useVolunteerStore } from "@/stores/volunteerStore";
import { CortexCard } from "@/components/cortex/CortexCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TaskPriority } from "@/types";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "hsl(0,84%,60%)",
  high: "hsl(42,95%,58%)",
  medium: "hsl(210,90%,60%)",
  low: "hsl(152,70%,50%)",
};

export default function VolunteerPage() {
  const pathname = usePathname();
  const { tasks, acceptTask, completeTask } = useVolunteerStore();

  const pending = tasks.filter(t => t.status === "pending");
  const active = tasks.filter(t => t.status === "accepted" || t.status === "in_progress");
  const done = tasks.filter(t => t.status === "completed");

  const urgentCount = pending.filter(t => t.priority === "urgent" || t.priority === "high").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Volunteer Hub</h1>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            Sara Mitchell · Badge VOL-2026-4421 · East Wing
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          {[
            { label: `${pending.length} Pending`, color: "hsl(42,95%,58%)" },
            { label: `${active.length} Active`, color: "hsl(210,90%,60%)" },
            { label: `${done.length} Done`, color: "hsl(152,70%,50%)" },
          ].map(b => (
            <span key={b.label} style={{
              padding: "0.375rem 0.875rem", borderRadius: "999px",
              background: `${b.color}15`, border: `1px solid ${b.color}30`,
              fontSize: "0.8125rem", fontWeight: 600, color: b.color,
            }}>{b.label}</span>
          ))}
        </div>
      </div>

      <CortexCard
        severity="warning"
        icon="🙋"
        title={`${urgentCount} high priority tasks require your attention`}
        insight="Cortex AI has prioritized volunteer deployments based on current crowd flows. Gate A crowd management and Food Court B kiosk staffing are top priority. Directing fans to alternate entrances helps absorb capacity."
        actions={[
          { label: "Accept Top Task", variant: "primary", onClick: () => {
            const topTask = pending[0];
            if (topTask) acceptTask(topTask.id);
          } },
        ]}
      />



      {/* Tasks Tab Panel */}
      <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              className="glass-card"
              style={{
                opacity: task.status === "completed" ? 0.55 : 1,
                borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
                      padding: "0.15rem 0.5rem", borderRadius: "999px",
                      background: `${PRIORITY_COLORS[task.priority]}18`,
                      color: PRIORITY_COLORS[task.priority],
                      border: `1px solid ${PRIORITY_COLORS[task.priority]}30`,
                    }}>
                      {task.priority}
                    </span>
                    {task.aiGenerated && (
                      <span style={{
                        fontSize: "0.6875rem", fontWeight: 600,
                        padding: "0.15rem 0.5rem", borderRadius: "999px",
                        background: "hsl(210 90% 60% / 0.1)", color: "hsl(210 90% 70%)",
                        border: "1px solid hsl(210 90% 60% / 0.2)",
                      }}>
                        ✦ AI Assigned
                      </span>
                    )}
                    <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>
                      📍 {task.zone} · ~{task.estimatedMinutes} min
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 600, marginBottom: "0.375rem" }}>{task.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.6 }}>
                    {task.description}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
                  {task.status === "pending" && (
                    <button className="btn btn-primary" style={{ fontSize: "0.8125rem" }} onClick={() => acceptTask(task.id)}>
                      Accept Task
                    </button>
                  )}
                  {(task.status === "accepted" || task.status === "in_progress") && (
                    <button className="btn btn-success" style={{ fontSize: "0.8125rem" }} onClick={() => completeTask(task.id)}>
                      ✓ Complete
                    </button>
                  )}
                  {task.status === "completed" && (
                    <span style={{ fontSize: "0.8125rem", color: "hsl(152,70%,55%)", fontWeight: 600 }}>✓ Done</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
