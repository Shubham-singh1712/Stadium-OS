"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { useAuthStore } from "@/stores/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function EmergencyPage() {
  const addAlert = useCortexStore((state) => state.addAlert);
  const user = useAuthStore((state) => state.user);

  const [incidentType, setIncidentType] = useState("Medical emergency");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const userName = user?.name ?? "Alex";
  const userSector = user?.sector ?? "Section 112, Row G, Seat 14";

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
      zone: userSector,
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
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
          Welcome, {userName}!
        </h2>
        <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
          Your seat: {userSector} · USA 🇺🇸 vs BRA 🇧🇷
        </p>
      </div>

      {/* SOS Panel */}
      <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px" }}>
          <div className="glass-card" style={{ border: "1px solid hsl(0 84% 60% / 0.3)", background: "hsl(0 84% 60% / 0.03)" }}>
            <h2 style={{ fontWeight: 600, marginBottom: "1rem", color: "hsl(var(--accent-red))" }}>🆘 Request Immediate Assistance</h2>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  aria-label="Emergency assistance request form"
                  noValidate
                  style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <p id="form-description" style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.6 }}>
                    This form is connected directly to the Security Command Center and local volunteer dispatch. Please report any emergencies below.
                  </p>

                  <div>
                    <label htmlFor="fan-inc-type" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>
                      Incident Type
                    </label>
                    <select
                      id="fan-inc-type"
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value)}
                      aria-required="true"
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
                    <label htmlFor="fan-inc-loc" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>
                      Location (Pre-filled)
                    </label>
                    <input
                      id="fan-inc-loc"
                      type="text"
                      disabled
                      value={userSector}
                      aria-describedby="loc-hint"
                      style={{
                        width: "100%", padding: "0.625rem 0.875rem",
                        background: "hsl(var(--surface-3))", border: "1px solid hsl(var(--border-subtle))",
                        borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground-muted))",
                      }}
                    />
                    <span id="loc-hint" style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>
                      Location is automatically detected from your seat assignment.
                    </span>
                  </div>

                  <div>
                    <label htmlFor="fan-inc-desc" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>
                      Incident Details <span aria-hidden="true" style={{ color: "hsl(var(--accent-red))" }}>*</span>
                    </label>
                    <textarea
                      id="fan-inc-desc"
                      placeholder="Please describe the details of the emergency..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      aria-required="true"
                      aria-describedby="form-description desc-hint"
                      minLength={5}
                      style={{
                        width: "100%", padding: "0.75rem 0.875rem", minHeight: "90px", resize: "none",
                        background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                        fontFamily: "var(--font-sans)", fontSize: "0.875rem", outline: "none",
                      }}
                    />
                    <span id="desc-hint" style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>
                      Required. Minimum 5 characters. Describe what you can see.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger"
                    id="fan-sos-dispatch"
                    aria-label="Dispatch emergency help now"
                    style={{ justifyContent: "center", fontWeight: 700 }}
                  >
                    🚨 Dispatch Help Now
                  </button>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "1.5rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚨</div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "hsl(var(--accent-red))", marginBottom: "0.5rem" }}>SOS Broadcasted</h3>
                  <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    An emergency alert was broadcasted to the Security Command Center and local volunteer dispatch for <strong>{userSector}</strong>. A volunteer has been assigned.
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
