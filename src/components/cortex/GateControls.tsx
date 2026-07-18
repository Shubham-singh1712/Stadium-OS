import { motion, AnimatePresence } from "framer-motion";

interface GateControlsProps {
  workflowStep: string;
  execProgress: number;
  protocolName: string;
  protocolTitle: string;
  isCritical: boolean;
  isWarning: boolean;
  isMonitoring: boolean;
  actionType: "redirect" | "monitor" | "expand";
  approveProtocol: () => void;
  cancelProtocolClick: () => void;
  handleActionClick: () => void;
  abortProtocol?: () => void;
  toggleChecklistItem?: (index: number) => void;
  activeProtocol?: {
    checklist?: { label: string; done: boolean }[];
  } | null;
}

export function GateControls({
  workflowStep,
  execProgress,
  protocolName,
  protocolTitle,
  isCritical,
  isWarning,
  isMonitoring,
  actionType,
  approveProtocol,
  cancelProtocolClick,
  handleActionClick,
  abortProtocol,
  toggleChecklistItem,
  activeProtocol
}: GateControlsProps) {
  const allChecked = activeProtocol?.checklist?.every((item) => item.done);

  return (
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <AnimatePresence mode="wait">
        {workflowStep === "review" ? (
          <motion.div key="review-buttons" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeProtocol?.checklist && (
              <fieldset style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)", border: "none", margin: 0 }}>
                <legend style={{ fontSize: "0.7rem", fontWeight: 700, color: "hsl(var(--foreground-muted))", padding: 0, marginBottom: "0.25rem" }}>PROTOCOL CHECKLIST</legend>
                {activeProtocol.checklist.map((item, idx: number) => (
                  <label key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem?.(idx)} style={{ cursor: "pointer" }} />
                    <span style={{ color: item.done ? "hsl(var(--foreground-muted))" : "hsl(var(--foreground))", textDecoration: item.done ? "line-through" : "none" }}>{item.label}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, opacity: allChecked ? 1 : 0.5 }}
                onClick={approveProtocol}
                disabled={!allChecked}
              >
                ⚡ Execute
              </button>
              <button 
                className="btn btn-ghost" 
                style={{ justifyContent: "center", fontSize: "0.8125rem" }}
                onClick={cancelProtocolClick}
              >
                ✕ Reject
              </button>
            </div>
          </motion.div>
        ) : workflowStep === "executing" ? (
          <motion.div
            key="executing-state"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "#000",
              border: "1px solid hsl(210, 90%, 50%)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 10px",
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "hsl(210, 90%, 65%)",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>&gt; CORTEX RUNNING: {protocolName}</span>
              <span>{execProgress}%</span>
            </div>
            <div style={{ height: "4px", width: "100%", background: "#111", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${execProgress}%`, background: "hsl(210, 90%, 60%)" }} />
            </div>
            <div style={{ fontSize: "0.6rem", color: "rgba(59, 130, 246, 0.6)" }}>
              {execProgress < 40 && "> SECURING ENCRYPTED CHANNEL..."}
              {execProgress >= 40 && execProgress < 80 && "> SIGNAGE API OVERRIDE: ACTIVE"}
              {execProgress >= 80 && "> DISPATCHING VOLUNTEER CHEVRONS..."}
            </div>
            <button
              style={{ marginTop: "4px", background: "hsl(0,84%,20%)", color: "hsl(0,84%,60%)", border: "1px solid hsl(0,84%,40%)", borderRadius: "4px", padding: "4px", fontSize: "0.6rem", cursor: "pointer", fontWeight: "bold" }}
              onClick={abortProtocol}
            >
              ABORT PROTOCOL
            </button>
          </motion.div>
        ) : workflowStep === "verifying" ? (
          <motion.div
            key="verifying-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid hsl(42,95%,58%)",
              borderRadius: "var(--radius-sm)",
              padding: "0.625rem",
              color: "hsl(42,95%,65%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "38px"
            }}
          >
            <span className="cortex-pulse" style={{ fontSize: "0.75rem", fontWeight: 700 }}>🔍 VERIFYING SENSOR CALIBRATION...</span>
          </motion.div>
        ) : workflowStep === "success" ? (
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid hsl(152,70%,50%)",
              borderRadius: "var(--radius-sm)",
              padding: "0.625rem",
              color: "hsl(152,70%,60%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "38px"
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: "bold" }}>✓</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{protocolName} SUCCESS</span>
          </motion.div>
        ) : (
          <motion.button
            key="normal-action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`btn ${isCritical ? "btn-danger" : isWarning ? "btn-primary" : isMonitoring ? "btn-ghost" : "btn-primary"}`}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              ...(isWarning ? { background: "hsl(42,95%,45%)", color: "#000" } : {}),
              ...(actionType === "monitor" && isMonitoring ? { borderColor: "hsl(210 90% 60%)", color: "hsl(210 90% 60%)" } : {})
            }}
            onClick={handleActionClick}
          >
            {actionType === "redirect" 
              ? "🔀 Review Protocol Delta-2" 
              : actionType === "expand" 
                ? "🚪 Review Protocol Atlas-3" 
                : isMonitoring 
                  ? "⏹ Stop Monitoring" 
                  : "📡 Monitor Live"}
          </motion.button>
        )}
      </AnimatePresence>

      <div style={{ textAlign: "center", fontSize: "0.625rem", color: "hsl(var(--foreground-subtle))" }}>
        {isMonitoring 
          ? "Sync active · streaming telemetry package" 
          : `System state checked: 100% operational`}
      </div>
    </div>
  );
}
