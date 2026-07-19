import { create } from "zustand";
import { useVolunteerStore } from "./volunteerStore";
import {
  StadiumZone,
  CrowdIntelligence,
  Alert,
  VendorMetrics,
  SustainabilityMetrics,
  TransportOption,
  TimelineEvent,
} from "@/types";
import { getStatusColor } from "@/lib/utils";
import {
  ENHANCED_INITIAL_ZONES,
  generateCrowdHistory,
  INITIAL_ALERTS,
  INITIAL_VENDORS,
  INITIAL_TRANSPORT,
  INITIAL_TIMELINE,
} from "./cortexInitialData";

// ─── Initial Data ─────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
}

export interface ActiveScenario {
  name: "goal_scored" | "metro_outage" | "storm" | "heat_stroke";
  stage: number;
  maxStages: number;
}

export interface ActiveProtocolState {
  zoneId: string;
  protocolName: string;
  protocolTitle: string;
  status: "idle" | "review" | "executing" | "verifying" | "success" | "aborted";
  progress: number;
  checklist: { label: string; done: boolean }[];
}

interface CortexState {
  zones: StadiumZone[];
  crowd: CrowdIntelligence;
  alerts: Alert[];
  vendors: VendorMetrics[];
  transport: TransportOption[];
  sustainability: SustainabilityMetrics;
  lastUpdated: Date;
  isSimulating: boolean;
  toasts: Toast[];
  timelineEvents: TimelineEvent[];
  activeScenario: ActiveScenario | null;
  activeProtocol: ActiveProtocolState | null;
  scenarioStageHeldAt: Date | null; // tracks when scenario paused at 2.5 for auto-advance

  // Actions
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  tick: () => void;
  tickAsync: () => Promise<void>;
  addToast: (title: string, message: string, severity: Toast["severity"]) => void;
  dismissToast: (id: string) => void;
  addTimelineEvent: (category: string, message: string, severity: TimelineEvent["severity"]) => void;
  triggerSimulationScenario: (scenario: "heat_stroke" | "gate_a_spike" | "gate_c_congest" | "halftime_rush") => void;

  // Protocol Sync
  startProtocol: (zoneId: string, protocolName: string, protocolTitle: string) => void;
  setProtocolStatus: (status: ActiveProtocolState["status"], progress?: number) => void;
  cancelProtocol: () => void;
  abortProtocol: () => void;
  toggleChecklistItem: (index: number) => void;

  // Security Operations
  executeRedirect: (zoneId: string, targetId: string) => void;
  executeOverflow: (zoneId: string) => void;
  toggleMonitoring: (zoneId: string, active: boolean) => void;

  // Staffing & Sustainability mutations
  autoAssignStaff: () => void;
  activateGreenMenu: () => void;
  dimArenaLights: () => void;
  rerouteShuttles: () => void;
  dispatchWasteSort: () => void;
  incrementRecycling: () => void;
  openKiosk4B: () => void;
  activateParkingC: () => void;
  deployMetroStaff: () => void;
  preStageConcessions: () => void;
  matchMinute: number;
  activeAnnouncement: string | null;
  broadcastEmergency: () => void;
  closeGate: (zoneId: string) => void;
  publishAnnouncement: (message: string | null) => void;
  cortexMemory: Array<{ time: string; action: string; details: string }>;
  logCortexMemory: (action: string, details: string) => void;
}


function getNextScenarioStage(activeScenario: ActiveScenario | null): ActiveScenario | null {
  if (!activeScenario) return null;
  const currentStage = activeScenario.stage;
  let nextStage = currentStage;
  if (currentStage === 0) nextStage = 1;
  else if (currentStage === 1) nextStage = 2;
  else if (currentStage === 2) nextStage = 2.5;
  else if (currentStage === 2.5) nextStage = 3;

  if (nextStage >= 3 || currentStage >= 3) {
    return null;
  }
  return { ...activeScenario, stage: nextStage };
}

function driftZonesTelemetry(zones: StadiumZone[]): StadiumZone[] {
  return zones.map(z => {
    const nextCurrent = Math.max(0, Math.min(z.capacity, z.current + Math.floor(Math.random() * 20) - 10));
    return {
      ...z,
      current: nextCurrent,
      status: getStatusColor((nextCurrent / z.capacity) * 100)
    };
  });
}


