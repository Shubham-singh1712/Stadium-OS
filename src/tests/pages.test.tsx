/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import OperationsPage from "../app/operations/page";
import SecurityPage from "../app/security/page";
import VolunteerIncidentsPage from "../app/volunteer/incidents/page";
import FanEmergencyPage from "../app/fan/emergency/page";
import TranslatePage from "../app/volunteer/translate/page";
import { HeaderBar as Header } from "../components/layout/HeaderBar";
import { SidebarNav as Sidebar } from "../components/layout/SidebarNav";
import { toast } from "sonner";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/operations",
}));

// Mock sonner toast library
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock Zustand store state
const mockStoreState = {
  zones: [
    { id: "gate-a", name: "Gate A", type: "gate", capacity: 2000, current: 1850, status: "red", x: 20, y: 10, aiRecommendation: "Protocol Delta-2 recommended", predictedPeak: 5, flowRate: 200, confidenceScore: 94, criticalEta: 4, actionHistory: [], densitySparkline: [] }
  ],
  crowd: {
    totalAttendance: 78420,
    capacity: 85000,
    occupancyRate: 92.3,
    riskScore: 74,
    riskLevel: "High",
    hotspots: ["Gate A"],
    densityHistory: [{ time: "18:00", density: 85, predicted: 88 }],
    prediction: "Halftime peak incoming"
  },
  alerts: [
    { id: "al-1", severity: "critical", title: "Gate A Crowd buildup", message: "buildup detected", zone: "Gate A", timestamp: new Date(), actionRequired: true, acknowledged: false }
  ],
  vendors: [
    { id: "v1", name: "FIFA Grill", zone: "Food Court A", queueLength: 34, waitMinutes: 18, revenue: 12400, efficiency: 62, popularItems: ["Hot Dog"], predictedRush: "Halftime" }
  ],
  transport: [],
  sustainability: { carbonKg: 42800, carbonTarget: 50000, wasteKg: 3200, wasteRecycledPercent: 68, energyKwh: 18400, energyRenewablePercent: 74, waterLiters: 284000, publicTransportPercent: 62, walkingDistanceKm: 8920, aiScore: 76, trend: "improving" },
  lastUpdated: new Date(),
  isSimulating: false,
  toasts: [],
  timelineEvents: [],
  activeScenario: null,
  activeProtocol: null,
  acknowledgeAlert: vi.fn(),
  dismissAlert: vi.fn(),
  addAlert: vi.fn(),
  addTimelineEvent: vi.fn(),
  addToast: vi.fn(),
  startProtocol: vi.fn(),
  setProtocolStatus: vi.fn(),
  cancelProtocol: vi.fn(),
  autoAssignStaff: vi.fn(),
  activateGreenMenu: vi.fn(),
  dimArenaLights: vi.fn(),
  triggerSimulationScenario: vi.fn(),
};

vi.mock("../stores/cortexStore", () => {
  const useCortexStoreMock = (selector?: (state: any) => any) => {
    if (selector) return selector(mockStoreState);
    return mockStoreState;
  };
  useCortexStoreMock.getState = () => mockStoreState;
  useCortexStoreMock.setState = vi.fn();
  return {
    useCortexStore: useCortexStoreMock,
  };
});

// Mock Volunteer Store
const mockVolunteerState = {
  addTask: vi.fn(),
};

vi.mock("../stores/volunteerStore", () => {
  const useVolunteerStoreMock = (selector?: (state: any) => any) => {
    if (selector) return selector(mockVolunteerState);
    return mockVolunteerState;
  };
  useVolunteerStoreMock.getState = () => mockVolunteerState;
  useVolunteerStoreMock.setState = vi.fn();
  return {
    useVolunteerStore: useVolunteerStoreMock,
  };
});

// Mock Auth Store
const mockAuthState = {
  user: { id: "ops-1", name: "Sara Mitchell", role: "operations", language: "en" },
  isAuthenticated: true,
  setUser: vi.fn(),
  setRole: vi.fn(),
  logout: vi.fn(),
};

vi.mock("../stores/authStore", () => {
  const useAuthStoreMock = (selector?: (state: any) => any) => {
    if (selector) return selector(mockAuthState);
    return mockAuthState;
  };
  useAuthStoreMock.getState = () => mockAuthState;
  useAuthStoreMock.setState = vi.fn();
  return {
    useAuthStore: useAuthStoreMock,
  };
});

