import { create } from "zustand";
import {
  StadiumZone,
  CrowdIntelligence,
  Alert,
  VendorMetrics,
  SustainabilityMetrics,
  TransportOption,
  AlertSeverity,
  TimelineEvent,
} from "@/types";
import { randomBetween, randomInt, getStatusColor } from "@/lib/utils";
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
  status: "idle" | "review" | "executing" | "verifying" | "success";
  progress: number;
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
  addToast: (title: string, message: string, severity: Toast["severity"]) => void;
  dismissToast: (id: string) => void;
  addTimelineEvent: (category: string, message: string, severity: TimelineEvent["severity"]) => void;
  triggerSimulationScenario: (scenario: "heat_stroke" | "gate_a_spike" | "gate_c_congest" | "halftime_rush") => void;

  // Protocol Sync
  startProtocol: (zoneId: string, protocolName: string, protocolTitle: string) => void;
  setProtocolStatus: (status: ActiveProtocolState["status"], progress?: number) => void;
  cancelProtocol: () => void;

  // Security Operations
  executeRedirect: (zoneId: string, targetId: string) => void;
  executeOverflow: (zoneId: string) => void;
  toggleMonitoring: (zoneId: string, active: boolean) => void;

  // Staffing & Sustainability mutations
  autoAssignStaff: () => void;
  activateGreenMenu: () => void;
  dimArenaLights: () => void;
}

