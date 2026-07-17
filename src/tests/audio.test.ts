/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { playAlertSynth } from "../lib/audio";

describe("Audio - playAlertSynth", () => {
  let mockOscillator: any;
  let mockGain: any;
  let createOscillatorMock: any;
  let createGainMock: any;

  beforeEach(() => {
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    mockGain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    createOscillatorMock = vi.fn(() => mockOscillator);
    createGainMock = vi.fn(() => mockGain);

    const MockAudioContext = class {
      currentTime = 10;
      destination = "mock-destination";
      createOscillator = createOscillatorMock;
      createGain = createGainMock;
    };

    vi.stubGlobal("window", {
      AudioContext: MockAudioContext,
      webkitAudioContext: MockAudioContext
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should play a critical alert correctly", () => {
    playAlertSynth("critical");

    expect(createOscillatorMock).toHaveBeenCalled();
    expect(createGainMock).toHaveBeenCalled();
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
    
    expect(mockOscillator.type).toBe("sawtooth");
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 10);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.01, 10.35);
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.35);
  });

  it("should play a non-critical alert correctly", () => {
    playAlertSynth("info");

    expect(mockOscillator.type).toBe("sine");
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 10);
    expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(1200, 10.15);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.01, 10.25);
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.25);
  });

  it("should handle absence of AudioContext gracefully", () => {
    vi.stubGlobal("window", {});
    expect(() => playAlertSynth("critical")).not.toThrow();
  });

  it("should catch and log errors", () => {
    vi.stubGlobal("window", {
      AudioContext: vi.fn(() => {
        throw new Error("Context failed");
      }),
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => playAlertSynth("critical")).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });
});
