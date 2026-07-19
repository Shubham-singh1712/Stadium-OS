import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/operations",
  useSearchParams: () => ({
    get: (key: string) => (key === "target" ? "Food Court B" : null),
  }),
}));

// Mock sonner toast library
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock scrollIntoView for jsdom compatibility
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

// Mock Recharts ResponsiveContainer to avoid jsdom measurement errors
vi.mock("recharts", async () => {
  const original = await vi.importActual("recharts");
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  };
});

// Mock Zustand store state
const mockStoreState = {
  zones: [
    { id: "gate-a", name: "Gate A", type: "gate", capacity: 2000, current: 1850, status: "red", x: 20, y: 10, aiRecommendation: "Protocol Delta-2 recommended", predictedPeak: 5, flowRate: 200, confidenceScore: 94, criticalEta: 4, actionHistory: [], densitySparkline: [] },
    { id: "gate-c", name: "Gate C", type: "gate", capacity: 2000, current: 600, status: "green", x: 80, y: 10, aiRecommendation: "Routine Monitoring", predictedPeak: 35, flowRate: 100, confidenceScore: 98, criticalEta: 99, actionHistory: [], densitySparkline: [] },
    { id: "food-b", name: "Food Court B", type: "food_court", capacity: 500, current: 180, status: "green", x: 70, y: 35, aiRecommendation: "Activate Green Menu", predictedPeak: 22, queueLength: 7 },
    { id: "rest-north", name: "Restroom N", type: "restroom", capacity: 100, current: 45, status: "green", x: 40, y: 20, queueLength: 2 },
    { id: "rest-south", name: "Restroom S", type: "restroom", capacity: 100, current: 88, status: "red", x: 60, y: 75, queueLength: 12 },
    { id: "park-a", name: "Parking A", type: "parking", capacity: 1500, current: 1400, status: "red", x: 10, y: 85, predictedPeak: 12 },
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
    { id: "v1", name: "FIFA Grill", zone: "Food Court A", queueLength: 34, waitMinutes: 18, revenue: 12400, efficiency: 62, popularItems: ["Hot Dog"], predictedRush: "Halftime" },
    { id: "v3", name: "Global Bites", zone: "Food Court B", queueLength: 7, waitMinutes: 4, revenue: 5200, popularItems: ["Tacos"], predictedRush: "Halftime" }
  ],
  transport: [
    { id: "tr-1", type: "metro", name: "Metro Line 2", departureIn: 4, duration: 22, crowding: "green", recommended: true, aiNote: "Best route" },
    { id: "tr-2", type: "shuttle", name: "FIFA Official Shuttle", departureIn: 12, duration: 35, crowding: "yellow", recommended: false }
  ],
  sustainability: { carbonKg: 42800, carbonTarget: 50000, wasteKg: 3200, wasteRecycledPercent: 68, energyKwh: 18400, energyRenewablePercent: 74, waterLiters: 284000, publicTransportPercent: 62, walkingDistanceKm: 8920, aiScore: 76, trend: "improving" },
  lastUpdated: new Date(),
  isSimulating: false,
  toasts: [],
  timelineEvents: [
    { id: "e1", timestamp: new Date(), category: "Ticketing", message: "Gate A peak detected", severity: "warning" }
  ],
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
  rerouteShuttles: vi.fn(),
  dispatchWasteSort: vi.fn(),
  triggerSimulationScenario: vi.fn(),
};

vi.mock("../stores/cortexStore", () => {
  const useCortexStoreMock = (selector?: (state: typeof mockStoreState) => unknown) => {
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
  tasks: [
    { id: "t1", title: "Manage Gate A crowd overflow", description: "Gate A overflow.", priority: "urgent", status: "pending", zone: "Gate A", estimatedMinutes: 15, aiGenerated: true, createdAt: new Date() }
  ],
  addTask: vi.fn(),
  acceptTask: vi.fn(),
  completeTask: vi.fn(),
};

vi.mock("../stores/volunteerStore", () => {
  const useVolunteerStoreMock = (selector?: (state: typeof mockVolunteerState) => unknown) => {
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
  const useAuthStoreMock = (selector?: (state: typeof mockAuthState) => unknown) => {
    if (selector) return selector(mockAuthState);
    return mockAuthState;
  };
  useAuthStoreMock.getState = () => mockAuthState;
  useAuthStoreMock.setState = vi.fn();
  return {
    useAuthStore: useAuthStoreMock,
  };
});

// Import all pages for smoke testing
import FanPage from "../app/fan/page";
import FanFoodPage from "../app/fan/food/page";
import FanInterpreterPage from "../app/fan/interpreter/page";
import FanNavigationPage from "../app/fan/navigation/page";
import FanTransportPage from "../app/fan/transport/page";
import OperationsCopilotPage from "../app/operations/copilot/page";
import OperationsCrowdPage from "../app/operations/crowd/page";
import OperationsDigitalTwinPage from "../app/operations/digital-twin/page";
import OperationsStaffingPage from "../app/operations/staffing/page";
import OperationsSustainabilityPage from "../app/operations/sustainability/page";
import OperationsVendorsPage from "../app/operations/vendors/page";
import SecurityAlertsPage from "../app/security/alerts/page";
import SecurityCrowdPage from "../app/security/crowd/page";
import SecurityRoutingPage from "../app/security/routing/page";
import VolunteerPage from "../app/volunteer/page";
import VolunteerNavigatePage from "../app/volunteer/navigate/page";

describe("Smoke Testing - Page Views Rendering", () => {
  it("should render Fan dashboard view without crashing", () => {
    const { container } = render(<FanPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Fan Concessions page without crashing", () => {
    const { container } = render(<FanFoodPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Fan Live Interpreter page without crashing", () => {
    const { container } = render(<FanInterpreterPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Fan Navigation page without crashing", () => {
    const { container } = render(<FanNavigationPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Fan Transport page without crashing", () => {
    const { container } = render(<FanTransportPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Operations Copilot page without crashing", () => {
    const { container } = render(<OperationsCopilotPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Operations Crowd page without crashing", () => {
    const { container } = render(<OperationsCrowdPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Operations Digital Twin page without crashing", () => {
    const { container } = render(<OperationsDigitalTwinPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Operations Staffing page without crashing", () => {
    const { container } = render(<OperationsStaffingPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Operations Sustainability page without crashing", () => {
    const { container } = render(<OperationsSustainabilityPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Operations Vendors page without crashing", () => {
    const { container } = render(<OperationsVendorsPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Security Alerts page without crashing", () => {
    const { container } = render(<SecurityAlertsPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Security Crowd Map page without crashing", () => {
    const { container } = render(<SecurityCrowdPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Security Routing page without crashing", () => {
    const { container } = render(<SecurityRoutingPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Volunteer dashboard view without crashing", () => {
    const { container } = render(<VolunteerPage />);
    expect(container.firstChild).toBeDefined();
  });

  it("should render Volunteer Navigate map view without crashing", () => {
    const { container } = render(<VolunteerNavigatePage />);
    expect(container.firstChild).toBeDefined();
  });
});