describe("Page Integration & Dashboard Form Actions", () => {
  
  describe("Operations Dashboard Page", () => {
    it("should render operations metadata counters correctly", () => {
      render(<OperationsPage />);
      expect(screen.getByText("Command Center")).toBeDefined();
      expect(screen.getByText("78,420")).toBeDefined(); // total attendance
    });
  });

  describe("Security Dashboard Page", () => {
    it("should render security overview details correctly", () => {
      render(<SecurityPage />);
      expect(screen.getByText("Security Command")).toBeDefined();
      expect(screen.getByText(/Gate A Crowd buildup/)).toBeDefined();
    });
  });

  describe("Volunteer Incident Form Submission", () => {
    it("should collect input details and submit the incident successfully", () => {
      render(<VolunteerIncidentsPage />);
      
      const typeSelect = screen.getByLabelText("Incident Type") as HTMLSelectElement;
      const locInput = screen.getByLabelText("Location / Zone") as HTMLInputElement;
      const descInput = screen.getByLabelText("Description") as HTMLTextAreaElement;
      const submitBtn = screen.getByText("🚨 Submit Incident Report");

      fireEvent.change(typeSelect, { target: { value: "Medical emergency" } });
      fireEvent.change(locInput, { target: { value: "Gate A Corridor 3" } });
      fireEvent.change(descInput, { target: { value: "Fan feeling dizzy" } });
      fireEvent.click(submitBtn);

      expect(screen.getByText("Incident Registered")).toBeDefined();
    });
  });

  describe("Fan Emergency SOS Dispatch", () => {
    it("should reject submission with empty incident details and show validation error", () => {
      render(<FanEmergencyPage />);
      const dispatchBtn = screen.getByText("🚨 Dispatch Help Now");

      fireEvent.click(dispatchBtn);

      // Should call toast.error
      expect(toast.error).toHaveBeenCalledWith("Please describe the incident.");
      // SOS Broadcasted should not be rendered
      expect(screen.queryByText("SOS Broadcasted")).toBeNull();
    });

    it("should accept incident details and dispatch help request", () => {
      render(<FanEmergencyPage />);

      const detailsInput = screen.getByLabelText(/Incident Details/) as HTMLTextAreaElement;
      const dispatchBtn = screen.getByText("🚨 Dispatch Help Now");

      fireEvent.change(detailsInput, { target: { value: "Fainting spectator" } });
      fireEvent.click(dispatchBtn);

      expect(screen.getByText("SOS Broadcasted")).toBeDefined();
    });
  });

  describe("Translation Speech & Select", () => {
    it("should render voice controls and selected language translations correctly", () => {
      vi.useFakeTimers();
      render(<TranslatePage />);

      const speechText = screen.getByLabelText("Fan says (English):") as HTMLTextAreaElement;
      const langSelect = screen.getByLabelText("Translate to:") as HTMLSelectElement;
      const translateBtn = screen.getByText("Translate →");

      fireEvent.change(speechText, { target: { value: "where is the bathroom" } });
      fireEvent.change(langSelect, { target: { value: "Spanish" } });
      fireEvent.click(translateBtn);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText(/¿Dónde está el baño\?/)).toBeDefined();
      vi.useRealTimers();
    });
  });

  describe("Dropdown Menu Toggle Interactions", () => {
    it("should open and close role switcher selection list inside Header", () => {
      const mockSetOpen = vi.fn();
      render(<Header roleMenuOpen={true} setRoleMenuOpen={mockSetOpen} />);
      
      const fanBtn = screen.getByText("Fan");
      expect(fanBtn).toBeDefined();
      fireEvent.click(fanBtn);
      expect(mockAuthState.setRole).toHaveBeenCalledWith("fan");
    });

    it("should trigger toggle collapse interactions inside Sidebar", () => {
      const mockSetCollapse = vi.fn();
      const mockSetSim = vi.fn();
      render(<Sidebar sidebarOpen={true} setSidebarOpen={mockSetCollapse} simulatorOpen={false} setSimulatorOpen={mockSetSim} />);

      const collapseBtn = screen.getByLabelText("Collapse sidebar");
      fireEvent.click(collapseBtn);
      expect(mockSetCollapse).toHaveBeenCalledWith(false);

      const simBtn = screen.getByLabelText("Toggle AI simulator console panel");
      fireEvent.click(simBtn);
      expect(mockSetSim).toHaveBeenCalledWith(true);
    });
  });
});
