"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary captured a crash:", error);
  }, [error]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center",
      justifyContent: "center", minHeight: "100vh", background: "#01040a", color: "#fff",
      fontFamily: "sans-serif", padding: "2rem", textAlign: "center"
    }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "hsl(0,84%,65%)", marginBottom: "1rem" }}>
        ⚠️ Operations Alert: Page Error
      </h2>
      <p style={{ color: "hsl(var(--foreground-muted))", maxWidth: "480px", lineHeight: 1.6, marginBottom: "2rem" }}>
        An unexpected UI crash has occurred. The system logs have recorded this incident and reported it to the Security Command Center.
      </p>
      <button 
        onClick={() => reset()}
        style={{
          padding: "0.625rem 1.25rem", background: "hsl(210,90%,55%)", border: "none",
          borderRadius: "var(--radius-sm)", color: "#fff", fontWeight: 700, cursor: "pointer"
        }}
      >
        🔄 Recover Session
      </button>
    </div>
  );
}
