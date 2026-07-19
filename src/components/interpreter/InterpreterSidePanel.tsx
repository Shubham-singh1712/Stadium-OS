"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Compass, Users, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useVolunteerStore } from "@/stores/volunteerStore";
import { useCortexStore } from "@/stores/cortexStore";


interface InterpreterSidePanelProps {
  isEmergencyActive: boolean;
  voiceTranslated: string;
  simulatedOcrTranslated: string;
  speakText: (text: string) => void;
}

export function InterpreterSidePanel({
  isEmergencyActive,
  voiceTranslated,
  simulatedOcrTranslated,
  speakText
}: InterpreterSidePanelProps) {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* EMERGENCY HIGH-PRIORITY ASSISTANCE MODAL/CARD */}
      <AnimatePresence>
        {isEmergencyActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              background: "rgba(239, 68, 68, 0.08)", border: "1px solid hsl(0, 84%, 55%)",
              borderRadius: "var(--radius-md)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle color="hsl(0, 84%, 60%)" size={20} />
                <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "hsl(0, 84%, 60%)" }}>EMERGENCY ASSISTANCE DETECTED</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", lineHeight: 1.5 }}>
                Your translation contains phrases indicating urgent safety or medical needs. Cortex suggests locating the nearest physical support desk or reporting directly.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
                <button onClick={() => router.push("/fan/navigation?target=Medical Bay 1&generate=true")} className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", minHeight: 0, background: "linear-gradient(135deg, hsl(0,84%,55%), hsl(0,84%,45%))", border: "none" }}>
                  🏥 Navigate to Medical Bay
                </button>
                <button onClick={() => router.push("/fan/emergency")} className="btn btn-ghost" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", minHeight: 0 }}>
                  🆘 Open SOS Dispatch
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Actions deck */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 600, marginBottom: "0.875rem" }}>📍 Nearby Assistance Contextual Actions</h3>
        <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", marginBottom: "1.25rem", lineHeight: 1.5 }}>
          Use these smart actions to find directions or coordinate support matches instantly based on your translation.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => {
              let destination = "Gate A";
              if (voiceTranslated.toLowerCase().includes("metro")) destination = "Metro East";
              else if (voiceTranslated.toLowerCase().includes("restroom")) destination = "Restroom N";
              else if (voiceTranslated.toLowerCase().includes("food")) destination = "Food Court B";
              
              router.push(`/fan/navigation?target=${destination}&generate=true`);
            }}
            className="btn btn-ghost"
            style={{ justifyContent: "flex-start", gap: "10px", fontSize: "0.875rem" }}
          >
            <Compass size={16} />
            <span>Navigate to translation location</span>
          </button>

          <button
            onClick={() => {
              const query = voiceTranslated || simulatedOcrTranslated || "General language inquiry";
              useVolunteerStore.getState().addTask({
                title: "Translation Inquiry support",
                description: `Assistance requested at Section 112 for translator support: "${query}"`,
                priority: "medium",
                zone: "Section 112",
                estimatedMinutes: 5,
                aiGenerated: false
              });
              useCortexStore.getState().addTimelineEvent("Volunteer", `Translation support coordinator paged for inquiry: "${query}"`, "info");
              toast.success("Page sent to nearest coordinator. Volunteer task generated.");
            }}
            className="btn btn-ghost"
            style={{ justifyContent: "flex-start", gap: "10px", fontSize: "0.875rem" }}
          >
            <Users size={16} />
            <span>Page nearest coordinator desk</span>
          </button>


          <button
            onClick={() => {
              speakText(voiceTranslated || simulatedOcrTranslated || "Please translate first.");
            }}
            className="btn btn-ghost"
            style={{ justifyContent: "flex-start", gap: "10px", fontSize: "0.875rem" }}
          >
            <Volume2 size={16} />
            <span>Play translated audio recording</span>
          </button>
        </div>
      </div>
    </div>
  );
}
