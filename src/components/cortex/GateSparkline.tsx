import { motion } from "framer-motion";

interface GateSparklineProps {
  sparkline: number[];
  isMonitoring: boolean;
}

export function GateSparkline({ sparkline, isMonitoring }: GateSparklineProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", height: "30px", gap: "2.5px", marginBottom: "0.375rem" }}>
      {sparkline.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${val}%` }}
          style={{
            flex: 1,
            background: val > 80 ? "hsl(0,84%,60%)" : val > 60 ? "hsl(42,95%,58%)" : "hsl(152,70%,50%)",
            opacity: isMonitoring ? 0.8 : 0.4,
            borderRadius: "1px 1px 0 0"
          }}
        />
      ))}
    </div>
  );
}
