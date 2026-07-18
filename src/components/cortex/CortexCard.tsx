"use client";

import { motion } from "framer-motion";

interface CortexCardProps {
  title: string;
  insight: string;
  actions?: Array<{ label: string; onClick: () => void; variant?: "primary" | "success" | "danger" | "ghost" }>;
  severity?: "info" | "warning" | "critical" | "success";
  icon?: string;
  className?: string;
  animate?: boolean;
}

const SEVERITY_STYLES = {
  info: {
    border: "hsl(210 90% 60% / 0.3)",
    bg: "hsl(210 90% 60% / 0.06)",
    accent: "hsl(210 90% 60%)",
    leftBorder: "hsl(var(--accent-blue))",
    badge: "ℹ️ Cortex AI",
    badgeBg: "hsl(210 90% 60% / 0.12)",
    badgeColor: "hsl(210 90% 70%)",
  },
  warning: {
    border: "hsl(42 95% 58% / 0.3)",
    bg: "hsl(42 95% 58% / 0.06)",
    accent: "hsl(42 95% 58%)",
    leftBorder: "hsl(var(--accent-yellow))",
    badge: "⚠️ AI Warning",
    badgeBg: "hsl(42 95% 58% / 0.12)",
    badgeColor: "hsl(42 95% 68%)",
  },
  critical: {
    border: "hsl(0 84% 60% / 0.35)",
    bg: "hsl(0 84% 60% / 0.07)",
    accent: "hsl(0 84% 60%)",
    leftBorder: "hsl(var(--accent-red))",
    badge: "🚨 AI Critical",
    badgeBg: "hsl(0 84% 60% / 0.12)",
    badgeColor: "hsl(0 84% 70%)",
  },
  success: {
    border: "hsl(152 70% 50% / 0.3)",
    bg: "hsl(152 70% 50% / 0.06)",
    accent: "hsl(152 70% 50%)",
    leftBorder: "hsl(var(--accent-green))",
    badge: "🟢 AI Insight",
    badgeBg: "hsl(152 70% 50% / 0.12)",
    badgeColor: "hsl(152 70% 60%)",
  },
};

const VARIANT_STYLES = {
  primary: { background: "linear-gradient(135deg, hsl(210 90% 55%), hsl(210 90% 45%))", color: "white", border: "none", boxShadow: "0 0 16px hsl(210 90% 60% / 0.25)" },
  success: { background: "linear-gradient(135deg, hsl(152 70% 42%), hsl(152 70% 32%))", color: "white", border: "none", boxShadow: "0 0 16px hsl(152 70% 50% / 0.2)" },
  danger: { background: "linear-gradient(135deg, hsl(0 84% 55%), hsl(0 84% 45%))", color: "white", border: "none" },
  ghost: { background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "hsl(var(--foreground-muted))" },
};

export function CortexCard({
  title,
  insight,
  actions = [],
  severity = "info",
  icon = "✦",
  className,
  animate = true,
}: CortexCardProps) {
  const styles = SEVERITY_STYLES[severity];

  const content = (
    <div
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderLeft: `3px solid ${styles.leftBorder}`,
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
      }}
      className={className}
      role="region"
      aria-label={`${styles.badge}: ${title}`}
      tabIndex={0}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "var(--radius-sm)",
          background: styles.badgeBg, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1rem", flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{
              fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em",
              textTransform: "uppercase", padding: "0.125rem 0.5rem",
              borderRadius: "999px", background: styles.badgeBg, color: styles.badgeColor,
            }}>
              {styles.badge}
            </span>
          </div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: "0.25rem" }}>
            {title}
          </p>
        </div>
      </div>

      {/* Insight text */}
      <p style={{
        fontSize: "0.875rem", color: "hsl(var(--foreground-muted))",
        lineHeight: 1.6, marginBottom: "0.75rem",
      }}>
        {insight}
      </p>

      {/* Explainable AI Reasoning Stack */}
      <div style={{
        fontSize: "0.75rem",
        color: "hsl(var(--foreground-subtle))",
        background: "rgba(255, 255, 255, 0.01)",
        border: "1px dashed rgba(255, 255, 255, 0.05)",
        borderRadius: "var(--radius-sm)",
        padding: "0.75rem",
        marginBottom: "1rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem 1rem",
      }}>
        <div><strong>Reason:</strong> Congestion Peak Mitigation</div>
        <div><strong>Evidence:</strong> Entry speed &gt; 320 people/min</div>
        <div><strong>Prediction:</strong> Halftime queue overflow (95% prob)</div>
        <div><strong>Confidence:</strong> 96.8% (Cortex Engine)</div>
        <div><strong>Expected Impact:</strong> -24% wait times at Gate A</div>
        <div><strong>Risk Factor:</strong> Low (Alternative route ready)</div>
        <div><strong>ETA:</strong> Immediately</div>
        <div><strong>Affected Roles:</strong> Security, Operations</div>
        <div><strong>Rollback:</strong> Terminate route diversion</div>
      </div>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {actions.map((action, i) => {
            const variant = action.variant ?? (i === 0 ? "primary" : "ghost");
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className="btn"
                style={{
                  ...VARIANT_STYLES[variant],
                  padding: "0.4375rem 0.875rem",
                  fontSize: "0.8125rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s ease",
                }}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
