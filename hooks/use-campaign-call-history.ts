"use client";

import { getCampaignCallHistory } from "@/lib/services/campaign";
import { campaignKeys } from "@/lib/query-keys";
import type { CampaignCallHistoryItem, CampaignCallHistoryParams } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useCampaignCallHistory(
  campaignId: string | null,
  params: Omit<CampaignCallHistoryParams, "campaign_id">
) {
  const qp = useMemo(
    () => ({
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      search_keyword: params.search_keyword,
      call_category: params.call_category,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    }),
    [
      params.page,
      params.page_size,
      params.search_keyword,
      params.call_category,
      params.sort_by,
      params.sort_order,
    ]
  );

  const query = useQuery({
    queryKey: campaignId
      ? campaignKeys.callHistory(campaignId, qp)
      : ["campaigns", "call-history", "none"],
    queryFn: async () => {
      const r = await getCampaignCallHistory({
        campaign_id: campaignId!,
        ...qp,
      });
      if (r.code !== 0) throw new Error(r.message || "Failed to load call history");
      return r.data;
    },
    enabled: Boolean(campaignId),
  });

  return {
    list: (query.data?.list ?? []) as CampaignCallHistoryItem[],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? qp.page,
    pageSize: query.data?.page_size ?? qp.page_size,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
