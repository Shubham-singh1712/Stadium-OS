"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useCortexSimulation } from "@/hooks/useCortexSimulation";
import { useAuthStore } from "@/stores/authStore";

function SimulationStarter() {
  useCortexSimulation(4000);
  return null;
}

// Syncs <html lang=""> with the authenticated user's preferred language
function LangSyncer() {
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: "en",
      es: "es",
      fr: "fr",
      ar: "ar",
      pt: "pt",
    };
    const lang = langMap[user?.language ?? "en"] ?? "en";
    document.documentElement.lang = lang;
  }, [user?.language]);
  return null;
}

function SessionInitializer() {
  const setUser = useAuthStore((state) => state.setUser);
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          useAuthStore.setState({ user: data.user, isAuthenticated: true, isHydrating: false });
        } else {
          useAuthStore.setState({ isHydrating: false });
        }
      })
      .catch(() => {
        useAuthStore.setState({ isHydrating: false });
      });
  }, [setUser]);
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
      <LangSyncer />
      <SessionInitializer />
      {children}
    </QueryClientProvider>
  );
}
