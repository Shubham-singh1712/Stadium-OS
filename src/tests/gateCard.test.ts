import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGateCardLogic } from "../hooks/useGateCardLogic";
import { useCortexStore } from "../stores/cortexStore";
import type { StadiumZone } from "../types";

// Mock cortex toast to avoid console logs / dependencies
vi.mock("../lib/cortexToast", () => ({
  showCortexToast: vi.fn(),
}));

describe("useGateCardLogic", () => {
  const mockZone: StadiumZone = {
    id: "gate-a",
    name: "Gate A",
    type: "gate",
    capacity: 2000,
    current: 1200,
    status: "yellow",
    x: 20,
    y: 10,
    flowRate: 150,
    confidenceScore: 92,
    criticalEta: 8,
    densitySparkline: [60, 60, 60],
  };

  it("should initialize correct default telemetry data", () => {
    const { result } = renderHook(() => useGateCardLogic(mockZone, "monitor", "gate-a"));

    expect(result.current.displayPct).toBe(60); // (1200/2000)*100
    expect(result.current.displayFlowRate).toBe(150);
    expect(result.current.displayConfidence).toBe(92);
    expect(result.current.displayEta).toBe(8);
  });

  it("should toggle monitoring state on handleActionClick for monitor actionType", () => {
    const { result } = renderHook(() => useGateCardLogic(mockZone, "monitor", "gate-a"));

    expect(result.current.isMonitoring).toBe(false);

    act(() => {
      result.current.handleActionClick();
    });

    expect(result.current.isMonitoring).toBe(true);

    act(() => {
      result.current.handleActionClick();
    });

    expect(result.current.isMonitoring).toBe(false);
  });

  it("should start recommendation protocol for redirect actionType", () => {
    const { result } = renderHook(() => useGateCardLogic(mockZone, "redirect", "gate-a"));

    act(() => {
      result.current.handleActionClick();
    });

    const active = useCortexStore.getState().activeProtocol;
    expect(active).toBeDefined();
    expect(active?.zoneId).toBe("gate-a");
  });
});
