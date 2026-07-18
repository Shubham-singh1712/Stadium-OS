import { StadiumZone, Alert, VendorMetrics, TransportOption, TimelineEvent } from "@/types";
import { randomInt } from "@/lib/utils";

const INITIAL_ZONES: StadiumZone[] = [
  { 
    id: "gate-a", name: "Gate A", type: "gate", capacity: 2000, current: 1850, status: "red", x: 20, y: 10, 
    aiRecommendation: "✦ Cortex Recommendation: Protocol Delta-2 (Crowd Redistribution)\n- **Reason**: Turnstile gate bottlenecking turnstile throughput.\n- **Evidence**: Turnstile density over 92% capacity.\n- **Prediction**: Bottleneck will exceed safety thresholds in ~5 minutes.\n- **Confidence**: 95%\n- **Expected Impact**: Directs 25% of crowd to Gate C; pressure decreases to 69%.\n- **Risk**: Minimal queue lag at Gate C.\n- **ETA**: 4 minutes.\n- **Affected Roles**: Security, Volunteers, Fans.\n- **Rollback Plan**: Deactivate redirection protocols.", 
    predictedPeak: 5 
  },
  { 
    id: "gate-b", name: "Gate B", type: "gate", capacity: 2000, current: 1200, status: "yellow", x: 50, y: 8, 
    aiRecommendation: "✦ Cortex Recommendation: Protocol Echo-4 (Volunteer Reinforcement)\n- **Reason**: Inflow build-up from transit links.\n- **Evidence**: Queue wait time hits 12 minutes.\n- **Prediction**: Overflow risk within 15 minutes.\n- **Confidence**: 89%\n- **Expected Impact**: Deploys 5 volunteer guides; wait time falls below 5 minutes.\n- **Risk**: Sector F understaffed temporarily.\n- **ETA**: 10 minutes.\n- **Affected Roles**: Volunteers, Security.\n- **Rollback Plan**: Recall volunteers back to original posts.", 
    predictedPeak: 18 
  },
  { 
    id: "gate-c", name: "Gate C", type: "gate", capacity: 2000, current: 600, status: "green", x: 80, y: 10, 
    aiRecommendation: "✦ Cortex Recommendation: Routine Observation\n- **Reason**: Normal crowd traffic flows.\n- **Evidence**: Density rate stable at 30%.\n- **Prediction**: Flow remains optimal through halftime.\n- **Confidence**: 98%\n- **Expected Impact**: None.\n- **Risk**: None.\n- **ETA**: N/A.\n- **Affected Roles**: All.\n- **Rollback Plan**: N/A.", 
    predictedPeak: 35 
  },
  { 
    id: "gate-d", name: "Gate D", type: "gate", capacity: 2000, current: 900, status: "yellow", x: 90, y: 50, 
    aiRecommendation: "✦ Cortex Recommendation: Protocol Atlas-3 (Overflow Lane Activation)\n- **Reason**: Accumulating East Side ticketing lanes.\n- **Evidence**: Occupancy rate at 82%.\n- **Prediction**: Queue overflow expected at peak halftime egress.\n- **Confidence**: 92%\n- **Expected Impact**: Opens lane 4; effective capacity expands by +500.\n- **Risk**: Crowd flow intersects vehicle lanes.\n- **ETA**: 6 minutes.\n- **Affected Roles**: Command Center, Security.\n- **Rollback Plan**: Restrict lane 4 access, revert turnstile layout.", 
    predictedPeak: 20 
  },
  { 
    id: "food-a", name: "Food Court A", type: "food_court", capacity: 500, current: 420, status: "red", x: 30, y: 35, 
    aiRecommendation: "✦ Cortex Recommendation: Halftime Kiosk Expansion\n- **Reason**: Halftime food/drink concession surge.\n- **Evidence**: Concourse traffic models predict 95% occupancy.\n- **Prediction**: Wait times will spike to 28 minutes at halftime.\n- **Confidence**: 94%\n- **Expected Impact**: Activate Kiosk 4B; reduces Food Court A wait times by 10 minutes.\n- **Risk**: Increased volunteer coordinator oversight needed.\n- **ETA**: 8 minutes.\n- **Affected Roles**: Operations, Vendors, Volunteers.\n- **Rollback Plan**: Suspend Kiosk 4B cash registers.", 
    predictedPeak: 8, queueLength: 34 
  },
  { 
    id: "food-b", name: "Food Court B", type: "food_court", capacity: 500, current: 180, status: "green", x: 70, y: 35, 
    aiRecommendation: "✦ Cortex Recommendation: Sustainability Menu Sync\n- **Reason**: Low queue length and flow rate.\n- **Evidence**: Wait time at 4 minutes.\n- **Prediction**: Flow remains optimal. Carbon score can be improved.\n- **Confidence**: 97%\n- **Expected Impact**: Introduce Green Menu options.\n- **Risk**: Negligible fan item substitution pushback.\n- **ETA**: 15 minutes.\n- **Affected Roles**: Fans, Vendors.\n- **Rollback Plan**: Restore standard menu.", 
    predictedPeak: 22, queueLength: 7 
  },
  { 
    id: "food-c", name: "Food Court C", type: "food_court", capacity: 300, current: 240, status: "yellow", x: 50, y: 60, 
    aiRecommendation: "✦ Cortex Recommendation: Staffing Optimization\n- **Reason**: Moderate concession queue length.\n- **Evidence**: Queue wait time hits 9 minutes.\n- **Prediction**: Peak halftime influx will bottleneck queue registers.\n- **Confidence**: 91%\n- **Expected Impact**: Redeploy 2 volunteers from Sector B.\n- **Risk**: Sector B guides decrease by 1.\n- **ETA**: 12 minutes.\n- **Affected Roles**: Operations, Volunteers.\n- **Rollback Plan**: Return staff to Sector B.", 
    predictedPeak: 12, queueLength: 19 
  },
  { id: "rest-north", name: "Restroom N", type: "restroom", capacity: 100, current: 45, status: "green", x: 40, y: 20, queueLength: 2 },
  { id: "rest-south", name: "Restroom S", type: "restroom", capacity: 100, current: 88, status: "red", x: 60, y: 75, queueLength: 12 },
  { 
    id: "park-a", name: "Parking A", type: "parking", capacity: 1500, current: 1400, status: "red", x: 10, y: 85, 
    aiRecommendation: "✦ Cortex Recommendation: Parking Diversion Protocol\n- **Reason**: Lot capacity saturation.\n- **Evidence**: Active sensors check parking capacity at 93%.\n- **Prediction**: Complete lockout in ~12 minutes.\n- **Confidence**: 96%\n- **Expected Impact**: Diverts incoming vehicles to Parking C.\n- **Risk**: Minor vehicular routing delay on access ring-road.\n- **ETA**: 12 minutes.\n- **Affected Roles**: Operations Command, Fans.\n- **Rollback Plan**: Reactivate Parking A entry barriers.", 
    predictedPeak: 12 
  },
  { 
    id: "park-b", name: "Parking B", type: "parking", capacity: 1500, current: 850, status: "yellow", x: 50, y: 90, 
    aiRecommendation: "✦ Cortex Recommendation: Monitor Capacity\n- **Reason**: Moderate incoming vehicle parking flows.\n- **Evidence**: Capacity at 56%.\n- **Prediction**: Parking B will remain stable for next 30 minutes.\n- **Confidence**: 93%\n- **Expected Impact**: None.\n- **Risk**: None.\n- **ETA**: N/A.\n- **Affected Roles**: Operations.\n- **Rollback Plan**: N/A.", 
    predictedPeak: 30 
  },
  { 
    id: "park-c", name: "Parking C", type: "parking", capacity: 2000, current: 400, status: "green", x: 88, y: 85, 
    aiRecommendation: "✦ Cortex Recommendation: Recommend Parking C\n- **Reason**: Low lot occupancy.\n- **Evidence**: Occupancy rate is 20%.\n- **Prediction**: High availability expected through kickoff.\n- **Confidence**: 99%\n- **Expected Impact**: Promotes Parking C on Fan navigation feed.\n- **Risk**: Increased transit shuttle load.\n- **ETA**: Instant.\n- **Affected Roles**: Fans, Shuttles.\n- **Rollback Plan**: Terminate navigation route flags.", 
    predictedPeak: 60 
  },
  { id: "medical-1", name: "Medical Bay 1", type: "medical", capacity: 20, current: 3, status: "green", x: 25, y: 50 },
  { id: "medical-2", name: "Medical Bay 2", type: "medical", capacity: 20, current: 8, status: "yellow", x: 75, y: 50 },
  { id: "sec-1", name: "Security Post 1", type: "security", capacity: 50, current: 12, status: "green", x: 15, y: 50 },
  { id: "sec-2", name: "Security Post 2", type: "security", capacity: 50, current: 38, status: "yellow", x: 85, y: 50 },
];

