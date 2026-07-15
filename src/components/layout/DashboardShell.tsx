"use client";

import { useState } from "react";
import { Sidebar } from "./shell/Sidebar";
import { Header } from "./shell/Header";
import { SimulatorPanel } from "./shell/SimulatorPanel";
import { ToasterOverlay } from "./shell/ToasterOverlay";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <a 
        href="#main-content" 
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          background: "hsl(var(--surface-3))",
          color: "hsl(var(--foreground))",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid hsl(var(--border))",
          zIndex: 99999,
          textDecoration: "none",
          fontSize: "0.875rem",
          fontWeight: 600,
        }}
        className="sr-only focus:not-sr-only"
      >
        Skip to main content
      </a>
      
      {/* Sidebar Layout */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        simulatorOpen={simulatorOpen} 
        setSimulatorOpen={setSimulatorOpen} 
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header Bar */}
        <Header 
          roleMenuOpen={roleMenuOpen} 
          setRoleMenuOpen={setRoleMenuOpen} 
        />

        {/* Dynamic page content */}
        <main id="main-content" style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <ToasterOverlay />

      {/* collapsible AI Simulator drawer */}
      <SimulatorPanel 
        simulatorOpen={simulatorOpen} 
        setSimulatorOpen={setSimulatorOpen} 
      />
    </div>
  );
}
