import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../stores/authStore";

describe("Auth Store State Machine", () => {
  beforeEach(() => {
    // Reset state before each test run
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it("should initialize with unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should login correctly with setUser", () => {
    useAuthStore.getState().setUser({
      id: "ops-001",
      name: "Dr. Priya Nair",
      role: "operations",
      language: "en",
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Dr. Priya Nair");
    expect(state.user?.role).toBe("operations");
  });

  it("should switch roles correctly", () => {
    useAuthStore.getState().setRole("security");

    const state = useAuthStore.getState();
    expect(state.isHydrating).toBe(true);
  });

  it("should logout successfully", () => {
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
