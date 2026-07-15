import { create } from "zustand";
import type { VolunteerTask } from "@/types";

interface VolunteerState {
  tasks: VolunteerTask[];
  acceptTask: (id: string) => void;
  completeTask: (id: string) => void;
  addTask: (task: Omit<VolunteerTask, "id" | "status" | "createdAt">) => void;
}

const INITIAL_TASKS: VolunteerTask[] = [
  { id: "t1", title: "Manage Gate A crowd overflow", description: "Gate A is at 92% capacity. Direct fans to Gate C. Use redirect signs at junction 7A.", priority: "urgent", status: "pending", zone: "Gate A", estimatedMinutes: 15, aiGenerated: true, createdAt: new Date() },
  { id: "t2", title: "Open Food Court B kiosk 3", description: "Halftime rush predicted in 8 min. Open and staff kiosk 3 in Food Court B to absorb overflow.", priority: "high", status: "pending", zone: "Food Court B", estimatedMinutes: 10, aiGenerated: true, createdAt: new Date() },
  { id: "t3", title: "Assist fan in wheelchair — Section 112", description: "Fan requested mobility assistance near Row G. Bring wheelchair escort to Section 112.", priority: "high", status: "accepted", zone: "Section 112", estimatedMinutes: 8, aiGenerated: false, createdAt: new Date() },
  { id: "t4", title: "Restock restroom supplies — North", description: "Low supply alert triggered. Bring restroom kit from storage Room B to North Restroom.", priority: "medium", status: "pending", zone: "Restroom N", estimatedMinutes: 12, aiGenerated: false, createdAt: new Date() },
  { id: "t5", title: "Fan translation needed — Spanish", description: "Fan at Gate D information desk requires Spanish translation for ticketing issue.", priority: "medium", status: "pending", zone: "Gate D", estimatedMinutes: 5, aiGenerated: true, createdAt: new Date() },
  { id: "t6", title: "Patrol Parking Lot B exit", description: "Moderate congestion detected. Guide 3 vehicles to alternate exit row.", priority: "low", status: "completed", zone: "Parking B", estimatedMinutes: 20, aiGenerated: false, createdAt: new Date() },
];

export const useVolunteerStore = create<VolunteerState>((set) => ({
  tasks: INITIAL_TASKS,
  acceptTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "accepted" as const } : t
      ),
    })),
  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "completed" as const } : t
      ),
    })),
  addTask: (taskData) => {
    const newTask: VolunteerTask = {
      ...taskData,
      id: `t-${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },
}));
