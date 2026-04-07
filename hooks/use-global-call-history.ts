"use client";

import { getGlobalCallHistory } from "@/lib/services/sip-number";
import { observeKeys } from "@/lib/query-keys";
import type { CallHistoryItem, CallHistoryParams } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseGlobalCallHistoryOptions {
  /** Base filters excluding pagination */
  filters: Omit<CallHistoryParams, "page" | "page_size">;
  initialPage?: number;
  initialPageSize?: number;
  enabled?: boolean;
}

export function useGlobalCallHistory(options: UseGlobalCallHistoryOptions) {
  const { filters, initialPage = 1, initialPageSize = 10, enabled = true } =
    options;
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    setPageState(1);
  }, [filterKey]);

  const params: CallHistoryParams = useMemo(
    () => ({
      ...filters,
      page,
      page_size: pageSize,
    }),
    [filters, page, pageSize]
  );

  const query = useQuery({
    queryKey: observeKeys.globalCallHistory(params),
    queryFn: async () => {
      const res = await getGlobalCallHistory(params);
      return res.data;
    },
    enabled,
  });

  const setPage = useCallback((n: number) => setPageState(n), []);
  const setPageSize = useCallback((n: number) => {
    setPageSizeState(n);
    setPageState(1);
  }, []);

  const calls: CallHistoryItem[] = query.data?.list ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    calls,
    total,
    page,
    pageSize,
    totalPages,
    count: query.data?.count ?? calls.length,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load call history"
      : null,
    setPage,
    setPageSize,
    refetch: query.refetch,
  };
}
