"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types";
import { motion } from "framer-motion";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  fan: [
    { label: "Overview", href: "/fan", icon: "🏠" },
    { label: "Navigation", href: "/fan/navigation", icon: "🗺️" },
    { label: "Food & Queues", href: "/fan/food", icon: "🍔" },
    { label: "Transport", href: "/fan/transport", icon: "🚇" },
    { label: "Interpreter", href: "/fan/interpreter", icon: "🗣️" },
    { label: "Emergency", href: "/fan/emergency", icon: "🆘" },
  ],
  volunteer: [
    { label: "My Tasks", href: "/volunteer", icon: "✅" },
    { label: "Navigate", href: "/volunteer/navigate", icon: "🗺️" },
    { label: "Incidents", href: "/volunteer/incidents", icon: "⚠️" },
    { label: "Translate", href: "/volunteer/translate", icon: "🌐" },
  ],
  security: [
    { label: "Overview", href: "/security", icon: "🛡️" },
    { label: "Crowd Map", href: "/security/crowd", icon: "👥" },
    { label: "Alerts", href: "/security/alerts", icon: "🚨" },
    { label: "Routing", href: "/security/routing", icon: "↔️" },
  ],
  operations: [
    { label: "Command Center", href: "/operations", icon: "🎯" },
    { label: "Digital Twin", href: "/operations/digital-twin", icon: "🏟️" },
    { label: "AI Copilot", href: "/operations/copilot", icon: "🤖" },
    { label: "Crowd Intel", href: "/operations/crowd", icon: "📊" },
    { label: "Staffing", href: "/operations/staffing", icon: "👥" },
    { label: "Sustainability", href: "/operations/sustainability", icon: "🌱" },
    { label: "Vendors", href: "/operations/vendors", icon: "🏪" },
  ],
};

const ROLE_COLORS: Record<UserRole, string> = {
  fan: "hsl(210 90% 60%)",
  volunteer: "hsl(152 70% 50%)",
  security: "hsl(42 95% 58%)",
  operations: "hsl(265 70% 65%)",
};

const ROLE_LABELS: Record<UserRole, string> = {
  fan: "Fan",
  volunteer: "Volunteer",
  security: "Security",
  operations: "Operations",
};

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  simulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen, simulatorOpen, setSimulatorOpen }: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  const role = user?.role ?? "fan";
  const navItems = NAV_ITEMS[role];
  const roleColor = ROLE_COLORS[role];

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        height: "100vh",
        background: "hsl(var(--surface))",
        borderRight: "1px solid hsl(var(--border))",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: "1.25rem",
        borderBottom: "1px solid hsl(var(--border))",
        display: "flex", alignItems: "center", gap: "0.75rem",
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "var(--radius-sm)",
          background: "linear-gradient(135deg, hsl(210 90% 55%), hsl(152 70% 45%))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.125rem", flexShrink: 0,
        }}>
          ⚽
        </div>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>
              StadiumOS
            </div>
            <div style={{ fontSize: "0.6875rem", color: "hsl(var(--foreground-muted))" }}>
              AI · FIFA WC 2026
            </div>
          </motion.div>
        )}
      </div>

      {/* Role badge */}
      {sidebarOpen && (
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid hsl(var(--border-subtle))" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)",
            background: `${roleColor}18`, border: `1px solid ${roleColor}35`,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: roleColor, flexShrink: 0 }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: roleColor }}>
              {ROLE_LABELS[role]}
            </span>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginLeft: "auto" }}>
              {user?.name?.split(" ")[0]}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/fan" && item.href !== "/volunteer" && item.href !== "/security" && item.href !== "/operations" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: "0.75rem",
                padding: sidebarOpen ? "0.625rem 0.875rem" : "0.625rem",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                borderRadius: "var(--radius-sm)",
                marginBottom: "2px",
                textDecoration: "none",
                fontSize: "0.875rem", fontWeight: 500,
                color: isActive ? "hsl(var(--foreground))" : "hsl(var(--foreground-muted))",
                background: isActive ? `${roleColor}15` : "transparent",
                borderLeft: isActive ? `2px solid ${roleColor}` : "2px solid transparent",
                transition: "all 0.15s ease",
              }}
              className={!isActive ? "glass-hover" : ""}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid hsl(var(--border))", display: "flex", flexDirection: "column", gap: "4px" }}>
        {/* Toggle simulator console overlay */}
        <button
          onClick={() => setSimulatorOpen(!simulatorOpen)}
          aria-expanded={simulatorOpen}
          aria-label="Toggle AI simulator console panel"
          style={{
            width: "100%", padding: "0.5rem",
            display: "flex", alignItems: "center",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            gap: "0.5rem",
            background: simulatorOpen ? "hsl(var(--surface-3))" : "transparent",
            border: "none",
            color: "hsl(var(--accent-yellow))",
            cursor: "pointer", borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem", fontWeight: 600
          }}
        >
          <span>⚙️</span>
          {sidebarOpen && <span>AI Simulator</span>}
        </button>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-expanded={sidebarOpen}
          style={{
            width: "100%", padding: "0.5rem",
            display: "flex", alignItems: "center",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            gap: "0.5rem",
            background: "transparent", border: "none",
            color: "hsl(var(--foreground-subtle))",
            cursor: "pointer", borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem",
          }}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span>{sidebarOpen ? "◀" : "▶"}</span>
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
