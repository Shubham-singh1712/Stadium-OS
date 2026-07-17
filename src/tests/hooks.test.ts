/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCortexSimulation } from "../hooks/useCortexSimulation";
import { useCortexStore } from "../stores/cortexStore";

vi.mock("../stores/cortexStore", () => ({
  useCortexStore: vi.fn(),
}));

describe("Hooks - useCortexSimulation", () => {
  const mockStartSimulation = vi.fn();
  const mockStopSimulation = vi.fn();
  const mockTick = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    (useCortexStore as any).mockReturnValue({
      startSimulation: mockStartSimulation,
      stopSimulation: mockStopSimulation,
      tick: mockTick,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should start simulation on mount and trigger ticks", () => {
    renderHook(() => useCortexSimulation(1000));
    
    expect(mockStartSimulation).toHaveBeenCalledTimes(1);
    
    expect(mockTick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mockTick).toHaveBeenCalledTimes(1);
    
    vi.advanceTimersByTime(2000);
    expect(mockTick).toHaveBeenCalledTimes(3);
  });

  it("should stop simulation on unmount", () => {
    const { unmount } = renderHook(() => useCortexSimulation(1000));
    
    mockStopSimulation.mockClear();
    unmount();
    expect(mockStopSimulation).toHaveBeenCalledTimes(1);
    
    // Ensure timer is cleared
    vi.advanceTimersByTime(1000);
    expect(mockTick).not.toHaveBeenCalled(); // Still 0 because timer is cleared
  });
});
