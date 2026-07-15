"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useCortexSimulation } from "@/hooks/useCortexSimulation";

function SimulationStarter() {
  useCortexSimulation(4000);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30 * 1000, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SimulationStarter />
      {children}
    </QueryClientProvider>
  );
}
