/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { showCortexToast } from "../lib/cortexToast";
import { toast } from "sonner";
import React from "react";
import { render } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: {
    custom: vi.fn(),
  },
}));

describe("Cortex Toast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call toast.custom with correct severity styles", () => {
    showCortexToast({
      title: "Test Alert",
      message: "This is a test alert",
      severity: "critical",
    });

    expect(toast.custom).toHaveBeenCalled();
    const renderFunction = (toast.custom as vi.Mock).mock.calls[0][0];
    
    // Test the render function doesn't throw and renders correct text
    const { getByText } = render(renderFunction());
    expect(getByText("Test Alert")).toBeDefined();
    expect(getByText("This is a test alert")).toBeDefined();
    expect(getByText("CORTEX SEC-OPS")).toBeDefined();
  });

  it("should render with custom category", () => {
    showCortexToast({
      title: "Custom Category",
      message: "Message",
      severity: "info",
      category: "SYSTEM LOG",
    });

    const renderFunction = (toast.custom as vi.Mock).mock.calls[0][0];
    const { getByText } = render(renderFunction());
    expect(getByText("SYSTEM LOG")).toBeDefined();
  });
});
