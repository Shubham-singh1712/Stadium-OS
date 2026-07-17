"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_POOL = [
  { id: 1, text: "Goal detected in Sector 4", type: "event" },
  { id: 2, text: "Crowd movement increasing (East Wing)", type: "alert" },
  { id: 3, text: "Gate B occupancy +6%", type: "metric" },
  { id: 4, text: "Volunteer reassigned to Concourse C", type: "action" },
  { id: 5, text: "Protocol Delta-2 executed", type: "system" },
  { id: 6, text: "Dynamic navigation paths updated", type: "system" },
  { id: 7, text: "Medical team dispatched to Section 112", type: "action" },
  { id: 8, text: "Temperature nominal across all sensors", type: "metric" },
];

export function ConsoleTicker() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventIndex, setEventIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEvents([{ ...EVENT_POOL[0], uniqueId: 1 }, { ...EVENT_POOL[1], uniqueId: 2 }]);
    setEventIndex(2);

    const timer = setInterval(() => {
      setEvents((prev) => {
        setEventIndex((i) => i + 1);
        const newEvent = EVENT_POOL[eventIndex % EVENT_POOL.length];
        const updated = [...prev, { ...newEvent, uniqueId: Date.now() }];
        // Keep only the last 3 events visible
        if (updated.length > 3) return updated.slice(updated.length - 3);
        return updated;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [eventIndex]);

  const getColor = (type: string) => {
    switch(type) {
      case "event": return "text-emerald-400";
      case "alert": return "text-amber-400";
      case "metric": return "text-blue-400";
      case "action": return "text-purple-400";
      default: return "text-white/70";
    }
  };

  if (!mounted) return null;

  return (
    <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg flex flex-col items-center z-30 pointer-events-none">
      <div className="flex items-center gap-2 mb-3 opacity-60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white">Cortex Live Event Stream</span>
      </div>
      
      <div className="h-[90px] w-full overflow-hidden relative flex flex-col justify-end">
        <div className="absolute inset-0 pointer-events-none z-20" style={{ maskImage: "linear-gradient(to bottom, transparent, black 30%, black 80%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black 80%, transparent)" }} />
        
        <div className="flex flex-col gap-2 w-full z-10 px-4">
          <AnimatePresence mode="popLayout">
            {events.map((ev: any) => (
              <motion.div
                key={ev.uniqueId}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-3 w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
              >
                <span className="text-[10px] font-mono text-white/30">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</span>
                <span className={`text-[11px] font-mono tracking-wide ${getColor(ev.type)} font-medium`}>
                  {ev.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
