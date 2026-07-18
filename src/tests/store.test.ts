import { describe, it, expect, beforeEach } from "vitest";
import { useCortexStore } from "../stores/cortexStore";
import { ENHANCED_INITIAL_ZONES } from "../stores/cortexInitialData";

// Reset store to a clean known state before each test
beforeEach(() => {
  useCortexStore.setState({
    zones: ENHANCED_INITIAL_ZONES.map(z => ({ ...z })), // deep-ish reset
    crowd: {
      totalAttendance: 78420,
      capacity: 85000,
      occupancyRate: 92.3,
      riskScore: 74,
      riskLevel: "High",
      hotspots: ["Gate A", "Food Court A", "Parking Lot A"],
      densityHistory: useCortexStore.getState().crowd.densityHistory,
      prediction: "Crowd will peak at halftime in ~8 minutes.",
    },
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
    alerts: [],
    toasts: [],
    timelineEvents: [],
    activeScenario: null,
    activeProtocol: null,
    scenarioStageHeldAt: null,
    isSimulating: false,
  });
});

// ─── Initialization ────────────────────────────────────────────────────────────

describe("CortexStore — Initialization", () => {
  it("should initialize with correct default crowd values", () => {
    const state = useCortexStore.getState();
    expect(state.crowd.totalAttendance).toBe(78420);
    expect(state.crowd.capacity).toBe(85000);
    expect(state.crowd.occupancyRate).toBe(92.3);
    expect(state.crowd.riskScore).toBe(74);
    expect(state.crowd.riskLevel).toBe("High");
  });

  it("should initialize with correct sustainability defaults", () => {
    const state = useCortexStore.getState();
    expect(state.sustainability.carbonKg).toBe(42800);
    expect(state.sustainability.aiScore).toBe(76);
    expect(state.sustainability.trend).toBe("improving");
  });

  it("should initialize with zones array populated", () => {
    const state = useCortexStore.getState();
    expect(state.zones.length).toBeGreaterThan(0);
    const gateA = state.zones.find(z => z.id === "gate-a");
    expect(gateA).toBeDefined();
    expect(gateA?.type).toBe("gate");
  });

  it("should start with no active scenario or protocol", () => {
    const state = useCortexStore.getState();
    expect(state.activeScenario).toBeNull();
    expect(state.activeProtocol).toBeNull();
    expect(state.isSimulating).toBe(false);
  });
});

// ─── Alert Actions ─────────────────────────────────────────────────────────────

describe("CortexStore — Alert Actions", () => {
  it("should add an alert via addAlert with auto-generated id and timestamp", () => {
    useCortexStore.getState().addAlert({
      severity: "critical",
      title: "Test Alert",
      message: "Gate A critical",
      zone: "Gate A",
      actionRequired: true,
      acknowledged: false,
    });
    const state = useCortexStore.getState();
    expect(state.alerts.length).toBe(1);
    expect(state.alerts[0].title).toBe("Test Alert");
    expect(state.alerts[0].id).toMatch(/^al-/);
    expect(state.alerts[0].timestamp).toBeInstanceOf(Date);
  });

  it("should acknowledge an alert by id", () => {
    useCortexStore.getState().addAlert({
      severity: "warning",
      title: "Gate B Warning",
      message: "Moderate crowd",
      zone: "Gate B",
      actionRequired: false,
      acknowledged: false,
    });
    const alertId = useCortexStore.getState().alerts[0].id;
    useCortexStore.getState().acknowledgeAlert(alertId);
    const state = useCortexStore.getState();
    expect(state.alerts[0].acknowledged).toBe(true);
  });

  it("should dismiss an alert by id, removing it", () => {
    useCortexStore.getState().addAlert({
      severity: "info",
      title: "Routine Check",
      message: "All clear",
      zone: "Gate C",
      actionRequired: false,
      acknowledged: false,
    });
    const alertId = useCortexStore.getState().alerts[0].id;
    useCortexStore.getState().dismissAlert(alertId);
    expect(useCortexStore.getState().alerts.length).toBe(0);
  });

  it("should prepend new alerts to the front of the alerts array", () => {
    useCortexStore.getState().addAlert({ severity: "info", title: "First", message: "m", zone: "A", actionRequired: false, acknowledged: false });
    useCortexStore.getState().addAlert({ severity: "critical", title: "Second", message: "m", zone: "B", actionRequired: true, acknowledged: false });
    const alerts = useCortexStore.getState().alerts;
    expect(alerts[0].title).toBe("Second");
    expect(alerts[1].title).toBe("First");
  });
});

// ─── Toast Actions ─────────────────────────────────────────────────────────────

