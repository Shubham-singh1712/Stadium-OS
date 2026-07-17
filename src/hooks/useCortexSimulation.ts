"use client";

import { useEffect } from "react";
import { useCortexStore } from "@/stores/cortexStore";

/**
 * Hook that starts the Cortex AI simulation engine.
 * Call once at the app root level.
 */
export function useCortexSimulation(intervalMs = 4000) {
  const { tickAsync, startSimulation, stopSimulation } = useCortexStore();

  useEffect(() => {
    startSimulation();
    const interval = setInterval(tickAsync, intervalMs);
    return () => {
      clearInterval(interval);
      stopSimulation();
    };
  }, [tickAsync, startSimulation, stopSimulation, intervalMs]);
}
