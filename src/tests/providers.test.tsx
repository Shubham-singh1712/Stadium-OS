/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import { Providers } from "../components/Providers";
import { useAuthStore } from "../stores/authStore";

// Mock the simulation hook
vi.mock("../hooks/useCortexSimulation", () => ({
  useCortexSimulation: vi.fn(),
}));

describe("Providers Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isHydrating: true });
    global.fetch = vi.fn();
  });

  it("should render children and initialize lang and session", async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: async () => ({ user: { id: "1", role: "fan", language: "es" } }),
    });

    const { getByText } = render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    );

    expect(getByText("Test Child")).toBeDefined();

    await waitFor(() => {
      expect(useAuthStore.getState().isHydrating).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.language).toBe("es");
      expect(document.documentElement.lang).toBe("es");
    });
  });

  it("should handle failed session fetch gracefully", async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error("Network Error"));

    render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    );

    await waitFor(() => {
      expect(useAuthStore.getState().isHydrating).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
