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
  /** When set, pagination is driven externally (e.g. URL query). */
  controlledPage?: number;
  controlledPageSize?: number;
}

export function useGlobalCallHistory(options: UseGlobalCallHistoryOptions) {
  const {
    filters,
    initialPage = 1,
    initialPageSize = 10,
    enabled = true,
    controlledPage,
    controlledPageSize,
  } = options;
  const [internalPage, setInternalPage] = useState(initialPage);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  const page = controlledPage ?? internalPage;
  const pageSize = controlledPageSize ?? internalPageSize;

  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    if (controlledPage === undefined) {
      setInternalPage(1);
    }
  }, [filterKey, controlledPage]);

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

  const setPage = useCallback(
    (n: number) => {
      if (controlledPage === undefined) {
        setInternalPage(n);
      }
    },
    [controlledPage]
  );
  const setPageSize = useCallback(
    (n: number) => {
      if (controlledPageSize === undefined) {
        setInternalPageSize(n);
        setInternalPage(1);
      }
    },
    [controlledPageSize]
  );

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
