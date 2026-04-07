"use client";

import { getSystemEvaluations } from "@/lib/services/metadata";
import type { SystemEvaluation } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

const key = ["metadata", "system-evaluations"] as const;

export function useSystemEvaluations() {
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const r = await getSystemEvaluations();
      if (r.code !== 0) throw new Error(r.message || "Failed to load evaluations");
      return r.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    systemEvaluations: (query.data ?? []) as SystemEvaluation[],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
