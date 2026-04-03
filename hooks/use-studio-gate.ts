"use client";

import { fetchStudioAllowedEntries } from "@/lib/services/studio-auth";
import { useQuery } from "@tanstack/react-query";

const SKIP =
  process.env.NEXT_PUBLIC_SKIP_STUDIO_GATE === "true";

export function useStudioGate() {
  const query = useQuery({
    queryKey: ["studio-allowed-entries"],
    queryFn: fetchStudioAllowedEntries,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !SKIP,
  });

  if (SKIP) {
    return { ready: true, isPending: false, error: null as Error | null };
  }

  return {
    ready: query.data === true,
    isPending: query.isPending,
    error: query.error as Error | null,
  };
}
