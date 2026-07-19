import { useState, useEffect, useRef } from "react";
import { useCortexStore } from "@/stores/cortexStore";
import { showCortexToast } from "@/lib/cortexToast";
import type { StadiumZone } from "@/types";

export function useGateCardLogic(zone: StadiumZone, actionType: "redirect" | "monitor" | "expand", zoneId: string) {
  const activeProtocol   = useCortexStore((state) => state.activeProtocol);
  const startProtocol    = useCortexStore((state) => state.startProtocol);
  const setProtocolStatus = useCortexStore((state) => state.setProtocolStatus);
  const cancelProtocol   = useCortexStore((state) => state.cancelProtocol);
  const abortProtocol    = useCortexStore((state) => state.abortProtocol);
  const toggleChecklistItem = useCortexStore((state) => state.toggleChecklistItem);
  const toggleMonitoring = useCortexStore((state) => state.toggleMonitoring);


  const pct = Math.round((zone.current / zone.capacity) * 100);

  const isCurrentActiveProtocol = activeProtocol && activeProtocol.zoneId === zoneId;
  const workflowStep = isCurrentActiveProtocol ? activeProtocol.status : "idle";
  const execProgress = isCurrentActiveProtocol ? activeProtocol.progress : 0;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [displayPct, setDisplayPct] = useState(pct);
  const [displayFlowRate, setDisplayFlowRate] = useState(zone.flowRate || 120);
  const [displayEta, setDisplayEta] = useState(zone.criticalEta || 10);
  const [displayConfidence, setDisplayConfidence] = useState(zone.confidenceScore || 90);
  const [sparkline, setSparkline] = useState<number[]>(zone.densitySparkline || Array.from({ length: 20 }, () => pct));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const telemetryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smoothly animate percentage value
  useEffect(() => {
    const start = displayPct;
    const end = pct;
    if (start === end) return;

    let startTime: number | null = null;
    const duration = 1500;

    const animateNum = (now: number) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * ease);
      setDisplayPct(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateNum);
      }
    };
    requestAnimationFrame(animateNum);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  // Sync state variables
  useEffect(() => {
    if (zone.flowRate && !isMonitoring) setDisplayFlowRate(zone.flowRate);
    if (zone.criticalEta) setDisplayEta(zone.criticalEta);
    if (zone.confidenceScore) setDisplayConfidence(zone.confidenceScore);
    if (zone.densitySparkline) setSparkline(zone.densitySparkline);
  }, [zone.flowRate, zone.criticalEta, zone.confidenceScore, zone.densitySparkline, isMonitoring]);

  // Monitoring Mode Logic
  useEffect(() => {
    if (isMonitoring) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      telemetryIntervalRef.current = setInterval(() => {
        setDisplayFlowRate(prev => Math.max(80, Math.min(480, prev + Math.floor(Math.random() * 21) - 10)));
        setDisplayEta(prev => Math.max(2, Math.min(45, prev + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0))));
        setDisplayConfidence(prev => Math.max(85, Math.min(99, prev + (Math.random() > 0.5 ? 1 : -1))));
        setSparkline(prev => {
          const next = [...prev.slice(1)];
          const drift = Math.max(10, Math.min(98, prev[prev.length - 1] + Math.floor(Math.random() * 9) - 4));
          next.push(drift);
          return next;
        });
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    };
  }, [isMonitoring]);

  // Execution Progress Timer
  useEffect(() => {
    if (workflowStep === "executing") {
      let currentProgress = execProgress;
      const interval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setProtocolStatus("executing", 100);
          transitionTimeoutRef.current = setTimeout(() => {
            setProtocolStatus("verifying");
          }, 300);
        } else {
          setProtocolStatus("executing", currentProgress);
        }
      }, 200);
      progressIntervalRef.current = interval;
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [workflowStep, execProgress, setProtocolStatus]);

  // Verification step timing
  useEffect(() => {
    if (workflowStep === "verifying") {
      const timer = setTimeout(() => {
        setProtocolStatus("success");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [workflowStep, setProtocolStatus]);

  // Success step timing
  useEffect(() => {
    if (workflowStep === "success") {
      const timer = setTimeout(() => {
        cancelProtocol();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [workflowStep, cancelProtocol]);

  const handleActionClick = () => {
    if (actionType === "monitor") {
      const targetState = !isMonitoring;
      setIsMonitoring(targetState);
      toggleMonitoring(zoneId, targetState);

      showCortexToast({
        title: targetState ? "Telemetry Link Active" : "Telemetry Link Closed",
        message: targetState 
          ? `Live monitor and sensor sync active for ${zone.name}.` 
          : `Sensor connection closed for ${zone.name}.`,
        severity: targetState ? "info" : "success",
        category: "CCTV MONITOR"
      });
      return;
    }

    if (workflowStep === "idle") {
      const pName = actionType === "redirect" ? "Protocol Delta-2" : "Protocol Atlas-3";
      const pTitle = actionType === "redirect" ? "Crowd Redistribution" : "Overflow Lane Activation";
      startProtocol(zoneId, pName, pTitle);

      showCortexToast({
        title: "Protocol Review Initiated",
        message: `Analyzing Cortex operational recommendation details for ${zone.name}.`,
        severity: "info",
      });
    }
  };

  const approveProtocol = () => {
    setProtocolStatus("executing");
    showCortexToast({
      title: "Protocol Approved by Operator",
      message: `Human supervisor authorized execution of protocol. Initiating overrides...`,
      severity: "success",
    });
  };

  const cancelProtocolClick = () => {
    cancelProtocol();
    showCortexToast({
      title: "Protocol Rejected",
      message: `Operator cancelled recommendation. Monitoring continuously.`,
      severity: "warning",
    });
  };

  return {
    isMonitoring,
    elapsedTime,
    displayPct,
    displayFlowRate,
    displayEta,
    displayConfidence,
    sparkline,
    workflowStep,
    execProgress,
    handleActionClick,
    approveProtocol,
    cancelProtocolClick,
    abortProtocol,
    toggleChecklistItem,
    activeProtocol,
  };
}
