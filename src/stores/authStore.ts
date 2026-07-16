import { create } from "zustand";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  fan: {
    id: "fan-001",
    name: "Alex Rivera",
    role: "fan",
    language: "en",
    sector: "Section 112, Row G, Seat 14",
  },
  volunteer: {
    id: "vol-001",
    name: "Sara Mitchell",
    role: "volunteer",
    language: "en",
    sector: "East Wing",
  },
  security: {
    id: "sec-001",
    name: "Officer Chen",
    role: "security",
    language: "en",
  },
  operations: {
    id: "ops-001",
    name: "Dr. Priya Nair",
    role: "operations",
    language: "en",
  },
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: true });
    if (typeof window !== "undefined") {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      }).catch(() => {});
    }
  },
  setRole: (role) => {
    // Synchronously set placeholder user for test and initial page load speed
    const user = DEMO_USERS[role];
    set({ user, isAuthenticated: true });

    if (typeof window !== "undefined") {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        })
        .catch(() => {});
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      fetch("/api/auth/session", {
        method: "DELETE",
      }).catch(() => {});
    }
  },
}));
