// ─── User / Auth ─────────────────────────────────────────────────────────────

export type UserRole = "fan" | "volunteer" | "security" | "operations";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  language: string;
  sector?: string;
  badgeId?: string;
}

// ─── Status ───────────────────────────────────────────────────────────────────

export type StatusLevel = "green" | "yellow" | "red";
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

// ─── Stadium Zones ───────────────────────────────────────────────────────────

export type ZoneType =
  | "gate"
  | "food_court"
  | "restroom"
  | "parking"
  | "medical"
  | "security"
  | "seating"
  | "exit";

export interface StadiumZone {
  id: string;
  name: string;
  type: ZoneType;
  capacity: number;
  current: number;
  status: StatusLevel;
  x: number; // SVG x position (%)
  y: number; // SVG y position (%)
  aiRecommendation?: string;
  predictedPeak?: number; // minutes until peak
  queueLength?: number;
  // ── Telemetry Data ──
  flowRate?: number;
  confidenceScore?: number;
  criticalEta?: number;
  actionHistory?: Array<{ time: string; action: string; actor: string }>;
  densitySparkline?: number[];
}

// ─── Crowd Intelligence ───────────────────────────────────────────────────────

export interface CrowdDataPoint {
  time: string;
  density: number;
  predicted: number;
}

export interface CrowdIntelligence {
  totalAttendance: number;
  capacity: number;
  occupancyRate: number;
  riskScore: number;
  riskLevel: RiskLevel;
  hotspots: string[];
  densityHistory: CrowdDataPoint[];
  prediction: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  zone: string;
  timestamp: Date;
  actionRequired: boolean;
  acknowledged: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  category: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
}

// ─── Volunteer Tasks ──────────────────────────────────────────────────────────

export type TaskStatus = "pending" | "accepted" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  zone: string;
  estimatedMinutes: number;
  assignedTo?: string;
  aiGenerated: boolean;
  createdAt: Date;
}

// ─── Queues & Vendors ─────────────────────────────────────────────────────────

export interface VendorMetrics {
  id: string;
  name: string;
  zone: string;
  queueLength: number;
  waitMinutes: number;
  revenue: number;
  efficiency: number;
  popularItems: string[];
  predictedRush?: string;
}

// ─── Transport ────────────────────────────────────────────────────────────────

export interface TransportOption {
  id: string;
  type: "metro" | "bus" | "taxi" | "shuttle" | "walk";
  name: string;
  departureIn: number; // minutes
  duration: number; // minutes
  crowding: StatusLevel;
  recommended: boolean;
  aiNote?: string;
}

// ─── Sustainability ───────────────────────────────────────────────────────────

export interface SustainabilityMetrics {
  carbonKg: number;
  carbonTarget: number;
  wasteKg: number;
  wasteRecycledPercent: number;
  energyKwh: number;
  energyRenewablePercent: number;
  waterLiters: number;
  publicTransportPercent: number;
  walkingDistanceKm: number;
  aiScore: number;
  trend: "improving" | "neutral" | "worsening";
}

// ─── AI Copilot ───────────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string;
  role: "user" | "cortex";
  content: string;
  timestamp: Date;
  charts?: CopilotChart[];
  actions?: CopilotAction[];
}

export interface CopilotChart {
  type: "bar" | "line" | "area";
  title: string;
  data: Array<Record<string, unknown>>;
  keys: string[];
}

export interface CopilotAction {
  id: string;
  label: string;
  icon: string;
  variant: "primary" | "secondary" | "danger";
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavigationRoute {
  from: string;
  to: string;
  normalMinutes: number;
  optimizedMinutes: number;
  savedMinutes: number;
  steps: string[];
  reason: string;
  confidence: number;
}
