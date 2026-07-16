"use client";

import { useCortexStore } from "@/stores/cortexStore";

export function DemoControls() {
  const triggerSimulationScenario = useCortexStore((state) => state.triggerSimulationScenario);
  
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 flex gap-2 shadow-2xl items-center">
      <span className="text-[10px] uppercase text-white/50 tracking-wider font-semibold mr-2">Demo Controls</span>
      <button 
        onClick={() => triggerSimulationScenario("gate_a_spike")}
        className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-xs rounded transition-colors"
      >
        Goal Surge
      </button>
      <button 
        onClick={() => triggerSimulationScenario("gate_c_congest")}
        className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 text-xs rounded transition-colors"
      >
        Transit Delay
      </button>
      <button 
        onClick={() => triggerSimulationScenario("halftime_rush")}
        className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 text-xs rounded transition-colors"
      >
        Storm Warning
      </button>
      <button 
        onClick={() => triggerSimulationScenario("heat_stroke")}
        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs rounded transition-colors"
      >
        Medical Drop
      </button>
    </div>
  );
}
