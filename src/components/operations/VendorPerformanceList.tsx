interface VendorItem {
  id: string;
  name: string;
  zone: string;
  revenue: number;
  waitMinutes: number;
  efficiency: number;
}

export function VendorPerformanceList({ vendors }: { vendors: VendorItem[] }) {
  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Vendor Performance</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", overflowY: "auto", maxHeight: "320px" }}>
        {vendors.map((v) => (
          <div key={v.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
              <div>
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{v.name}</span>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginLeft: "0.5rem" }}>{v.zone}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "hsl(var(--accent-green))" }}>
                  ${(v.revenue / 1000).toFixed(1)}K
                </span>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginLeft: "0.375rem" }}>
                  · {v.waitMinutes}m
                </span>
              </div>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${v.efficiency}%`,
                  background: v.efficiency > 80 ? "hsl(152,70%,50%)" : v.efficiency > 60 ? "hsl(42,95%,58%)" : "hsl(0,84%,60%)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
