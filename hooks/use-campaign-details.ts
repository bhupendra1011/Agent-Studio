"use client";

import { getCampaignDetails } from "@/lib/services/campaign";
import { campaignKeys } from "@/lib/query-keys";
import type { CampaignDetails } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";

export function useCampaignDetails(campaignId: string | null) {
  const query = useQuery({
    queryKey: campaignId ? campaignKeys.detail(campaignId) : ["campaigns", "detail", "none"],
    queryFn: async () => {
      const r = await getCampaignDetails(campaignId!);
      if (r.code !== 0) throw new Error(r.message || "Failed to load campaign");
      if (!r.data?.campaign_id) throw new Error("Campaign not found");
      return r.data;
    },
    enabled: Boolean(campaignId),
  });

  return {
    campaignDetails: (query.data ?? null) as CampaignDetails | null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
