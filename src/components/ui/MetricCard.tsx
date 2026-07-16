"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: string;
  color?: string;
  progress?: number; // 0-100
  progressColor?: string;
  subtitle?: string;
  animateValue?: boolean;
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  icon,
  color = "hsl(var(--accent-blue))",
  progress,
  progressColor,
  subtitle,
}: MetricCardProps) {
  const isPositiveDelta = delta !== undefined && delta >= 0;
  const resolvedProgressColor = progressColor ?? color;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-card"
      style={{ height: "100%" }}
      role="region"
      aria-label={`${label} metric: ${value}${unit || ""}`}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))" }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-sm)",
            background: `${color}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.125rem",
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem", marginBottom: "0.5rem" }}>
        <span className="metric-value" style={{ color }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))", fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.5rem" }}>
          <span style={{
            fontSize: "0.75rem", fontWeight: 600,
            color: isPositiveDelta ? "hsl(var(--accent-green))" : "hsl(var(--accent-red))",
          }}>
            {isPositiveDelta ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
          {deltaLabel && (
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>
              {deltaLabel}
            </span>
          )}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-subtle))", lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ background: resolvedProgressColor }}
            />
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: "0.375rem",
            fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))",
          }}>
            <span>Current</span>
            <span style={{ color: resolvedProgressColor, fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
