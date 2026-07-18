import { create } from "zustand";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  setHydrating: (state: boolean) => void;
}


export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,
  setHydrating: (state) => set({ isHydrating: state }),
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
  setRole: async (role) => {
    // Avoid synchronous placeholder state to prevent wrong role flashes
    // Instead, immediately rely on hydration sync
    set({ isHydrating: true });

    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        const data = await res.json();
        if (data.user) {
          set({ user: data.user, isAuthenticated: true, isHydrating: false });
        } else {
          set({ isHydrating: false });
        }
      } catch {
        set({ isHydrating: false });
      }
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
