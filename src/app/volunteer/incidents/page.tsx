"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { useVolunteerStore } from "@/stores/volunteerStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportIncidentPage() {
  const pathname = usePathname();
  const addAlert = useCortexStore((state) => state.addAlert);
  const { addTask } = useVolunteerStore();

  const [incidentType, setIncidentType] = useState("Medical emergency");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone.trim() || !description.trim()) {
      toast.error("Please fill in the location and details.");
      return;
    }

    // 1. Dispatch global critical alert to Cortex command center & Security Overview feeds
    addAlert({
      severity: "critical",
      title: `Volunteer report: ${incidentType}`,
      message: description,
      zone: zone,
      actionRequired: true,
      acknowledged: false,
    });

    // 2. Dispatch a local volunteer task so it populates immediately under the "My Tasks" feed
    addTask({
      title: `${incidentType} Response — ${zone}`,
      description: `Reported by volunteer: ${description}`,
      priority: "high",
      zone: zone,
      estimatedMinutes: 10,
      aiGenerated: false,
    });

    setSubmitted(true);
    setZone("");
    setDescription("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Volunteer Hub</h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            Sara Mitchell · Badge VOL-2026-4421 · East Wing
          </p>
        </div>
      </div>



      {/* Report Incident Tab Panel */}
      <motion.div key="incidents" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card" style={{ maxWidth: "640px" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>⚠️ Report an Incident</h3>
          
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form key="incident-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.6 }}>
                  Submitting this report immediately flags the issue in the security console and creates an active dispatch ticket.
                </p>
                <div>
                  <label htmlFor="inc-type" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>Incident Type</label>
                  <select 
                    id="inc-type"
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    style={{
                      width: "100%", padding: "0.625rem 0.875rem",
                      background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                    }}
                  >
                    <option>Medical emergency</option>
                    <option>Fan altercation</option>
                    <option>Suspicious item</option>
                    <option>Crowd crush risk</option>
                    <option>Lost child / person</option>
                    <option>Fire / evacuation needed</option>
                    <option>Infrastructure damage</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="inc-loc" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>Location / Zone</label>
                  <input
                    id="inc-loc"
                    type="text"
                    required
                    placeholder="e.g. Gate A, Row 12, Section 112..."
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    style={{
                      width: "100%", padding: "0.625rem 0.875rem",
                      background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                      fontFamily: "var(--font-sans)", fontSize: "0.875rem", outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="inc-desc" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>Description</label>
                  <textarea
                    id="inc-desc"
                    required
                    placeholder="Describe what you see..."
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
                <button type="submit" className="btn btn-danger" style={{ justifyContent: "center" }}>
                  🚨 Submit Incident Report
                </button>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "1.5rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                <h4 style={{ fontWeight: 700, fontSize: "1.25rem", color: "hsl(var(--accent-red))", marginBottom: "0.5rem" }}>Incident Registered</h4>
                <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                  Your report has been logged. The issue has been added to the local task list and broadcasted directly to the Command Center and Security.
                </p>
                <button className="btn btn-ghost" style={{ margin: "0 auto" }} onClick={() => setSubmitted(false)}>
                  File Another Incident
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
