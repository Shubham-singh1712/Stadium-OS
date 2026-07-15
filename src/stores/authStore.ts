import { create } from "zustand";
import { persist } from "zustand/middleware";
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
    badgeId: "VOL-2026-4421",
  },
  security: {
    id: "sec-001",
    name: "Officer Chen",
    role: "security",
    language: "en",
    badgeId: "SEC-2026-0892",
  },
  operations: {
    id: "ops-001",
    name: "Dr. Priya Nair",
    role: "operations",
    language: "en",
    badgeId: "OPS-2026-CHIEF",
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        if (typeof window !== "undefined") {
          document.cookie = `user_role=${user.role}; path=/; SameSite=Strict; Secure`;
        }
        set({ user, isAuthenticated: true });
      },
      setRole: (role) => {
        const user = DEMO_USERS[role];
        if (typeof window !== "undefined") {
          document.cookie = `user_role=${role}; path=/; SameSite=Strict; Secure`;
        }
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "stadium-os-auth",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const decrypted = decodeURIComponent(atob(str));
            const parsed = JSON.parse(decrypted);
            if (parsed && parsed.state && parsed.state.user) {
              document.cookie = `user_role=${parsed.state.user.role}; path=/; SameSite=Strict; Secure`;
            }
            return parsed;
          } catch (e) {
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          const str = JSON.stringify(value);
          const encrypted = btoa(encodeURIComponent(str));
          localStorage.setItem(name, encrypted);
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
        },
      }
    }
  )
);
