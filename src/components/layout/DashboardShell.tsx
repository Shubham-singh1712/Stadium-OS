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
        className="skip-link sr-only focus:not-sr-only"
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
