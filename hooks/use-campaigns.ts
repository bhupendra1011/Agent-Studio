"use client";

import { getCampaignList } from "@/lib/services/campaign";
import { campaignKeys } from "@/lib/query-keys";
import type { Campaign, CampaignListParams } from "@/lib/types/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export interface UseCampaignsOptions {
  onParamsChange?: (next: CampaignListParams) => void;
}

function buildKeyParams(params: CampaignListParams): CampaignListParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search_keyword: params.search_keyword || undefined,
    search_fields: params.search_fields || undefined,
    sort_by: params.sort_by || undefined,
    sort_order: params.sort_order || undefined,
    status: params.status || undefined,
    agent_uuids: params.agent_uuids?.length
      ? [...params.agent_uuids].sort()
      : undefined,
    campaign_ids: params.campaign_ids?.length
      ? [...params.campaign_ids].sort()
      : undefined,
    phone_number_ids: params.phone_number_ids?.length
      ? [...params.phone_number_ids].sort()
      : undefined,
  };
}

export function useCampaigns(
  initialParams: CampaignListParams = {},
  options: UseCampaignsOptions = {}
) {
  const { onParamsChange } = options;
  const queryClient = useQueryClient();
  const isControlled = typeof onParamsChange === "function";

  const [internalParams, setInternalParams] = useState<CampaignListParams>({
    page: 1,
    page_size: 10,
    ...initialParams,
  });

  const params = isControlled ? initialParams : internalParams;
  const currentPage = params.page ?? 1;
  const pageSize = params.page_size ?? 10;
  const keyParams = useMemo(() => buildKeyParams(params), [params]);
  const stableQueryKey = useMemo(
    () => campaignKeys.list(keyParams),
    [keyParams]
  );

  const placeholderData = useCallback(() => {
    const page = keyParams.page ?? 1;
    if (page <= 1) return undefined;
    const prevKey = campaignKeys.list(buildKeyParams({ ...params, page: page - 1 }));
    return queryClient.getQueryData(prevKey) as
      | { campaigns: Campaign[]; total: number; totalPages: number }
      | undefined;
  }, [queryClient, keyParams, params]);

  const query = useQuery({
    queryKey: stableQueryKey,
    queryFn: async () => {
      const r = await getCampaignList({ ...params });
      if (r.code !== 0) {
        throw new Error(r.message || "Failed to load campaigns");
      }
      const d = r.data;
      return {
        campaigns: d.list,
        total: d.total,
        totalPages: Math.max(1, Math.ceil(d.total / pageSize)),
      };
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
    placeholderData,
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const setPage = useCallback(
    (page: number) => {
      if (isControlled && onParamsChange) onParamsChange({ ...params, page });
      else setInternalParams((prev) => ({ ...prev, page }));
    },
    [isControlled, onParamsChange, params]
  );

  const setPageSize = useCallback(
    (size: number) => {
      if (isControlled && onParamsChange) {
        onParamsChange({ ...params, page_size: size, page: 1 });
      } else {
        setInternalParams((prev) => ({ ...prev, page_size: size, page: 1 }));
      }
    },
    [isControlled, onParamsChange, params]
  );

  const setQueryParams = useCallback(
    (updater: (prev: CampaignListParams) => CampaignListParams) => {
      if (isControlled && onParamsChange) onParamsChange(updater(params));
      else setInternalParams((prev) => updater(prev));
    },
    [isControlled, onParamsChange, params]
  );

  return {
    campaigns: query.data?.campaigns ?? [],
    loading:
      !query.isPlaceholderData &&
      (query.isLoading || query.isFetching || (!query.data && !query.error)),
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    total: query.data?.total ?? 0,
    refetch,
    setPage,
    setPageSize,
    setQueryParams,
    currentPage,
    totalPages: query.data?.totalPages ?? 0,
    pageSize,
  };
}
