"use client";

import { useAuthStore } from "@/stores/authStore";
import { useCortexStore } from "@/stores/cortexStore";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserRole } from "@/types";

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

interface HeaderProps {
  roleMenuOpen: boolean;
  setRoleMenuOpen: (open: boolean) => void;
}

export function HeaderBar({ roleMenuOpen, setRoleMenuOpen }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const alerts = useCortexStore((state) => state.alerts);
  const lastUpdated = useCortexStore((state) => state.lastUpdated);
  const matchMinute = useCortexStore((state) => state.matchMinute);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && roleMenuOpen) {
        setRoleMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roleMenuOpen, setRoleMenuOpen]);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (roleMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [roleMenuOpen, setRoleMenuOpen]);

  const role = user?.role ?? "fan";
  const roleColor = ROLE_COLORS[role];
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const switchRole = async (newRole: UserRole) => {
    const { setRole } = useAuthStore.getState();
    await setRole(newRole);
    router.push(`/${newRole}`);
    setRoleMenuOpen(false);
  };

  return (
    <header style={{
      height: 60, flexShrink: 0,
      background: "hsl(var(--surface))",
      borderBottom: "1px solid hsl(var(--border))",
      display: "flex", alignItems: "center",
      padding: "0 1.5rem", gap: "1rem",
    }}>
      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span className="live-dot" />
        <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", fontWeight: 500 }}>
          LIVE
        </span>
      </div>

      {/* Match info */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        padding: "0.375rem 0.875rem", borderRadius: "999px",
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        fontSize: "0.8125rem",
      }}>
        <span>🇺🇸</span>
        <span style={{ fontWeight: 600 }}>USA</span>
        <span style={{
          background: "hsl(var(--accent-green))", color: "black",
          padding: "0.125rem 0.5rem", borderRadius: "4px", fontWeight: 700, fontSize: "0.875rem",
        }}>
          2 – 1
        </span>
        <span style={{ fontWeight: 600 }}>BRA</span>
        <span>🇧🇷</span>
        <span style={{ color: "hsl(var(--foreground-muted))", marginLeft: "0.25rem" }}>{matchMinute}′</span>
      </div>

      {/* Stadium occupancy */}
      <div style={{
        fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))",
        padding: "0.375rem 0.875rem", borderRadius: "999px",
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
      }}>
        🏟️ <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>78,420</span>
        <span style={{ color: "hsl(var(--foreground-subtle))" }}> / 85,000</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Alerts badge */}
      {unacknowledgedAlerts > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "0.375rem 0.75rem", borderRadius: "999px",
          background: "hsl(0 84% 60% / 0.12)",
          border: "1px solid hsl(0 84% 60% / 0.3)",
          fontSize: "0.8125rem", fontWeight: 600, color: "hsl(var(--accent-red))",
        }}>
          🚨 {unacknowledgedAlerts} Alert{unacknowledgedAlerts !== 1 ? "s" : ""}
        </div>
      )}

      {/* Last updated */}
      <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>
        Updated {mounted ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
      </span>

      {/* Role switcher */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          aria-expanded={roleMenuOpen}
          aria-haspopup="menu"
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.375rem 0.875rem", borderRadius: "var(--radius-sm)",
            background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
            cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500,
            color: "hsl(var(--foreground))",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: roleColor }} />
          {ROLE_LABELS[role]}
          <span style={{ color: "hsl(var(--foreground-subtle))" }}>▾</span>
        </button>

        <AnimatePresence>
          {roleMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "hsl(var(--surface-2))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-md)", padding: "0.5rem",
                minWidth: "160px", zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {(["fan", "volunteer", "security", "operations"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  style={{
                    width: "100%", textAlign: "left", padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)", background: r === role ? `${ROLE_COLORS[r]}15` : "transparent",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
                    fontSize: "0.875rem", fontWeight: r === role ? 600 : 400,
                    color: r === role ? ROLE_COLORS[r] : "hsl(var(--foreground-muted))",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ROLE_COLORS[r] }} />
                  {ROLE_LABELS[r]}
                </button>
              ))}
              <div style={{ borderTop: "1px solid hsl(var(--border))", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", textAlign: "left", padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)", background: "transparent",
                    border: "none", cursor: "pointer",
                    fontSize: "0.875rem", color: "hsl(var(--accent-red))",
                  }}
                >
                  ← Exit to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