describe("CortexStore — Toast Actions", () => {
  it("should add a toast with auto-generated id", () => {
    useCortexStore.getState().addToast("Alert Title", "Alert body", "critical");
    const state = useCortexStore.getState();
    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].title).toBe("Alert Title");
    expect(state.toasts[0].severity).toBe("critical");
  });

  it("should dismiss a toast by id", () => {
    useCortexStore.getState().addToast("T1", "m", "info");
    const id = useCortexStore.getState().toasts[0].id;
    useCortexStore.getState().dismissToast(id);
    expect(useCortexStore.getState().toasts.length).toBe(0);
  });
});

// ─── Timeline Events ───────────────────────────────────────────────────────────

describe("CortexStore — Timeline Events", () => {
  it("should add a timeline event at the front", () => {
    useCortexStore.getState().addTimelineEvent("Security", "Gate A cleared", "info");
    const state = useCortexStore.getState();
    expect(state.timelineEvents.length).toBeGreaterThan(0);
    expect(state.timelineEvents[0].category).toBe("Security");
    expect(state.timelineEvents[0].message).toBe("Gate A cleared");
  });

  it("should not exceed 50 timeline events (slices at 49)", () => {
    for (let i = 0; i < 60; i++) {
      useCortexStore.getState().addTimelineEvent("Test", `Event ${i}`, "info");
    }
    expect(useCortexStore.getState().timelineEvents.length).toBeLessThanOrEqual(50);
  });
});

// ─── Protocol Pipeline ─────────────────────────────────────────────────────────

describe("CortexStore — Protocol Pipeline", () => {
  it("should start a protocol with review status and 0 progress", () => {
    useCortexStore.getState().startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
    const state = useCortexStore.getState();
    expect(state.activeProtocol).not.toBeNull();
    expect(state.activeProtocol?.zoneId).toBe("gate-a");
    expect(state.activeProtocol?.protocolName).toBe("Protocol Delta-2");
    expect(state.activeProtocol?.status).toBe("review");
    expect(state.activeProtocol?.progress).toBe(0);
  });

  it("should advance protocol status to executing with progress", () => {
    useCortexStore.getState().startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
    useCortexStore.getState().setProtocolStatus("executing", 45);
    const state = useCortexStore.getState();
    expect(state.activeProtocol?.status).toBe("executing");
    expect(state.activeProtocol?.progress).toBe(45);
  });

  it("should advance protocol status to success", () => {
    useCortexStore.getState().startProtocol("gate-a", "Protocol Delta-2", "Crowd Redistribution");
    useCortexStore.getState().setProtocolStatus("success", 100);
    expect(useCortexStore.getState().activeProtocol?.status).toBe("success");
  });

  it("should cancel protocol and set activeProtocol to null", () => {
    useCortexStore.getState().startProtocol("gate-c", "Protocol Atlas-3", "Overflow Lane");
    useCortexStore.getState().cancelProtocol();
    expect(useCortexStore.getState().activeProtocol).toBeNull();
  });

  it("setProtocolStatus should be a no-op when no active protocol", () => {
    useCortexStore.getState().setProtocolStatus("executing", 50);
    expect(useCortexStore.getState().activeProtocol).toBeNull();
  });
});

// ─── Execute Redirect ─────────────────────────────────────────────────────────

describe("CortexStore — executeRedirect", () => {
  it("should reduce source zone crowd by 25% and add it to target zone", () => {
    const before = useCortexStore.getState();
    const gateA = before.zones.find(z => z.id === "gate-a");
    const gateC = before.zones.find(z => z.id === "gate-c");
    if (!gateA || !gateC) return;

    const dropAmount = Math.floor(gateA.current * 0.25);
    const expectedGateA = Math.max(0, gateA.current - dropAmount);

    useCortexStore.getState().executeRedirect("gate-a", "gate-c");

    const after = useCortexStore.getState();
    const updatedGateA = after.zones.find(z => z.id === "gate-a");
    expect(updatedGateA?.current).toBe(expectedGateA);
  });

  it("should reduce crowd riskScore after successful redirect", () => {
    const initialRisk = useCortexStore.getState().crowd.riskScore;
    useCortexStore.getState().executeRedirect("gate-a", "gate-c");
    const newRisk = useCortexStore.getState().crowd.riskScore;
    expect(newRisk).toBeLessThan(initialRisk);
  });

  it("should update riskLevel to Moderate after redirect", () => {
    useCortexStore.getState().executeRedirect("gate-a", "gate-c");
    expect(useCortexStore.getState().crowd.riskLevel).toBe("Moderate");
  });

  it("should be a no-op if source zone id does not exist", () => {
    const before = useCortexStore.getState().zones;
    useCortexStore.getState().executeRedirect("nonexistent-zone", "gate-c");
    const after = useCortexStore.getState().zones;
    expect(after).toEqual(before);
  });
});

// ─── Execute Overflow ─────────────────────────────────────────────────────────

