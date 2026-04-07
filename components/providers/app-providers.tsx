"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { MSWProvider } from "@/components/providers/msw-provider";
import { RedialCampaignProvider } from "@/lib/contexts/redial-campaign-context";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RedialCampaignProvider>
        <MSWProvider>{children}</MSWProvider>
      </RedialCampaignProvider>
    </QueryClientProvider>
  );
}
