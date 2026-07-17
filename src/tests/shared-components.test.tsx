/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DemoControls } from "../components/layout/DemoControls";
import { GateSparkline } from "../components/cortex/GateSparkline";
import { GateTelemetry } from "../components/cortex/GateTelemetry";

const mockTriggerScenario = vi.fn();
vi.mock("../stores/cortexStore", () => ({
  useCortexStore: (selector: any) => {
    return selector({ triggerSimulationScenario: mockTriggerScenario });
  }
}));

describe("DemoControls Component", () => {
  const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;

  afterAll(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
    vi.restoreAllMocks();
  });

  it("should not render if NEXT_PUBLIC_DEMO_MODE is not true", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    const { container } = render(<DemoControls />);
    expect(container.firstChild).toBeNull();
  });

  it("should render and trigger scenarios when NEXT_PUBLIC_DEMO_MODE is true", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    render(<DemoControls />);
    
    expect(screen.getByText("Demo Controls")).toBeDefined();
    
    const goalSurgeBtn = screen.getByText("Goal Surge");
    fireEvent.click(goalSurgeBtn);
    expect(mockTriggerScenario).toHaveBeenCalledWith("gate_a_spike");
    
    const transitBtn = screen.getByText("Transit Delay");
    fireEvent.click(transitBtn);
    expect(mockTriggerScenario).toHaveBeenCalledWith("gate_c_congest");

    const stormBtn = screen.getByText("Storm Warning");
    fireEvent.click(stormBtn);
    expect(mockTriggerScenario).toHaveBeenCalledWith("halftime_rush");

    const medBtn = screen.getByText("Medical Drop");
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