describe("CortexStore — executeOverflow", () => {
  it("should expand gate-c capacity by 500", () => {
    const before = useCortexStore.getState().zones.find(z => z.id === "gate-c");
    if (!before) return;
    useCortexStore.getState().executeOverflow("gate-c");
    const after = useCortexStore.getState().zones.find(z => z.id === "gate-c");
    expect(after?.capacity).toBe(before.capacity + 500);
  });

  it("should add an actionHistory entry after overflow execution", () => {
    useCortexStore.getState().executeOverflow("gate-c");
    const zone = useCortexStore.getState().zones.find(z => z.id === "gate-c");
    expect(zone?.actionHistory?.length).toBeGreaterThan(0);
    expect(zone?.actionHistory?.[0].action).toContain("Atlas-3");
  });

  it("should reduce overall riskScore after overflow execution", () => {
    const initialRisk = useCortexStore.getState().crowd.riskScore;
    useCortexStore.getState().executeOverflow("gate-c");
    expect(useCortexStore.getState().crowd.riskScore).toBeLessThan(initialRisk);
  });

  it("should be a no-op if zone id does not exist", () => {
    const before = useCortexStore.getState().zones;
    useCortexStore.getState().executeOverflow("nonexistent-zone");
    expect(useCortexStore.getState().zones).toEqual(before);
  });
});

// ─── Sustainability Actions ───────────────────────────────────────────────────

describe("CortexStore — Sustainability Actions", () => {
  it("should reduce carbonKg after activateGreenMenu", () => {
    useCortexStore.getState().activateGreenMenu();
    expect(useCortexStore.getState().sustainability.carbonKg).toBeLessThan(42800);
  });

  it("should increase aiScore after activateGreenMenu", () => {
    useCortexStore.getState().activateGreenMenu();
    expect(useCortexStore.getState().sustainability.aiScore).toBeGreaterThan(76);
  });

  it("should reduce energyKwh after dimArenaLights", () => {
    useCortexStore.getState().dimArenaLights();
    expect(useCortexStore.getState().sustainability.energyKwh).toBeLessThan(18400);
  });

  it("should increase aiScore after dimArenaLights", () => {
    useCortexStore.getState().dimArenaLights();
    expect(useCortexStore.getState().sustainability.aiScore).toBeGreaterThan(76);
  });

  it("should cap aiScore at 100 even after multiple green actions", () => {
    useCortexStore.setState({ sustainability: { ...useCortexStore.getState().sustainability, aiScore: 98 } });
    useCortexStore.getState().activateGreenMenu();
    useCortexStore.getState().activateGreenMenu();
    expect(useCortexStore.getState().sustainability.aiScore).toBeLessThanOrEqual(100);
  });

  it("should reduce carbonKg after rerouteShuttles", () => {
    useCortexStore.getState().rerouteShuttles();
    expect(useCortexStore.getState().sustainability.carbonKg).toBeLessThan(42800);
  });

  it("should increase wasteRecycledPercent after dispatchWasteSort", () => {
    useCortexStore.getState().dispatchWasteSort();
    expect(useCortexStore.getState().sustainability.wasteRecycledPercent).toBeGreaterThan(68);
  });
});

// ─── Auto Assign Staff ────────────────────────────────────────────────────────

describe("CortexStore — autoAssignStaff", () => {
  it("should reduce gate-a crowd after auto-assign", () => {
    // Ensure gate-a is at its initial value (1850)
    const before = useCortexStore.getState().zones.find(z => z.id === "gate-a");
    if (!before) return;
    expect(before.current).toBe(1850); // verify reset worked
    useCortexStore.getState().autoAssignStaff();
    const after = useCortexStore.getState().zones.find(z => z.id === "gate-a");
    expect(after).toBeDefined();
    expect(after!.current).toBeLessThan(1850); // should have been reduced
  });

  it("should set gate-a status to yellow after auto-assign", () => {
    useCortexStore.getState().autoAssignStaff();
    const gateA = useCortexStore.getState().zones.find(z => z.id === "gate-a");
    expect(gateA?.status).toBe("yellow");
  });

  it("should reduce overall riskScore after auto-assign", () => {
    const initialRisk = useCortexStore.getState().crowd.riskScore;
    useCortexStore.getState().autoAssignStaff();
    expect(useCortexStore.getState().crowd.riskScore).toBeLessThan(initialRisk);
  });

  it("should set riskLevel to Moderate after auto-assign", () => {
    useCortexStore.getState().autoAssignStaff();
    expect(useCortexStore.getState().crowd.riskLevel).toBe("Moderate");
  });
});

// ─── Simulation Controls ──────────────────────────────────────────────────────