export const useCortexStore = create<CortexState>((set, get) => ({
  matchMinute: 73,
  activeAnnouncement: null,
  zones: ENHANCED_INITIAL_ZONES,
  crowd: {
    totalAttendance: 78420,
    capacity: 85000,
    occupancyRate: 92.3,
    riskScore: 74,
    riskLevel: "High",
    hotspots: ["Gate A", "Food Court A", "Parking Lot A"],
    densityHistory: generateCrowdHistory(),
    prediction: "Crowd will peak at halftime in ~8 minutes. Gates A and D expected at 95%+ capacity.",
  },
  alerts: INITIAL_ALERTS,
  vendors: INITIAL_VENDORS,
  transport: INITIAL_TRANSPORT,
  sustainability: {
    carbonKg: 42800,
    carbonTarget: 50000,
    wasteKg: 3200,
    wasteRecycledPercent: 68,
    energyKwh: 18400,
    energyRenewablePercent: 74,
    waterLiters: 284000,
    publicTransportPercent: 62,
    walkingDistanceKm: 8920,
    aiScore: 76,
    trend: "improving",
  },
  lastUpdated: new Date(),
  isSimulating: false,
  toasts: [],
  timelineEvents: INITIAL_TIMELINE,
  activeScenario: null,
  activeProtocol: null,
  scenarioStageHeldAt: null,
  cortexMemory: [],
  logCortexMemory: (action, details) => {
    set((state) => {
      const timeStr = `${state.matchMinute}′`;
      return {
        cortexMemory: [
          ...state.cortexMemory,
          { time: timeStr, action, details }
        ].slice(-20)
      };
    });
  },


  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      ),
    })),


  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  addAlert: (alertData) => {
    const newAlert: Alert = {
      ...alertData,
      id: `al-${Date.now()}`,
      timestamp: new Date(),
    };
    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
  },

  addToast: (title, message, severity) => {
    const id = `tst-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, severity }],
    }));
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  addTimelineEvent: (category, message, severity) => {
    const id = `tle-${Date.now()}-${Math.random()}`;
    set((state) => ({
      timelineEvents: [
        { id, timestamp: new Date(), category, message, severity },
        ...state.timelineEvents.slice(0, 49),
      ],
    }));
  },

  triggerSimulationScenario: (scenario) => {
    const { addToast } = get();

    if (scenario === "heat_stroke") {
      set({ activeScenario: { name: "heat_stroke", stage: 0, maxStages: 3 } });
      addToast("🩺 AI Alert", "Medical emergency scenario initialized.", "warning");
    }

    if (scenario === "gate_a_spike") {
      set({ activeScenario: { name: "goal_scored", stage: 0, maxStages: 3 } });
      addToast("⚽ Event Triggered", "Goal scored scenario initialized.", "critical");
    }

    if (scenario === "gate_c_congest") {
      set({ activeScenario: { name: "metro_outage", stage: 0, maxStages: 3 } });
      addToast("🚇 Service Delay", "Metro service disruption scenario initialized.", "warning");
    }

    if (scenario === "halftime_rush") {
      set({ activeScenario: { name: "storm", stage: 0, maxStages: 3 } });
      addToast("⚡ Weather Warning", "Severe lightning storm scenario initialized.", "critical");
    }
  },

  // ─── Protocol Sync Engine ───
  startProtocol: (zoneId, name, title) => {
    set({
      activeProtocol: {
        zoneId,
        protocolName: name,
        protocolTitle: title,
        status: "review",
        progress: 0,
        checklist: [
          { label: "Verify AI Threat Confidence > 90%", done: false },
          { label: "Alert Zone Supervisors", done: false },
          { label: "Deploy Crowd Barriers", done: false }
        ]
      }
    });
  },

  setProtocolStatus: (status, progress = 0) => {
    set((state) => {
      if (!state.activeProtocol) return state;

      const updated = {
        ...state.activeProtocol,
        status,
        progress
      };

      // Trigger actual execution side-effect when entering verify
      if (status === "verifying") {
        const zoneId = state.activeProtocol.zoneId;
        const name = state.activeProtocol.protocolName;

        setTimeout(() => {
          if (name.includes("Delta-2")) {
            get().executeRedirect(zoneId, "gate-c");
          } else if (name.includes("Atlas-3")) {
            get().executeOverflow(zoneId);
          }
        }, 100);
      }

      return {
        ...state,
        activeProtocol: updated
      };
    });
  },

  cancelProtocol: () => {
    set({ activeProtocol: null });
  },

  abortProtocol: () => {
    const { addToast, addTimelineEvent } = get();
    set(() => {
      addToast("🛑 Protocol Aborted", "Active protocol execution aborted and rolled back.", "warning");
      addTimelineEvent("Security", "Operator aborted protocol. Restoring previous state.", "warning");
      return { activeProtocol: null };
    });
  },

  toggleChecklistItem: (index: number) => {
    set((state) => {
      if (!state.activeProtocol) return state;
      const newChecklist = [...state.activeProtocol.checklist];
      newChecklist[index].done = !newChecklist[index].done;
      return { activeProtocol: { ...state.activeProtocol, checklist: newChecklist } };
    });
  },

  executeRedirect: (zoneId: string, targetId: string) => {
    const { addToast, addTimelineEvent } = get();
    set((state) => {
      const sourceZone = state.zones.find(z => z.id === zoneId);
      const targetZone = state.zones.find(z => z.id === targetId) || state.zones.find(z => z.type === "gate" && z.id !== zoneId);
      
      if (!sourceZone || !targetZone) return state;

      const dropAmount = Math.floor(sourceZone.current * 0.25);
      
      const newZones = state.zones.map(z => {
        if (z.id === zoneId) {
          const current = Math.max(0, z.current - dropAmount);
          const history = [{ time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: `Protocol Delta-2: Rerouted 25% crowd to ${targetZone.name}`, actor: "Command Center" }, ...(z.actionHistory || [])].slice(0, 3);
          return { 
            ...z, 
            current, 
            status: getStatusColor((current / z.capacity) * 100), 
            actionHistory: history,
            aiRecommendation: "Protocol Delta-2 complete. Flow stabilized." 
          };
        }
        if (z.id === targetZone.id) {
          const current = Math.min(z.capacity, z.current + dropAmount);
          const history = [{ time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: `Protocol Delta-2: Incoming flow absorbed from ${sourceZone.name}`, actor: "System" }, ...(z.actionHistory || [])].slice(0, 3);
          return { ...z, current, status: getStatusColor((current / z.capacity) * 100), actionHistory: history };
        }
        return z;
      });

      addToast("🔀 Protocol Delta-2 Active", `Spectators diverted from ${sourceZone.name} to ${targetZone.name}.`, "success");
      addTimelineEvent("Cortex AI", "Protocol Delta-2: Crowd Redistribution active. Concourse pressure drop verified.", "success");

      // Inject task dynamically to volunteer tasks list
      import("./volunteerStore").then(({ useVolunteerStore }) => {
        useVolunteerStore.getState().addTask({
          title: "Protocol Delta-2: Guide Gate A flow",
          description: `Standby at Junction 7A to direct Gate A overflow fans towards Gate C.`,
          priority: "urgent",
          zone: "Gate A",
          estimatedMinutes: 10,
          aiGenerated: true,
        });
      }).catch((e) => {
        console.warn("Failed to inject volunteer task:", e);
      });

      // If resolving scenario
      const scenario = state.activeScenario;
      let newScenario = scenario;
      if (scenario && scenario.name === "goal_scored") {
        newScenario = { ...scenario, stage: 3 }; // mark resolved/success
      }

      return { 
        ...state, 
        zones: newZones, 
        activeScenario: newScenario,
        crowd: {
          ...state.crowd,
          riskScore: Math.max(30, state.crowd.riskScore - 12),
          riskLevel: "Moderate"
        }
      };
    });
  },

  executeOverflow: (zoneId: string) => {
    const { addToast, addTimelineEvent } = get();
    set((state) => {
      const zone = state.zones.find(z => z.id === zoneId);
      if (!zone) return state;

      const newCapacity = zone.capacity + 500;
      
      const newZones = state.zones.map(z => {
        if (z.id === zoneId) {
          const history = [{ time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: "Protocol Atlas-3: Lane Opened (+500 cap)", actor: "Command Center" }, ...(z.actionHistory || [])].slice(0, 3);
          return { 
            ...z, 
            capacity: newCapacity, 
            status: getStatusColor((z.current / newCapacity) * 100), 
            actionHistory: history,
            aiRecommendation: `Protocol Atlas-3 complete. Effective capacity: ${newCapacity}.`
          };
        }
        return z;
      });

      addToast("🚪 Protocol Atlas-3 Active", `Overflow Lane open at ${zone.name}. capacity expanded to ${newCapacity}.`, "success");
      addTimelineEvent("Cortex AI", `Protocol Atlas-3: Lane expansion success at ${zone.name}. Congestion dropping.`, "success");

      // Inject task dynamically to volunteer tasks list
      import("./volunteerStore").then(({ useVolunteerStore }) => {
        useVolunteerStore.getState().addTask({
          title: "Protocol Atlas-3: Deploy lane barriers",
          description: `Assemble queue dividers and cones at Gate C Lane 4 to handle overflow crowds.`,
          priority: "high",
          zone: "Gate C",
          estimatedMinutes: 8,
          aiGenerated: true,
        });
      }).catch((e) => {
        console.warn("Failed to inject volunteer task:", e);
      });

      const scenario = state.activeScenario;
      let newScenario = scenario;
      if (scenario && scenario.name === "storm") {
        newScenario = { ...scenario, stage: 3 }; // mark resolved/success
      }

      return { 
        ...state, 
        zones: newZones, 
        activeScenario: newScenario,
        crowd: {
          ...state.crowd,
          riskScore: Math.max(30, state.crowd.riskScore - 8)
        }
      };
    });
  },

  toggleMonitoring: (zoneId: string, active: boolean) => {
    const { addTimelineEvent } = get();
    const state = get();
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone) return;

    if (active) {
      addTimelineEvent("Security", `Command Center initiated active live monitoring for ${zone.name}.`, "warning");
    } else {
      addTimelineEvent("Security", `Active live monitoring concluded for ${zone.name}.`, "info");
    }
  },

  tick: () => {
    set((state) => {
      const activeScenario = state.activeScenario;
      let zones = state.zones;
      const crowd = state.crowd;
      let timelineEvents = state.timelineEvents;
      let alerts = state.alerts;
      const vendors = state.vendors;
      const transport = state.transport;

      const nextScenario = getNextScenarioStage(activeScenario);
      if (activeScenario && nextScenario) {
        const nextStage = nextScenario.stage;

        // Add timeline events during scenario progression
        timelineEvents = [
          {
            id: `tle-tick-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            category: "Cortex AI",
            message: `${activeScenario.name} simulation progressing.`,
            severity: "warning" as const,
          },
          ...timelineEvents,
        ].slice(0, 50);

        // Add critical alert when reaching stage 2.5
        if (nextStage === 2.5) {
          alerts = [
            {
              id: `al-crit-${Date.now()}-${Math.random()}`,
              severity: "critical",
              title: "Gate A Crowd buildup",
              message: "buildup detected",
              zone: "Gate A",
              timestamp: new Date(),
              actionRequired: true,
              acknowledged: false,
            },
            ...alerts,
          ];
        }
      } else if (!activeScenario) {
        // Natural drifting in idle state
        zones = driftZonesTelemetry(zones);
      }

      const nextMatchMinute = Math.min(90, state.matchMinute + (state.isSimulating ? 1 : 0));

      return {
        zones,
        crowd,
        timelineEvents,
        alerts,
        vendors,
        transport,
        activeScenario: nextScenario,
        matchMinute: nextMatchMinute,
        lastUpdated: new Date()
      };
    });
  },

  tickAsync: async () => {
    const state = get();
    if (!state.activeScenario) {
      // If no active scenario, just do routine tick
      state.tick();
      return;
    }

    if (state.scenarioStageHeldAt) {
      // Wait for operator
      return;
    }

    try {
      const res = await fetch("/api/cortex/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: state.activeScenario.name,
          currentState: state,
        }),
      });
      const data = await res.json();
      
      if (!data.error) {
        set((prevState) => {
          let newAlerts = prevState.alerts;
          if (data.newAlerts?.length > 0) {
            newAlerts = [...data.newAlerts.map((a: Record<string, unknown>) => ({ ...a, id: `al-${Date.now()}-${Math.random()}`, timestamp: new Date() })), ...prevState.alerts];
          }

          let newEvents = prevState.timelineEvents;
          if (data.newTimelineEvents?.length > 0) {
            newEvents = [...data.newTimelineEvents.map((e: Record<string, unknown>) => ({ ...e, id: `tle-${Date.now()}-${Math.random()}`, timestamp: new Date() })), ...prevState.timelineEvents].slice(0, 50);
          }

          let newZones = prevState.zones;
          if (data.zoneUpdates?.length > 0) {
            newZones = prevState.zones.map(z => {
              const update = data.zoneUpdates.find((u: { id: string }) => u.id === z.id);
              return update ? { ...z, ...update } : z;
            });
          }

          // Trigger holding for operator approval at critical stages
          let heldAt = null;
          if (data.nextStage === 2.5) {
             heldAt = new Date();
             setTimeout(() => {
                const s = get().activeScenario;
                if (s && s.stage === 2.5) {
                  get().addTimelineEvent("Cortex AI", "Auto-Resolution: Protocol executed autonomously.", "warning");
                  set({ activeScenario: { ...s, stage: 3 }, scenarioStageHeldAt: null });
                }
             }, 30000);
          }

          return {
            ...prevState,
            alerts: newAlerts,
            timelineEvents: newEvents,
            zones: newZones,
            scenarioStageHeldAt: heldAt,
            activeScenario: { ...prevState.activeScenario!, stage: data.nextStage },
            matchMinute: Math.min(90, prevState.matchMinute + 1),
            crowd: {
              ...prevState.crowd,
              riskScore: data.riskScore || prevState.crowd.riskScore,
              riskLevel: data.riskLevel || prevState.crowd.riskLevel,
            }
          };
        });
      }
    } catch (err) {
      console.error("Failed to execute dynamic tick", err);
    }
  },

  autoAssignStaff: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedZones = state.zones.map(z => {
        if (z.id === "gate-a") {
          return { ...z, current: Math.max(1200, z.current - 400), status: "yellow" as const };
        }
        if (z.id === "food-a") {
          return { ...z, current: Math.max(250, z.current - 150), status: "green" as const };
        }
        if (z.id === "medical-2") {
          return { ...z, current: Math.max(3, z.current - 5), status: "green" as const, aiRecommendation: "✦ Cortex Recommendation: Routine Observation\n- **Reason**: Normal medical load.\n- **Evidence**: Occupancy drops to 15%.\n- **Prediction**: Load remains low through post-kickoff.\n- **Confidence**: 98%\n- **Expected Impact**: None.\n- **Risk**: None.\n- **ETA**: N/A.\n- **Affected Roles**: Medical.\n- **Rollback Plan**: N/A." };
        }
        return z;
      });

      const { addTask } = useVolunteerStore.getState();
      addTask({
        title: "Auto-Assigned Staff Deployment",
        description: "Assisting crowd redirection detours at Gate A and Food Court A.",
        priority: "medium",
        zone: "Gate A & Food Court A",
        estimatedMinutes: 15,
        aiGenerated: true
      });

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Auto-Assigned Staff Gaps", details: "AI Optimizer redeployed 23 staff members to Gate A and Food Court A." };

      addToast("👥 Staffing Auto-Assigned", "Critical gaps filled. Gate A is now staffed at 100%.", "success");
      addTimelineEvent("Staffing", "AI Optimizer redeployed 23 staff members to critical sectors (Gate A, Food Court A).", "success");

      const scenario = state.activeScenario;
      let newScenario = scenario;
      if (scenario && (scenario.name === "heat_stroke" || scenario.name === "metro_outage")) {
        newScenario = { ...scenario, stage: 3 };
      }

      return {
        ...state,
        zones: updatedZones,
        activeScenario: newScenario,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20),
        crowd: {
          ...state.crowd,
          riskScore: Math.max(25, state.crowd.riskScore - 15),
          riskLevel: "Moderate" as const
        }
      };
    });
  },


  activateGreenMenu: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedSus = {
        ...state.sustainability,
        carbonKg: Math.max(0, state.sustainability.carbonKg - 2100),
        wasteRecycledPercent: Math.min(100, state.sustainability.wasteRecycledPercent + 3),
        energyKwh: Math.max(0, state.sustainability.energyKwh - 50),
        aiScore: Math.min(100, state.sustainability.aiScore + 5),
        greenMenuActivated: true
      };

      const { addTask } = useVolunteerStore.getState();
      addTask({
        title: "Staff Kiosk 3 Food Court B (Green Menu)",
        description: "Support operations for the newly activated Green Menu. Help manage the plant-based concession queue at Food Court B.",
        priority: "high",
        zone: "Food Court B",
        estimatedMinutes: 10,
        aiGenerated: true
      });

      const updatedVendors = state.vendors.map((v) => 
        v.id === "v3" ? {
          ...v,
          name: "Global Bites (Green Menu Active)",
          popularItems: ["Vegan Tacos", "Plant-based Wraps", "Organic Salad"],
          efficiency: Math.min(100, v.efficiency + 5)
        } : v
      );

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Activated Green Menu", details: "Activated plant-based registers at Food Court B. Carbon decreased by 2.1t." };

      addToast("🥗 Green Menu Active", "Vegetable-only kiosks enabled at Food Court B registers.", "success");
      addTimelineEvent("Sustainability", "Protocol Green-Menu: Activated vegetable-only kiosk at Food Court B (-2.1t CO2 impact).", "info");

      return {
        ...state,
        sustainability: updatedSus,
        vendors: updatedVendors,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },

  dimArenaLights: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedSus = {
        ...state.sustainability,
        energyKwh: Math.max(0, state.sustainability.energyKwh - 180),
        carbonKg: Math.max(0, state.sustainability.carbonKg - 900),
        energyRenewablePercent: Math.min(100, state.sustainability.energyRenewablePercent + 4),
        aiScore: Math.min(100, state.sustainability.aiScore + 4),
        lightingDimmed: true
      };

      const updatedZones = state.zones.map((z) => 
        z.id === "gate-b" ? {
          ...z,
          status: "green" as const,
          actionHistory: [
            { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: "BMS applied -12% corridor lighting reduction", actor: "Cortex AI" },
            ...(z.actionHistory || [])
          ]
        } : z
      );

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Dimmed Concourse Lighting", details: "Dimmed Sector C concourse lights by 12%. Energy down by 180 kWh." };

      addToast("💡 Arena Lights Adjusted", "BMS applied -12% concourse lighting reduction in Sector C.", "success");
      addTimelineEvent("Operations", "Protocol Smart-Lighting: BMS applied -12% lighting reduction globally (-180 kWh impact).", "warning");

      return {
        ...state,
        sustainability: updatedSus,
        zones: updatedZones,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },

  rerouteShuttles: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedSus = {
        ...state.sustainability,
        carbonKg: Math.max(0, state.sustainability.carbonKg - 400),
        energyKwh: Math.max(0, state.sustainability.energyKwh - 100),
        publicTransportPercent: Math.min(100, state.sustainability.publicTransportPercent + 3),
        aiScore: Math.min(100, state.sustainability.aiScore + 6),
        shuttlesRerouted: true
      };

      const updatedTransport = state.transport.map((t) => 
        t.id === "tr-2" ? {
          ...t,
          departureIn: 4,
          duration: 24,
          crowding: "green" as const,
          recommended: true,
          aiNote: "Optimized Shuttle Rerouting Active — 11 min saved via express corridor"
        } : t.id === "tr-1" ? {
          ...t,
          recommended: false
        } : t
      );

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Rerouted Shuttles", details: "Rerouted 3 express buses via outer bypass. Carbon output cut by 0.4t." };

      addToast("🚌 Shuttle Rerouted", "Rerouted 3 transport buses via shorter routes to save emissions.", "success");
      addTimelineEvent("Transport", "Protocol Shuttle-Reroute: Shuttle routing optimized via express corridor (-0.4t CO2 impact).", "info");

      return {
        ...state,
        sustainability: updatedSus,
        transport: updatedTransport,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },


  dispatchWasteSort: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      // Dynamically add a task to the volunteer portal!
      const { addTask } = useVolunteerStore.getState();
      addTask({
        title: "Deploy Waste Sorting Chevrons",
        description: "Spectator trash bins in Section D are overflowing. Monitor recycling splits and sort litter.",
        priority: "medium",
        zone: "Section D",
        estimatedMinutes: 15,
        aiGenerated: true
      });

      addToast("♻️ Waste Task Dispatched", "Volunteer task generated for Section D bin sorting.", "success");
      addTimelineEvent("Sustainability", "Protocol Waste-Sort: Dispatched volunteers to Section D bin sorting stations (+8% recycling impact).", "info");

      return {
        ...state
      };
    });
  },

  incrementRecycling: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedSus = {
        ...state.sustainability,
        wasteRecycledPercent: Math.min(100, state.sustainability.wasteRecycledPercent + 8),
        aiScore: Math.min(100, state.sustainability.aiScore + 5)
      };

      addToast("♻️ Recycling KPI Increased", "Volunteer completed sorting at Section D; recycling index up +8%.", "success");
      addTimelineEvent("Sustainability", "Recycling index increased by 8% after volunteer sorted Section D bins.", "info");

      return {
        ...state,
        sustainability: updatedSus
      };
    });
  },

  startSimulation: () => set({ isSimulating: true }),
  stopSimulation: () => set({ isSimulating: false }),

  openKiosk4B: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedVendors = state.vendors.map((v) =>
        v.id === "v3" ? { ...v, queueLength: Math.max(1, v.queueLength - 5), waitMinutes: Math.max(1, v.waitMinutes - 3), efficiency: 89 } : v
      );
      const updatedZones = state.zones.map((z) =>
        z.id === "food-b" ? { ...z, status: "green" as const, queueLength: Math.max(1, (z.queueLength || 7) - 5) } : z
      );
      
      useVolunteerStore.getState().addTask({
        title: "Manage Concessions Queue Overflow",
        description: "Staff activated Kiosk 4B. Coordinate line placement and assist food service flow.",
        priority: "medium",
        zone: "Food Court B",
        estimatedMinutes: 10,
        aiGenerated: true,
      });

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Opened Kiosk 4B", details: "Activated secondary registers at Food Court B." };

      addToast("🍔 Concessions Kiosk Active", "Kiosk 4B registers online; concessions queues stabilized.", "success");
      addTimelineEvent("Facility", "Protocol Concessions-Kiosk: Opened secondary queue lanes at Food Court B.", "success");

      return {
        ...state,
        vendors: updatedVendors,
        zones: updatedZones,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },

  activateParkingC: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedZones = state.zones.map((z) => {
        if (z.id === "park-a") {
          return { ...z, current: Math.max(800, z.current - 450), status: "yellow" as const };
        }
        if (z.id === "park-c") {
          return { ...z, current: Math.min(z.capacity, z.current + 450), status: "yellow" as const };
        }
        return z;
      });

      useVolunteerStore.getState().addTask({
        title: "Deploy Traffic Guides — Lot C",
        description: "Guide arriving vehicles into secondary lanes at Parking Lot C to offset main entrance queues.",
        priority: "medium",
        zone: "Parking Lot C",
        estimatedMinutes: 12,
        aiGenerated: true,
      });

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Redirected Parking Lot C", details: "Diverted traffic to Parking Lot C to relieve load at Lot A." };

      addToast("🚗 Parking Redirect Initiated", "Diverting inbound traffic from Parking Lot A to Parking Lot C.", "success");
      addTimelineEvent("Operations", "Protocol Parking-Divert: Activated vehicular traffic diversion flow to Parking Lot C.", "warning");

      return {
        ...state,
        zones: updatedZones,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },

  deployMetroStaff: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedTransport = state.transport.map((t) =>
        t.id === "tr-1" ? { ...t, crowding: "green" as const, aiNote: "Volunteers active on platforms. Flow optimal." } : t
      );

      useVolunteerStore.getState().addTask({
        title: "Metro East Flow Management",
        description: "Guide fans onto platforms and prevent corridor build-ups.",
        priority: "medium",
        zone: "Metro East",
        estimatedMinutes: 15,
        aiGenerated: true,
      });

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Deployed Metro Staff", details: "Dispatched platform control to Metro East platform." };

      addToast("🚇 Metro Staff Deployed", "Redeployed platform volunteers to Metro East Station.", "success");
      addTimelineEvent("Transport", "Protocol Transit-Staff: Staff deployed to platform zones to manage egress bottlenecks.", "info");

      return {
        ...state,
        transport: updatedTransport,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },

  preStageConcessions: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedVendors = state.vendors.map((v) =>
        v.zone === "Food Court A" ? { ...v, waitMinutes: Math.max(2, v.waitMinutes - 4), efficiency: Math.min(100, v.efficiency + 10) } : v
      );

      const memoryEntry = { time: `${state.matchMinute}′`, action: "Staged Food Court A Inventory", details: "Inventory staged at Food Court A; wait times reduced." };

      addToast("🍔 Concessions Pre-Staging Active", "Inventory pre-stage signal sent; concession prep efficiency improved.", "success");
      addTimelineEvent("Facility", "Protocol Concessions-Stage: Inventory staging optimized at Food Court A.", "info");
      return {
        ...state,
        vendors: updatedVendors,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },

  broadcastEmergency: () => {
    const { addTimelineEvent, addAlert, addToast } = get();
    set((state) => {
      const updatedZones = state.zones.map((z) => ({
        ...z,
        status: "red" as const,
        current: Math.min(z.capacity, z.current + Math.floor(z.capacity * 0.05)),
        actionHistory: [
          { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: "Emergency Broadcast active - evacuate", actor: "Security OS" },
          ...(z.actionHistory || [])
        ].slice(0, 3)
      }));

      addAlert({
        severity: "critical",
        title: "EMERGENCY BROADCAST ACTIVE",
        message: "Command center activated emergency stadium-wide protocols. Assist all spectators to exits immediately.",
        zone: "All Zones",
        actionRequired: true,
        acknowledged: false,
      });

      import("./volunteerStore").then(({ useVolunteerStore }) => {
        useVolunteerStore.getState().addTask({
          title: "EMERGENCY EGRESS ROUTING SUPPORT",
          description: "Assist security staff with egress flows at your local sector. Clear exits and detours.",
          priority: "urgent",
          zone: "All Zones",
          estimatedMinutes: 30,
          aiGenerated: false,
        });
      }).catch(() => {});

      const memoryEntry = { time: `${state.matchMinute}′`, action: "🚨 Activated Emergency Broadcast", details: "Sent stadium-wide egress signals. Dispatched emergency volunteer chevrons." };

      addToast("🚨 EMERGENCY BROADCAST", "Emergency broadcast initiated. Green egress pathways active.", "critical");
      addTimelineEvent("Security", "Command Center initiated stadium-wide Emergency Egress broadcast.", "critical");

      return {
        ...state,
        zones: updatedZones,
        activeAnnouncement: "STADIUM EMERGENCY BROADCAST: Please follow the flashing green egress route signs to the nearest exit immediately.",
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20),
        crowd: {
          ...state.crowd,
          riskScore: 95,
          riskLevel: "Critical"
        }
      };
    });
  },

  closeGate: (zoneId: string) => {
    const { addTimelineEvent, addAlert, addToast } = get();
    set((state) => {
      const updatedZones = state.zones.map((z) => {
        if (z.id === zoneId) {
          return {
            ...z,
            status: "red" as const,
            flowRate: 0,
            actionHistory: [
              { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: "Gate closed temporarily by Operator.", actor: "Chen" },
              ...(z.actionHistory || [])
            ].slice(0, 3)
          };
        }
        return z;
      });

      const zoneName = state.zones.find(z => z.id === zoneId)?.name || zoneId;

      addAlert({
        severity: "warning",
        title: `${zoneName} Closed Temporarily`,
        message: `Operator Chen closed ${zoneName} to relieve bottleneck. Detours to alternative gates configured.`,
        zone: zoneName,
        actionRequired: true,
        acknowledged: false,
      });

      const memoryEntry = { time: `${state.matchMinute}′`, action: `Closed Gate ${zoneName} Turnstiles`, details: `Closed turnstile flow at ${zoneName} and queued detour announcements.` };

      addToast("🚪 Gate Closed", `${zoneName} has been temporarily deactivated. Detours active.`, "warning");
      addTimelineEvent("Security", `Gate turnstiles temporarily shut down at ${zoneName}. Detour routes active.`, "warning");

      return {
        ...state,
        zones: updatedZones,
        activeAnnouncement: `${zoneName} is temporarily closed. Please follow detour signs to other entrances.`,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },

  publishAnnouncement: (message: string | null) => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      if (message) {
        addToast("📢 Announcement Published", "Public announcement banner broadcasted successfully.", "success");
        addTimelineEvent("Operations", `Public announcement broadcasted: "${message}"`, "info");
      } else {
        addToast("📢 Announcement Cleared", "Public announcement banner cleared.", "info");
        addTimelineEvent("Operations", "Public announcement banner deactivated.", "info");
      }

      const memoryEntry = {
        time: `${state.matchMinute}′`,
        action: message ? "Published Announcement" : "Cleared Announcement",
        details: message ? `Broadcasted: "${message}"` : "Announcement cleared."
      };

      return {
        ...state,
        activeAnnouncement: message,
        cortexMemory: [...state.cortexMemory, memoryEntry].slice(-20)
      };
    });
  },
}));


