import { describe, it, expect, vi } from "vitest";
import { cn, formatNumber, formatPercent, lerp, clamp, getStatusColor, getRiskLabel, randomBetween, randomInt } from "../lib/utils";
import { validateEnv } from "../lib/env";

describe("Utils - General", () => {
  it("should combine class names using cn()", () => {
    expect(cn("text-black", { "bg-white": true, "hidden": false })).toBe("text-black bg-white");
    expect(cn("p-4 p-2")).toBe("p-2"); // tailwind-merge resolves conflicts
  });

  it("should format numbers with commas and decimals", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000.1234, 2)).toBe("1,000.12");
  });

  it("should format percentages correctly", () => {
    expect(formatPercent(45.6)).toBe("46%");
    expect(formatPercent(99.9)).toBe("100%");
    expect(formatPercent(0)).toBe("0%");
  });

  it("should lerp between values", () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(10, 20, 0.2)).toBe(12);
  });

  it("should clamp values between min and max", () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("should return the correct status color based on value", () => {
    expect(getStatusColor(50)).toBe("green");
    expect(getStatusColor(59.9)).toBe("green");
    expect(getStatusColor(60)).toBe("yellow");
    expect(getStatusColor(79.9)).toBe("yellow");
    expect(getStatusColor(80)).toBe("red");
    expect(getStatusColor(100)).toBe("red");
  });

  it("should return the correct risk label based on score", () => {
    expect(getRiskLabel(20)).toBe("Low");
    expect(getRiskLabel(50)).toBe("Moderate");
    expect(getRiskLabel(70)).toBe("High");
    expect(getRiskLabel(90)).toBe("Critical");
  });

  it("should generate random numbers between min and max", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(randomBetween(10, 20)).toBe(15);
    expect(randomInt(10, 20)).toBe(15);
    vi.restoreAllMocks();
  });
});

describe("Utils - Env Validator", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should throw error in production if required env is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.GEMINI_API_KEY;
    
    expect(() => validateEnv()).toThrow("Missing required environment variable: GEMINI_API_KEY");
  });

  it("should just log a warning in development if required env is missing", () => {
    process.env.NODE_ENV = "development";
    delete process.env.GEMINI_API_KEY;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    validateEnv();
    expect(warnSpy).toHaveBeenCalledWith("[StadiumOS] Missing required environment variable: GEMINI_API_KEY");
    warnSpy.mockRestore();
  });

  it("should do nothing if env is present", () => {
    process.env.GEMINI_API_KEY = "dummy-key";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    expect(() => validateEnv()).not.toThrow();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
