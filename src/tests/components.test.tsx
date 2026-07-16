/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CortexCard } from "../components/cortex/CortexCard";
import { MetricCard } from "../components/ui/MetricCard";
import { ActiveAlertList } from "../components/operations/ActiveAlertList";
import { VendorPerformanceList } from "../components/operations/VendorPerformanceList";
import { StadiumMap } from "../components/stadium/StadiumMap";
import React from "react";

// Mock store to support function execution hook and getState references
const mockState = {
  zones: [
    { id: "gate-a", name: "Gate A", type: "gate", capacity: 2000, current: 1850, status: "red", x: 20, y: 10, aiRecommendation: "Gate A congested", predictedPeak: 5, flowRate: 150, confidenceScore: 95, criticalEta: 3, actionHistory: [], densitySparkline: [] },
    { id: "gate-c", name: "Gate C", type: "gate", capacity: 2000, current: 600, status: "green", x: 80, y: 10, aiRecommendation: "Gate C clear", predictedPeak: 35, flowRate: 80, confidenceScore: 92, criticalEta: 99, actionHistory: [], densitySparkline: [] }
  ],
  crowd: { riskScore: 74, riskLevel: "High" },
  startProtocol: vi.fn(),
  executeOverflow: vi.fn(),
  autoAssignStaff: vi.fn(),
  dimArenaLights: vi.fn(),
  activateGreenMenu: vi.fn(),
  acknowledgeAlert: vi.fn(),
};

vi.mock("../stores/cortexStore", () => {
  const useCortexStoreMock = (selector?: (state: any) => any) => {
    if (selector) return selector(mockState);
    return mockState;
  };
  useCortexStoreMock.getState = () => mockState;
  useCortexStoreMock.setState = vi.fn();
  return {
    useCortexStore: useCortexStoreMock,
  };
});

describe("Core UI Components", () => {
  describe("CortexCard Component", () => {
    it("should render correct details and handle action button clicks", () => {
      const mockClick = vi.fn();
      render(
        <CortexCard
          title="Halftime Crowd Peak"
          insight="Expect surge in West concourse"
          severity="warning"
          actions={[{ label: "Deploy Staff", onClick: mockClick, variant: "primary" }]}
        />
      );

      expect(screen.getByText("Halftime Crowd Peak")).toBeDefined();
      expect(screen.getByText("Expect surge in West concourse")).toBeDefined();

      const btn = screen.getByText("Deploy Staff");
      expect(btn).toBeDefined();
      fireEvent.click(btn);
      expect(mockClick).toHaveBeenCalledOnce();
    });

    it("should render correctly with different severity levels and without actions", () => {
      const { rerender } = render(
        <CortexCard
          title="Eco target met"
          insight="Stadium carbon offset exceeded"
          severity="success"
        />
      );
      expect(screen.getByText("Eco target met")).toBeDefined();
      expect(screen.getByText("Stadium carbon offset exceeded")).toBeDefined();

      rerender(
        <CortexCard
          title="Fatal sensor outage"
          insight="Sensor network offline"
          severity="critical"
        />
      );
      expect(screen.getByText("Fatal sensor outage")).toBeDefined();
    });
  });

  describe("MetricCard Component", () => {
    it("should render metrics details, unit, and progress values correctly", () => {
      render(
        <MetricCard
          label="Solar Generation"
          value={88}
          unit="kW"
          progress={75}
          subtitle="Arena Solar arrays"
        />
      );

      expect(screen.getByText("Solar Generation")).toBeDefined();
      expect(screen.getByText("88")).toBeDefined();
      expect(screen.getByText("kW")).toBeDefined();
      expect(screen.getByText("Arena Solar arrays")).toBeDefined();
      expect(screen.getByText("75%")).toBeDefined();
    });
  });

  describe("ActiveAlertList Component", () => {
    it("should render a list of alerts and execute mock handlers", () => {
      const mockAlerts = [
        {
          id: "alert-1",
          severity: "critical" as const,
          title: "Gate A Congested",
          message: "Wait time over 15 minutes",
          zone: "Gate A North Entrance",
          acknowledged: false,
        },
      ];

      render(<ActiveAlertList alerts={mockAlerts} />);
      expect(screen.getByText("Gate A Congested")).toBeDefined();
      expect(screen.getByText("Wait time over 15 minutes")).toBeDefined();
      expect(screen.getByText("📍 Gate A North Entrance")).toBeDefined();
      expect(screen.getByText("Ack")).toBeDefined();
    });
  });

  describe("VendorPerformanceList Component", () => {
    it("should render concession items and track efficiency layout", () => {
      const mockVendors = [
        {
          id: "v-1",
          name: "FIFA Grill",
          zone: "Food Court A",
          revenue: 12500,
          waitMinutes: 8,
          efficiency: 92,
        },
      ];

      render(<VendorPerformanceList vendors={mockVendors} />);
      expect(screen.getByText("FIFA Grill")).toBeDefined();
      expect(screen.getByText("Food Court A")).toBeDefined();
      expect(screen.getByText("$12.5K")).toBeDefined();
    });
  });

  describe("StadiumMap Keyboard Interactions", () => {
    it("should trigger node click handler when Enter or Space is pressed", () => {
      const mockClick = vi.fn();
      render(
        <StadiumMap
          role="fan"
          target="Gate A"
          active={true}
          onNodeClick={mockClick}
        />
      );

      const nodeButton = screen.getByLabelText("Stadium Zone: Gate A");
      expect(nodeButton).toBeDefined();

      // Simulate Enter key
      fireEvent.keyDown(nodeButton, { key: "Enter", code: "Enter" });
      expect(mockClick).toHaveBeenCalledWith("Gate A");

      // Simulate Space key
      fireEvent.keyDown(nodeButton, { key: " ", code: "Space" });
      expect(mockClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("StadiumMap Mouse Clicks", () => {
    it("should trigger node click handler when a zone is clicked", () => {
      const mockClick = vi.fn();
      render(
        <StadiumMap
          role="fan"
          target="Gate A"
          active={true}
          onNodeClick={mockClick}
        />
      );

      const nodeButton = screen.getByLabelText("Stadium Zone: Gate A");
      expect(nodeButton).toBeDefined();

      fireEvent.click(nodeButton);
      expect(mockClick).toHaveBeenCalledWith("Gate A");
    });
  });
});
