"use client";

import { getCampaignSummary } from "@/lib/services/campaign";
import { campaignKeys } from "@/lib/query-keys";
import type { CampaignSummary } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

export function useCampaignSummary(campaignId: string | null) {
  const query = useQuery({
    queryKey: campaignId ? campaignKeys.summary(campaignId) : ["campaigns", "summary", "none"],
    queryFn: async () => {
      const r = await getCampaignSummary(campaignId!);
      if (r.code !== 0) throw new Error(r.message || "Failed to load summary");
      return r.data;
    },
    enabled: Boolean(campaignId),
  });

  return {
    summary: (query.data ?? null) as CampaignSummary | null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