export const useCortexStore = create<CortexState>((set, get) => ({
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
    const { addAlert, addToast, addTimelineEvent } = get();

    // Map developer console clicks to structured event cascades
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
        progress: 0
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
      let activeScenario = state.activeScenario;
      let zones = state.zones;
      let crowd = state.crowd;
      let timelineEvents = state.timelineEvents;
      let alerts = state.alerts;
      let vendors = state.vendors;
      let transport = state.transport;

      // ─── Operational Scenario Events Cascade Engine ───
      if (activeScenario) {
        const stage = activeScenario.stage;
        const name = activeScenario.name;

        if (name === "goal_scored") {
          if (stage === 0) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Observation: Goal Scored by USA! Stadium excitement index spikes.", severity: "info" },
              ...timelineEvents
            ];
            activeScenario = { ...activeScenario, stage: 1 };
          } else if (stage === 1) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Analysis: Concourse movement increases. Concessions demand projections rising.", severity: "warning" },
              ...timelineEvents
            ];
            vendors = vendors.map(v => v.zone === "Food Court A" ? { ...v, waitMinutes: 28, queueLength: 48 } : v);
            activeScenario = { ...activeScenario, stage: 2 };
          } else if (stage === 2) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Prediction: Gate A bottleneck risk is Critical. Protocol Delta-2 recommended.", severity: "critical" },
              ...timelineEvents
            ];
            zones = zones.map(z => z.id === "gate-a" ? { 
              ...z, 
              current: 1940, 
              status: "red", 
              aiRecommendation: "✦ Cortex Recommendation: Protocol Delta-2 (Crowd Redistribution)\n- **Reason**: Excitement exit surge after USA goal.\n- **Evidence**: Spectator flow at turnstile turnstiles spikes to 420/min.\n- **Prediction**: Bottleneck critical overflow in ~3 minutes.\n- **Confidence**: 94%\n- **Expected Impact**: Divert 25% of spectators to Gate C.\n- **Risk**: Marginal queues increase at Gate C lanes.\n- **ETA**: 3 minutes.\n- **Affected Roles**: Command Center, Volunteers, Security.\n- **Rollback Plan**: Deactivate redirection." 
            } : z);
            crowd = { ...crowd, riskScore: 89, riskLevel: "Critical" };
            
            const newAlert: Alert = {
              id: `al-sc-${Date.now()}`,
              severity: "critical",
              title: "Gate A Congestion Spike",
              message: "AI prediction shows Gate A density will exceed 97% in 5 minutes.",
              zone: "Gate A",
              timestamp: new Date(),
              actionRequired: true,
              acknowledged: false
            };
            alerts = [newAlert, ...alerts];
            activeScenario = { ...activeScenario, stage: 2.5 }; // wait for operator approval (auto-resolves after 30s)
            if (!state.scenarioStageHeldAt) {
              setTimeout(() => {
                const s = get().activeScenario;
                if (s && s.stage === 2.5) {
                  get().executeRedirect("gate-a", "gate-c");
                  get().addTimelineEvent("Cortex AI", "Auto-Resolution: No operator response in 30s. Protocol Delta-2 executed autonomously.", "warning");
                  set({ activeScenario: { ...s, stage: 3 }, scenarioStageHeldAt: null });
                }
              }, 30000);
              set({ scenarioStageHeldAt: new Date() });
            }
          } else if (stage === 3) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Verification: Protocol Delta-2 complete. Gate A density drops to 69%. Flow stabilized.", severity: "success" },
              ...timelineEvents
            ];
            activeScenario = null;
          }
        } else if (name === "metro_outage") {
          if (stage === 0) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Observation: Metro Line 2 direct service delayed by 15 mins. Platform bottlenecks predicted.", severity: "warning" },
              ...timelineEvents
            ];
            activeScenario = { ...activeScenario, stage: 1 };
          } else if (stage === 1) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Analysis: Metro East crowding reaches warning threshold. Surge rideshare demand active.", severity: "warning" },
              ...timelineEvents
            ];
            transport = transport.map(t => t.id === "tr-1" ? { ...t, crowding: "red", departureIn: 18 } : t.id === "tr-4" ? { ...t, crowding: "red", departureIn: 1 } : t);
            activeScenario = { ...activeScenario, stage: 2 };
          } else if (stage === 2) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Recommendation: Protocol Nova-5 (Transport Optimization) suggested to direct shuttles.", severity: "info" },
              ...timelineEvents
            ];
            activeScenario = { ...activeScenario, stage: 2.5 };
            if (!state.scenarioStageHeldAt) {
              setTimeout(() => {
                const s = get().activeScenario;
                if (s && s.stage === 2.5) {
                  get().addTimelineEvent("Cortex AI", "Auto-Resolution: No operator response in 30s. Protocol Nova-5 executed autonomously. Auxiliary shuttles routed.", "warning");
                  set({ activeScenario: { ...s, stage: 3 }, scenarioStageHeldAt: null });
                }
              }, 30000);
              set({ scenarioStageHeldAt: new Date() });
            }
          } else if (stage === 3) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Verification: Protocol Nova-5 complete. Auxiliary shuttles deployed. Crowding relieved.", severity: "success" },
              ...timelineEvents
            ];
            transport = transport.map(t => t.id === "tr-2" ? { ...t, crowding: "green", departureIn: 4, recommended: true } : t);
            activeScenario = null;
          }
        } else if (name === "storm") {
          if (stage === 0) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Observation: Lightning warning active within 5km. Open seating evacuation advised.", severity: "critical" },
              ...timelineEvents
            ];
            activeScenario = { ...activeScenario, stage: 1 };
          } else if (stage === 1) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Analysis: Covered concourses occupancy spikes to 94%. Restroom North load yellow.", severity: "warning" },
              ...timelineEvents
            ];
            zones = zones.map(z => z.id === "rest-north" ? { ...z, status: "yellow", current: 82 } : z);
            activeScenario = { ...activeScenario, stage: 2 };
          } else if (stage === 2) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Prediction: Covered exits at Gate C will reach bottleneck risk. Protocol Atlas-3 recommended.", severity: "warning" },
              ...timelineEvents
            ];
            zones = zones.map(z => z.id === "gate-c" ? {
              ...z,
              status: "yellow",
              current: 1580,
              aiRecommendation: "✦ Cortex Recommendation: Protocol Atlas-3 (Capacity Expansion)\n- **Reason**: Spectator relocation due to lightning storm.\n- **Evidence**: Covered exit corridor density reaches 94%.\n- **Prediction**: Severe egress congestion in next 5 minutes.\n- **Confidence**: 91%\n- **Expected Impact**: Opens lane 4; increases Gate C capacity limits by +500.\n- **Risk**: Increased volunteer guide deployment complexity.\n- **ETA**: 5 minutes.\n- **Affected Roles**: Security, Volunteers.\n- **Rollback Plan**: Restore standard lanes config."
            } : z);
            activeScenario = { ...activeScenario, stage: 2.5 };
            if (!state.scenarioStageHeldAt) {
              setTimeout(() => {
                const s = get().activeScenario;
                if (s && s.stage === 2.5) {
                  get().executeOverflow("gate-c");
                  get().addTimelineEvent("Cortex AI", "Auto-Resolution: No operator response in 30s. Protocol Atlas-3 executed autonomously.", "warning");
                  set({ activeScenario: { ...s, stage: 3 }, scenarioStageHeldAt: null });
                }
              }, 30000);
              set({ scenarioStageHeldAt: new Date() });
            }
          } else if (stage === 3) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Verification: Protocol Atlas-3 complete. Overflow lanes active. Exit rates normal.", severity: "success" },
              ...timelineEvents
            ];
            activeScenario = null;
          }
        } else if (name === "heat_stroke") {
          if (stage === 0) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Observation: Spectator down in Section 112, Row G. Wearables detect vital drops.", severity: "warning" },
              ...timelineEvents
            ];
            activeScenario = { ...activeScenario, stage: 1 };
          } else if (stage === 1) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Analysis: Heat exhaustion risk. Medical post response recommended.", severity: "warning" },
              ...timelineEvents
            ];
            activeScenario = { ...activeScenario, stage: 2 };
          } else if (stage === 2) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Prediction: Critical vital threat in ~2 minutes. Recommendation pending operator dispatch.", severity: "critical" },
              ...timelineEvents
            ];
            zones = zones.map(z => z.id === "medical-2" ? {
              ...z,
              status: "red",
              aiRecommendation: "✦ Cortex Recommendation: Medical Dispatch\n- **Reason**: Heat stroke risk from high temperature.\n- **Evidence**: Wearable diagnostics flag body temp > 34C.\n- **Prediction**: Critical vital drop in ~2 minutes.\n- **Confidence**: 96%\n- **Expected Impact**: Deploy volunteer with hydration to Sector F.\n- **Risk**: Sector F guides decrease.\n- **ETA**: 2 minutes.\n- **Affected Roles**: Volunteers, Security, Medical.\n- **Rollback Plan**: Recall medical dispatcher if false alert."
            } : z);
            const newAlert: Alert = {
              id: `al-sc-${Date.now()}`,
              severity: "critical",
              title: "Spectator Heat Exhaustion",
              message: "Section 112, Row G spectator needs immediate first aid dispatch.",
              zone: "Medical Bay 2",
              timestamp: new Date(),
              actionRequired: true,
              acknowledged: false
            };
            alerts = [newAlert, ...alerts];
            activeScenario = { ...activeScenario, stage: 2.5 };
            if (!state.scenarioStageHeldAt) {
              setTimeout(() => {
                const s = get().activeScenario;
                if (s && s.stage === 2.5) {
                  get().autoAssignStaff();
                  get().addTimelineEvent("Cortex AI", "Auto-Resolution: No operator response in 30s. Medical dispatch executed autonomously by Cortex AI.", "warning");
                  set({ activeScenario: { ...s, stage: 3 }, scenarioStageHeldAt: null });
                }
              }, 30000);
              set({ scenarioStageHeldAt: new Date() });
            }
          } else if (stage === 3) {
            const id = `tle-sc-${Date.now()}`;
            timelineEvents = [
              { id, timestamp: new Date(), category: "Cortex AI", message: "Verification: Medical response complete. Spectator stabilized. Learning index updated.", severity: "success" },
              ...timelineEvents
            ];
            activeScenario = null;
          }
        }
      } else {
        // Routine Drifts if no event scenario is running
        zones = state.zones.map((zone) => {
          const delta = randomBetween(-20, 20);
          const current = Math.max(0, Math.min(zone.capacity, zone.current + delta));
          const occupancy = (current / zone.capacity) * 100;
          const sparkline = zone.densitySparkline ? [...zone.densitySparkline.slice(1), occupancy] : [];

          return {
            ...zone,
            current: Math.round(current),
            status: getStatusColor(occupancy),
            flowRate: zone.flowRate ? Math.max(0, zone.flowRate + randomInt(-8, 8)) : undefined,
            densitySparkline: sparkline,
          };
        });

        // Drift crowd metrics
        const newOccupancy = randomBetween(89, 93);
        const newRisk = randomBetween(65, 78);
        const riskLevel = newRisk < 30 ? "Low" : newRisk < 60 ? "Moderate" : newRisk < 80 ? "High" : "Critical";

        const now = new Date();
        const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
        const newHistory = [
          ...state.crowd.densityHistory.slice(1),
          { time: timeLabel, density: Math.round(newOccupancy), predicted: Math.round(newOccupancy + randomBetween(-3, 6)) },
        ];

        crowd = {
          ...state.crowd,
          occupancyRate: Math.round(newOccupancy * 10) / 10,
          riskScore: Math.round(newRisk),
          riskLevel: riskLevel as CortexState["crowd"]["riskLevel"],
          densityHistory: newHistory,
        };

        // Routine logs
        if (Math.random() > 0.8) {
          const categories = ["Security", "Sensor", "AI Analytics", "Facility"];
          const logs: Record<string, string[]> = {
            "Security": ["Patrol route sector D cleared", "CCTV diagnostics nominal"],
            "Sensor": ["Restroom North load normal", "Gate B ticketing rate stable"],
            "AI Analytics": ["Halftime predictions refined", "Concessions model synced"],
            "Facility": ["Waste bins recycled", "Light levels balanced"],
          };
          const cat = categories[Math.floor(Math.random() * categories.length)];
          const msg = logs[cat][Math.floor(Math.random() * logs[cat].length)];
          const id = `tle-tick-${Date.now()}`;
          timelineEvents = [
            { id, timestamp: new Date(), category: cat, message: msg, severity: "info" as const },
            ...state.timelineEvents.slice(0, 49)
          ];
        }
      }

      // If active protocol is in success state, automatically clear it after a short delay
      // but let it live for one tick cycle first.
      let activeProtocol = state.activeProtocol;
      if (activeProtocol && activeProtocol.status === "success") {
        // Keep it in success state so UI has time to display checkmark,
        // but let's clear it if the user reloads or on long periods.
      }

      return {
        zones,
        vendors,
        transport,
        timelineEvents,
        alerts,
        crowd,
        activeScenario,
        activeProtocol,
        lastUpdated: new Date(),
      };
    });
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
        aiScore: Math.min(100, state.sustainability.aiScore + 5)
      };

      addToast("🥗 Green Menu Active", "Vegetable-only kiosks enabled at Food Court B registers.", "success");
      addTimelineEvent("Sustainability", "Activated Green Menu at Food Court B registers (-2.1t CO2 impact).", "info");

      return {
        ...state,
        sustainability: updatedSus
      };
    });
  },

  dimArenaLights: () => {
    const { addTimelineEvent, addToast } = get();
    set((state) => {
      const updatedSus = {
        ...state.sustainability,
        energyKwh: Math.max(0, state.sustainability.energyKwh - 180),
        aiScore: Math.min(100, state.sustainability.aiScore + 4)
      };

      addToast("💡 Arena Lights Adjusted", "BMS applied -8% arena lighting reduction globally.", "success");
      addTimelineEvent("Operations", "BMS applied -8% lighting reduction globally (-180 kWh impact).", "warning");

      return {
        ...state,
        sustainability: updatedSus
      };
    });
  },

  startSimulation: () => set({ isSimulating: true }),
  stopSimulation: () => set({ isSimulating: false }),
}));