describe("CortexStore — Simulation Controls", () => {
  it("should set isSimulating to true on startSimulation", () => {
    useCortexStore.getState().startSimulation();
    expect(useCortexStore.getState().isSimulating).toBe(true);
  });

  it("should set isSimulating to false on stopSimulation", () => {
    useCortexStore.getState().startSimulation();
    useCortexStore.getState().stopSimulation();
    expect(useCortexStore.getState().isSimulating).toBe(false);
  });
});

// ─── Scenario Triggers ────────────────────────────────────────────────────────

describe("CortexStore — triggerSimulationScenario", () => {
  it("should set goal_scored scenario on gate_a_spike trigger", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_a_spike");
    const state = useCortexStore.getState();
    expect(state.activeScenario?.name).toBe("goal_scored");
    expect(state.activeScenario?.stage).toBe(0);
    expect(state.activeScenario?.maxStages).toBe(3);
  });

  it("should set metro_outage scenario on gate_c_congest trigger", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_c_congest");
    expect(useCortexStore.getState().activeScenario?.name).toBe("metro_outage");
  });

  it("should set storm scenario on halftime_rush trigger", () => {
    useCortexStore.getState().triggerSimulationScenario("halftime_rush");
    expect(useCortexStore.getState().activeScenario?.name).toBe("storm");
  });

  it("should set heat_stroke scenario on heat_stroke trigger", () => {
    useCortexStore.getState().triggerSimulationScenario("heat_stroke");
    expect(useCortexStore.getState().activeScenario?.name).toBe("heat_stroke");
  });

  it("should add a toast notification on scenario trigger", () => {
    useCortexStore.getState().triggerSimulationScenario("heat_stroke");
    expect(useCortexStore.getState().toasts.length).toBeGreaterThan(0);
  });
});

// ─── Tick Engine ──────────────────────────────────────────────────────────────

describe.skip("CortexStore — tick() engine", () => {
  it("should update lastUpdated timestamp on every tick", () => {
    const before = useCortexStore.getState().lastUpdated;
    useCortexStore.getState().tick();
    const after = useCortexStore.getState().lastUpdated;
    expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("should update crowd metrics on routine tick (no scenario)", () => {
    useCortexStore.getState().tick();
    const state = useCortexStore.getState();
    expect(state.crowd.occupancyRate).toBeGreaterThanOrEqual(0);
    expect(state.crowd.riskScore).toBeGreaterThanOrEqual(0);
  });

  it("should advance goal_scored scenario from stage 0 to 1 on tick", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_a_spike");
    expect(useCortexStore.getState().activeScenario?.stage).toBe(0);
    useCortexStore.getState().tick();
    expect(useCortexStore.getState().activeScenario?.stage).toBe(1);
  });

  it("should advance goal_scored scenario from stage 1 to 2 on tick", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_a_spike");
    useCortexStore.getState().tick(); // 0 → 1
    useCortexStore.getState().tick(); // 1 → 2
    expect(useCortexStore.getState().activeScenario?.stage).toBe(2);
  });

  it("should advance metro_outage scenario from stage 0 to 1 on tick", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_c_congest");
    useCortexStore.getState().tick();
    expect(useCortexStore.getState().activeScenario?.stage).toBe(1);
  });

  it("should advance storm scenario stage on tick", () => {
    useCortexStore.getState().triggerSimulationScenario("halftime_rush");
    useCortexStore.getState().tick();
    expect(useCortexStore.getState().activeScenario?.stage).toBe(1);
  });

  it("should advance heat_stroke scenario stage on tick", () => {
    useCortexStore.getState().triggerSimulationScenario("heat_stroke");
    useCortexStore.getState().tick();
    expect(useCortexStore.getState().activeScenario?.stage).toBe(1);
  });

  it("should add critical alert when goal_scored reaches stage 2", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_a_spike");
    useCortexStore.getState().tick(); // stage 0 → 1
    useCortexStore.getState().tick(); // stage 1 → 2
    useCortexStore.getState().tick(); // stage 2 → 2.5 (critical alert added here)
    const alerts = useCortexStore.getState().alerts;
    // Alert may be named differently; check for any critical alert from scenario
    const criticalAlerts = alerts.filter(a => a.severity === "critical");
    expect(criticalAlerts.length).toBeGreaterThan(0);
  });

  it("should add timeline events during scenario progression", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_a_spike");
    useCortexStore.getState().tick();
    const events = useCortexStore.getState().timelineEvents;
    expect(events.length).toBeGreaterThan(0);
  });

  it("should clear activeScenario when goal_scored reaches stage 3", () => {
    useCortexStore.getState().triggerSimulationScenario("gate_a_spike");
    useCortexStore.setState({ activeScenario: { name: "goal_scored", stage: 3, maxStages: 3 } });
    useCortexStore.getState().tick();
    expect(useCortexStore.getState().activeScenario).toBeNull();
  });
});
