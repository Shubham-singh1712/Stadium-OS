"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function EmergencyPage() {
  const pathname = usePathname();
  const addAlert = useCortexStore((state) => state.addAlert);
  const [incidentType, setIncidentType] = useState("Medical emergency");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the incident.");
      return;
    }

    addAlert({
      severity: "critical",
      title: `Fan reported: ${incidentType}`,
      message: description,
      zone: "Section 112, Row G",
      actionRequired: true,
      acknowledged: false,
    });

    setSubmitted(true);
    setDescription("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Welcome, Alex!</h1>
        <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
          Your seat: Section 112, Row G, Seat 14 · USA 🇺🇸 vs BRA 🇧🇷 · 73′
        </p>
      </div>



      {/* SOS Panel */}
      <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px" }}>
          <div className="glass-card" style={{ border: "1px solid hsl(0 84% 60% / 0.3)", background: "hsl(0 84% 60% / 0.03)" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "1rem", color: "hsl(var(--accent-red))" }}>🆘 Request Immediate Assistance</h3>
            
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form key="form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.6 }}>
                    This form is connected directly to the Security Command Center and local volunteer dispatch. Please report any emergencies below.
                  </p>
                  <div>
                    <label htmlFor="fan-inc-type" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>Incident Type</label>
                    <select 
                      id="fan-inc-type"
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value)}
                      style={{
                        width: "100%", padding: "0.625rem 0.875rem",
                        background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                      }}
                    >
                      <option>Medical emergency</option>
                      <option>Safety concern / Altercation</option>
                      <option>Suspicious package</option>
                      <option>Facility / Seating damage</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fan-inc-loc" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>Location (Pre-filled)</label>
                    <input
                      id="fan-inc-loc"
                      type="text"
                      disabled
                      value="Section 112, Row G, Seat 14"
                      style={{
                        width: "100%", padding: "0.625rem 0.875rem",
                        background: "hsl(var(--surface-3))", border: "1px solid hsl(var(--border-subtle))",
                        borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground-muted))",
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="fan-inc-desc" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>Incident Details</label>
                    <textarea
                      id="fan-inc-desc"
                      placeholder="Please describe the details of the emergency..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{
                        width: "100%", padding: "0.75rem 0.875rem", minHeight: "90px", resize: "none",
                        background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                        fontFamily: "var(--font-sans)", fontSize: "0.875rem", outline: "none",
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-danger" style={{ justifyContent: "center", fontWeight: 700 }}>
                    🚨 Dispatch Help Now
                  </button>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "1.5rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚨</div>
                  <h4 style={{ fontWeight: 700, fontSize: "1.25rem", color: "hsl(var(--accent-red))", marginBottom: "0.5rem" }}>SOS Broadcasted</h4>
                  <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    An emergency alert was broadcasted to the Security Command Center and local volunteer dispatch for **Section 112**. A volunteer has been assigned.
                  </p>
                  <button className="btn btn-ghost" style={{ margin: "0 auto" }} onClick={() => setSubmitted(false)}>
                    Report Another Incident
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