export const ENHANCED_INITIAL_ZONES: StadiumZone[] = INITIAL_ZONES.map(z => {
  const occupancy = (z.current / z.capacity) * 100;
  return {
    ...z,
    flowRate: z.type === "gate" ? randomInt(150, 450) : randomInt(20, 100),
    confidenceScore: randomInt(88, 98),
    criticalEta: z.status === "red" ? randomInt(2, 8) : z.status === "yellow" ? randomInt(10, 30) : 99,
    actionHistory: [
      { time: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: "Routine monitoring active", actor: "System" }
    ],
    densitySparkline: Array.from({ length: 20 }, () => Math.max(0, Math.min(100, occupancy + randomInt(-5, 5)))),
  };
});

export const generateCrowdHistory = () => {
  const history = [];
  for (let i = 11; i >= 0; i--) {
    const hour = Math.floor(12 + (12 - i) / 2);
    const min = (12 - i) % 2 === 0 ? "00" : "30";
    history.push({
      time: `${hour}:${min}`,
      density: randomInt(45, 85),
      predicted: randomInt(50, 90),
    });
  }
  return history;
};

export const INITIAL_ALERTS: Alert[] = [
  { id: "al-1", severity: "critical", title: "Gate A Congestion", message: "Gate A at 92% capacity. Crowd buildup detected. Immediate action required.", zone: "Gate A", timestamp: new Date(), actionRequired: true, acknowledged: false },
  { id: "al-2", severity: "warning", title: "Food Court A Rush Predicted", message: "Halftime in 8 minutes. Food Court A projected to reach 95% capacity.", zone: "Food Court A", timestamp: new Date(), actionRequired: false, acknowledged: false },
  { id: "al-3", severity: "warning", title: "Parking A Near Full", message: "Parking Lot A will reach capacity in approximately 12 minutes.", zone: "Parking A", timestamp: new Date(), actionRequired: true, acknowledged: false },
  { id: "al-4", severity: "info", title: "Transport Peak Approaching", message: "Metro East Station crowding expected 30 minutes after final whistle.", zone: "Metro East", timestamp: new Date(), actionRequired: false, acknowledged: true },
];

