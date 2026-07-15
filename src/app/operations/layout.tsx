import { DashboardShell } from "@/components/layout/DashboardShell";

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
