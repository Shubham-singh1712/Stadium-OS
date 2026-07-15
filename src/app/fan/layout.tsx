import { DashboardShell } from "@/components/layout/DashboardShell";
export default function FanLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
