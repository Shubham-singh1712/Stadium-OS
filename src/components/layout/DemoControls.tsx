"use client";

import { useState, useEffect } from "react";
import { useCortexStore } from "@/stores/cortexStore";
import { motion, AnimatePresence } from "framer-motion";

export function DemoControls() {
  const isSimulating = useCortexStore((state) => state.isSimulating);
  const activeScenario = useCortexStore((state) => state.activeScenario);
  const stopSimulation = useCortexStore((state) => state.stopSimulation);
  
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating || activeScenario !== null) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isSimulating, activeScenario]);

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return null;
  }

  const isRunning = isSimulating || activeScenario !== null;

  if (!isRunning) {
    return null; // Do not show anything when not running to save vertical space
  }

  const formatName = (name: string) => {
    return name.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentStage = activeScenario ? Math.floor(activeScenario.stage) : 0;
  const maxStages = activeScenario ? activeScenario.maxStages : 0;
  const scenarioName = activeScenario ? formatName(activeScenario.name) : "Random Engine";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="w-full bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-lg overflow-hidden flex items-center justify-between shadow-md"
        style={{ padding: "8px 16px" }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {scenarioName} Simulation Running
            </span>
            <span className="text-gray-500 mx-1">|</span>
            <span className="text-xs text-[hsl(var(--foreground-muted))] font-medium">
              {activeScenario && `Stage ${currentStage}/${maxStages} • `}
              Elapsed {formatTime(elapsed)} • 
              <span className="text-[hsl(210,90%,65%)] ml-1">Cortex AI Active</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Pause button mock for aesthetics as requested in example, actual stop works */}
          <button 
            className="text-[11px] font-semibold px-3 py-1 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pause
          </button>
          <button 
            onClick={() => stopSimulation()}
            className="text-[11px] font-semibold px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            Stop
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
