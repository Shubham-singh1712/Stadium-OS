"use client";

import { useState, useEffect } from "react";

const MOCK_CONSOLE_LOGS = [
  "Cortex OS Core v2.5 initialized successfully.",
  "Estádio Azteca Concourse capacity analytics updated.",
  "Gate A sensors calibrated: Flow nominal (185/min).",
  "Neural path checks completed. Route diversion: READY.",
  "Live attendance sync completed. Active devices: 78,420.",
  "Halftime crowd spikes modeled. Peak prediction: 8.5 min.",
  "Volunteer deployment grids synchronized with Command.",
  "Arena grid efficiency: 94.6% (Solar active).",
  "Incident reports synced: 0 active high-priority logs."
] as const;

export function ConsoleTicker() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % MOCK_CONSOLE_LOGS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      style={{
        marginTop: "3.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        fontFamily: "var(--font-sans)",
        fontSize: "0.75rem",
        color: "rgba(255, 255, 255, 0.35)",
        background: "rgba(255, 255, 255, 0.015)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        borderRadius: "var(--radius-sm)",
        padding: "0.5rem 1rem",
        maxWidth: "420px",
        width: "100%",
        justifyContent: "center",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)"
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
      <span className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-center select-none text-[11px] font-mono tracking-wide">
        {MOCK_CONSOLE_LOGS[logIndex]}
      </span>
    </div>
  );
}
