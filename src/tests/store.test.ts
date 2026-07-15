import { describe, it, expect, beforeEach } from "vitest";
import { useCortexStore } from "../stores/cortexStore";

describe("Cortex Zustand Store", () => {
  beforeEach(() => {
    // Reset store to default configurations
    useCortexStore.setState({
      zones: useCortexStore.getState().zones,
      crowd: {
        totalAttendance: 78420,
        capacity: 85000,
        occupancyRate: 92.3,
        riskScore: 74,
        riskLevel: "High",
        hotspots: ["Gate A", "Food Court A", "Parking Lot A"],
        densityHistory: useCortexStore.getState().crowd.densityHistory,
        prediction: "Crowd will peak at halftime in ~8 minutes. Gates A and D expected at 95%+ capacity.",
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
      }
    });
  });

  it("should initialize with correct default values", () => {
    const state = useCortexStore.getState();
    expect(state.zones.length).toBeGreaterThan(0);
    expect(state.crowd.totalAttendance).toBe(78420);
    expect(state.sustainability.aiScore).toBe(76);
  });

  it("should execute autoAssignStaff successfully", () => {
    useCortexStore.getState().autoAssignStaff();
    const state = useCortexStore.getState();
    expect(state.crowd.riskScore).toBeLessThan(74);
    const gateA = state.zones.find(z => z.id === "gate-a");
    expect(gateA?.status).toBe("yellow");
  });

  it("should execute activateGreenMenu successfully", () => {
    useCortexStore.getState().activateGreenMenu();
    const state = useCortexStore.getState();
    expect(state.sustainability.carbonKg).toBeLessThan(42800);
    expect(state.sustainability.aiScore).toBeGreaterThan(76);
  });

  it("should execute dimArenaLights successfully", () => {
    useCortexStore.getState().dimArenaLights();
    const state = useCortexStore.getState();
    expect(state.sustainability.energyKwh).toBeLessThan(18400);
  });
});
