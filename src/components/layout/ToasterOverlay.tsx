"use client";

import { useCortexStore } from "@/stores/cortexStore";
import { motion, AnimatePresence } from "framer-motion";
import { playAlertSynth } from "@/lib/audio";
import { useState, useEffect } from "react";

export function ToasterOverlay() {
  const toasts = useCortexStore((state) => state.toasts);
  const dismissToast = useCortexStore((state) => state.dismissToast);
  const [lastToastId, setLastToastId] = useState<string | null>(null);

  useEffect(() => {
    if (toasts.length > 0) {
      const latest = toasts[toasts.length - 1];
      if (latest.id !== lastToastId) {
        setLastToastId(latest.id);
        playAlertSynth(latest.severity);
      }
    }
  }, [toasts, lastToastId]);

  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 9999,
      display: "flex", flexDirection: "column", gap: "10px", width: "320px", pointerEvents: "none"
    }}>
      <AnimatePresence>
        {toasts.map((t) => {
          const styles = {
            info: { border: "rgba(59, 130, 246, 0.4)", bg: "rgba(10, 15, 30, 0.93)", led: "#3b82f6", text: "#60a5fa", label: "CORTEX LOG" },
            warning: { border: "rgba(245, 158, 11, 0.4)", bg: "rgba(15, 15, 10, 0.93)", led: "#f59e0b", text: "#fbbf24", label: "SYSTEM WARNING" },
            critical: { border: "rgba(239, 68, 68, 0.4)", bg: "rgba(20, 10, 10, 0.93)", led: "#ef4444", text: "#f87171", label: "CRITICAL ALERT" },
            success: { border: "rgba(16, 185, 129, 0.4)", bg: "rgba(10, 20, 15, 0.93)", led: "#10b981", text: "#34d399", label: "OPERATIONAL SUCCESS" },
          }[t.severity] || { border: "rgba(255,255,255,0.15)", bg: "rgba(20,20,20,0.95)", led: "#fff", text: "#fff", label: "SYSTEM NOTICE" };

          return (
            <motion.div
              key={t.id}
              role={t.severity === "critical" || t.severity === "warning" ? "alert" : "status"}
              aria-live={t.severity === "critical" || t.severity === "warning" ? "assertive" : "polite"}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              style={{
                pointerEvents: "auto",
                background: styles.bg,
                border: `1px solid ${styles.border}`,
                borderLeft: `4px solid ${styles.led}`,
                borderRadius: "8px",
                padding: "12px 14px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(16px)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                width: "320px",
                fontFamily: "monospace",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Scanner lines */}
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.01) 2px, rgba(255, 255, 255, 0.01) 4px)", pointerEvents: "none" }} />
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: styles.led, boxShadow: `0 0 6px ${styles.led}` }} />
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: styles.text, letterSpacing: "0.05em" }}>
                    {styles.label}
                  </span>
                </div>
                <button
                  onClick={() => dismissToast(t.id)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", padding: "2px", lineHeight: 1 }}
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <h4 style={{ fontWeight: 700, fontSize: "0.8rem", color: "#fff" }}>{t.title}</h4>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.35 }}>{t.message}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
