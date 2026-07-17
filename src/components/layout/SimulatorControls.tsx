"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface SimulatorPanelProps {
  simulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;
}

export function SimulatorControls({ simulatorOpen, setSimulatorOpen }: SimulatorPanelProps) {
  const triggerSimulationScenario = useCortexStore((state) => state.triggerSimulationScenario);
  const isSimulating = useCortexStore((state) => state.isSimulating);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && simulatorOpen) {
        setSimulatorOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [simulatorOpen, setSimulatorOpen]);

  return (
    <AnimatePresence>
      {simulatorOpen && (
        <motion.div
          initial={{ y: 150, x: "-50%" }}
          animate={{ y: 0, x: "-50%" }}
          exit={{ y: 150, x: "-50%" }}
          style={{
            position: "fixed", bottom: 0, left: "50%",
            transform: "translateX(-50%)", width: "fit-content",
            background: "hsl(var(--surface-2) / 0.9)",
            border: "1px solid hsl(var(--border))", borderBottom: "none",
            borderTopLeftRadius: "12px", borderTopRightRadius: "12px",
            padding: "16px 24px", display: "flex", gap: "16px", alignItems: "center",
            zIndex: 9998, boxShadow: "0 -8px 32px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: isSimulating ? "hsl(152,70%,50%)" : "hsl(var(--foreground-muted))" }} />
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em", color: "hsl(var(--foreground-muted))", textTransform: "uppercase" }}>
                Simulation Center {isSimulating ? "(active)" : "(paused)"}
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>Launch dynamic scenarios to test AI routing</span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-danger"
              style={{ fontSize: "0.75rem", padding: "6px 12px" }}
              onClick={() => triggerSimulationScenario("heat_stroke")}
            >
              🩺 Medical SOS
            </button>
            <button
              className="btn btn-danger"
              style={{ fontSize: "0.75rem", padding: "6px 12px" }}
              onClick={() => triggerSimulationScenario("gate_a_spike")}
            >
              🔴 Gate A Spike
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: "0.75rem", padding: "6px 12px", background: "hsl(42,95%,52%)" }}
              onClick={() => triggerSimulationScenario("gate_c_congest")}
            >
              🟡 Gate C Congested
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: "0.75rem", padding: "6px 12px", background: "hsl(265,70%,60%)" }}
              onClick={() => triggerSimulationScenario("halftime_rush")}
            >
              🍔 Halftime Concessions
            </button>
          </div>

          <button
            onClick={() => setSimulatorOpen(false)}
            style={{
              background: "hsl(var(--surface-3))", border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground-muted))",
              cursor: "pointer", fontSize: "0.75rem", padding: "6px 12px"
            }}
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
