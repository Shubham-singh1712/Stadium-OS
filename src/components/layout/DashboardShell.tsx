"use client";

import { useState } from "react";
import { SidebarNav as Sidebar } from "./SidebarNav";
import { HeaderBar as Header } from "./HeaderBar";
import { SimulatorControls as SimulatorPanel } from "./SimulatorControls";
import { ToasterOverlay } from "./ToasterOverlay";
import { DemoControls } from "./DemoControls";
import { useAuthStore } from "@/stores/authStore";
import { useCortexStore } from "@/stores/cortexStore";
import { Loader2 } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const activeAnnouncement = useCortexStore((state) => state.activeAnnouncement);
  const publishAnnouncement = useCortexStore((state) => state.publishAnnouncement);


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

        {activeAnnouncement && (
          <div style={{
            background: activeAnnouncement.includes("EMERGENCY") ? "linear-gradient(90deg, #ef4444, #b91c1c)" : "linear-gradient(90deg, #d97706, #b45309)",
            color: "white",
            padding: "0.5rem 1.5rem",
            fontWeight: 700,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            zIndex: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="cortex-pulse" style={{ fontSize: "1rem" }}>📢</span>
              <span>{activeAnnouncement}</span>
            </div>
            <button
              onClick={() => publishAnnouncement(null)}
              aria-label="Dismiss announcement"
              style={{
                background: "none", border: "none", color: "white", cursor: "pointer",
                fontWeight: 700, fontSize: "1.25rem", padding: "0 4px", display: "flex", alignItems: "center"
              }}
            >
              ×
            </button>
          </div>
        )}


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
