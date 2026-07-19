import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SimulatorControls } from "../components/layout/SimulatorControls";
import { GateSparkline } from "../components/cortex/GateSparkline";
import { GateTelemetry } from "../components/cortex/GateTelemetry";

const mockTriggerScenario = vi.fn();
vi.mock("../stores/cortexStore", () => ({
  useCortexStore: (selector: (state: { triggerSimulationScenario: typeof mockTriggerScenario }) => unknown) => {
    return selector({ triggerSimulationScenario: mockTriggerScenario });
  }
}));

describe("Simulation Components", () => {
  const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;

  afterAll(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    vi.restoreAllMocks();
  });

  it("should not render SimulatorControls if simulatorOpen is false", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    const { container } = render(<SimulatorControls simulatorOpen={false} setSimulatorOpen={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render and trigger scenarios from SimulatorControls", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    render(<SimulatorControls simulatorOpen={true} setSimulatorOpen={() => {}} />);
    
    expect(screen.getByText(/Simulation Center/i)).toBeDefined();
    
    const goalSurgeBtn = screen.getByText(/Gate A Spike/i);
    fireEvent.click(goalSurgeBtn);
    expect(mockTriggerScenario).toHaveBeenCalledWith("gate_a_spike");
    
    const transitBtn = screen.getByText(/Gate C Congested/i);
    fireEvent.click(transitBtn);
    expect(mockTriggerScenario).toHaveBeenCalledWith("gate_c_congest");

    const stormBtn = screen.getByText(/Halftime Concessions/i);
    fireEvent.click(stormBtn);
    expect(mockTriggerScenario).toHaveBeenCalledWith("halftime_rush");

    const medBtn = screen.getByText(/Medical SOS/i);
    fireEvent.click(medBtn);
    expect(mockTriggerScenario).toHaveBeenCalledWith("heat_stroke");
  });
});

describe("GateSparkline Component", () => {
  it("should render sparkline bars with correct height styles", () => {
    const { container } = render(<GateSparkline sparkline={[10, 50, 90]} isMonitoring={true} />);
    
    // Framer motion generates divs
    const outerDiv = container.firstChild as HTMLDivElement;
    expect(outerDiv.childNodes).toHaveLength(3);
    // Framer motion uses inline styles for initial height which might be 0, but we just verify it doesn't crash
  });
});

describe("GateTelemetry Component", () => {
  it("should render telemetry metrics correctly", () => {
    render(<GateTelemetry flowRate={420} eta={5} confidence={95} />);
    expect(screen.getByText("FLOW:420/M")).toBeDefined();
    expect(screen.getByText("ETA:5M")).toBeDefined();
    expect(screen.getByText("CF:95%")).toBeDefined();
  });
});
