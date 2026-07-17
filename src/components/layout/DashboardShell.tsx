"use client";

import { useState } from "react";
import { SidebarNav as Sidebar } from "./SidebarNav";
import { HeaderBar as Header } from "./HeaderBar";
import { SimulatorControls as SimulatorPanel } from "./SimulatorControls";
import { ToasterOverlay } from "./ToasterOverlay";
import { DemoControls } from "./DemoControls";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  if (isHydrating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f1117] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <h1 className="sr-only">StadiumOS AI Operations Center</h1>
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
        <main id="main-content" style={{ flex: 1, overflowY: "auto", padding: "1.5rem", position: "relative" }}>
          {/* Simulation Launcher (Top of document flow) */}
          <DemoControls />
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
