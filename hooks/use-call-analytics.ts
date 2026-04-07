"use client";

import {
  getCallHistoryAnalysis,
  getCallHistoryOverview,
} from "@/lib/services/sip-number";
import { observeKeys } from "@/lib/query-keys";
import type {
  CallAnalysisData,
  CallAnalyticsParams,
  CallOverviewData,
} from "@/lib/types/analytics-api";
import { calculatePreviousPeriodRange } from "@/lib/utils/timestamp";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export interface UseCallAnalyticsParams {
  fromTime?: number;
  toTime?: number;
  campaignId?: string;
  agentUuid?: string;
  callType: "inbound" | "outbound";
  timezone?: string;
  enabled?: boolean;
}

export interface UseCallAnalyticsResult {
  overviewData: CallOverviewData | null;
  analysisData: CallAnalysisData | null;
  previousPeriodData: CallOverviewData | null;
  trendLoading: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function buildApiParams(params: UseCallAnalyticsParams): CallAnalyticsParams {
  return {
    from_time: params.fromTime,
    to_time: params.toTime,
    campaign_ids: params.campaignId,
    agent_uuids: params.agentUuid,
    call_type: params.callType,
    time_granularity: "day",
    timezone: params.timezone,
  };
}

async function fetchCallAnalytics(params: UseCallAnalyticsParams): Promise<{
  overviewData: CallOverviewData;
  analysisData: CallAnalysisData;
  previousPeriodData: CallOverviewData | null;
}> {
  const apiParams = buildApiParams(params);
  let previousPeriodPromise: Promise<CallOverviewData | null> | null = null;
  if (params.fromTime && params.toTime) {
    const prev = calculatePreviousPeriodRange(params.fromTime, params.toTime);
    const previousPeriodParams: CallAnalyticsParams = {
      ...apiParams,
      from_time: prev.fromTime,
      to_time: prev.toTime,
    };
    previousPeriodPromise = getCallHistoryOverview(previousPeriodParams)
      .then((r) => r.data)
      .catch(() => null);
  }
  const [overviewResponse, analysisResponse, previousPeriodData] =
    await Promise.all([
      getCallHistoryOverview(apiParams),
      getCallHistoryAnalysis(apiParams),
      previousPeriodPromise ?? Promise.resolve(null),
    ]);
  return {
    overviewData: overviewResponse.data,
    analysisData: analysisResponse.data,
    previousPeriodData,
  };
}

export function useCallAnalytics(
  params: UseCallAnalyticsParams
): UseCallAnalyticsResult {
  const apiParams = buildApiParams(params);
  const enabled = params.enabled !== false;

  const query = useQuery({
    queryKey: observeKeys.callAnalytics(apiParams),
    queryFn: () => fetchCallAnalytics(params),
    enabled,
    staleTime: 30 * 1000,
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const loading = query.isPending || (query.isFetching && !query.data);
  const trendLoading = Boolean(
    query.data?.overviewData && query.isFetching && !query.data?.previousPeriodData
  );

  return {
    overviewData: query.data?.overviewData ?? null,
    analysisData: query.data?.analysisData ?? null,
    previousPeriodData: query.data?.previousPeriodData ?? null,
    trendLoading,
    loading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load analytics"
      : null,
    refetch,
  };
}