export const INITIAL_VENDORS: VendorMetrics[] = [
  { id: "v1", name: "FIFA Grill", zone: "Food Court A", queueLength: 34, waitMinutes: 18, revenue: 12400, efficiency: 62, popularItems: ["Hot Dog", "Nachos"], predictedRush: "Halftime (8 min)" },
  { id: "v2", name: "World Cup Brews", zone: "Food Court A", queueLength: 28, waitMinutes: 14, revenue: 9800, efficiency: 70, popularItems: ["Beer", "Soda"], predictedRush: "Halftime (8 min)" },
  { id: "v3", name: "Global Bites", zone: "Food Court B", queueLength: 7, waitMinutes: 4, revenue: 5200, efficiency: 91, popularItems: ["Tacos", "Wraps"] },
  { id: "v4", name: "Fan Fuel", zone: "Food Court C", queueLength: 19, waitMinutes: 9, revenue: 7600, efficiency: 78, popularItems: ["Pizza", "Fries"] },
];

export const INITIAL_TRANSPORT: TransportOption[] = [
  { id: "tr-1", type: "metro", name: "Metro Line 2 — Stadium Direct", departureIn: 4, duration: 22, crowding: "green", recommended: true, aiNote: "Best option — 4 min to platform, arrives before crowd peak" },
  { id: "tr-2", type: "shuttle", name: "FIFA Official Shuttle", departureIn: 12, duration: 35, crowding: "yellow", recommended: false, aiNote: "Moderate crowding expected" },
  { id: "tr-3", type: "bus", name: "City Bus 47", departureIn: 8, duration: 45, crowding: "green", recommended: false },
  { id: "tr-4", type: "taxi", name: "Ride Share Zone B", departureIn: 2, duration: 28, crowding: "red", recommended: false, aiNote: "High demand — 12 min surge pricing active" },
];

export const INITIAL_TIMELINE: TimelineEvent[] = [
  { id: "e1", timestamp: new Date(Date.now() - 1000 * 60 * 15), category: "Ticketing", message: "Turnstile Gate A flow rate peak detected", severity: "warning" },
  { id: "e2", timestamp: new Date(Date.now() - 1000 * 60 * 12), category: "Security", message: "Officer Chen checked in at Sector C", severity: "info" },
  { id: "e3", timestamp: new Date(Date.now() - 1000 * 60 * 8), category: "AI Analytics", message: "Halftime crowd prediction computed: Restroom queue spike in 8 min", severity: "info" },
  { id: "e4", timestamp: new Date(Date.now() - 1000 * 60 * 5), category: "Facility", message: "Restroom South occupancy reaches 88%", severity: "warning" },
];
