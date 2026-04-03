"use client";

import { integrationKeys } from "@/lib/query-keys";
import {
  createResource,
  deleteResource,
  fetchResourceList,
} from "@/lib/services/resources";
import type {
  CreateStudioResourceRequest,
  StudioResource,
  StudioResourceListParams,
} from "@/lib/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export function useResources(initial: StudioResourceListParams = {}) {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<StudioResourceListParams>({
    page: initial.page ?? 1,
    page_size: initial.page_size ?? 10,
    source: initial.source ?? "user_upload",
    ...initial,
  });

  const query = useQuery({
    queryKey: integrationKeys.resources.list(params),
    queryFn: () => fetchResourceList(params),
  });

  const list = query.data?.list ?? [];
  const total = query.data?.total ?? 0;
  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPage = useCallback((p: number) => {
    setParams((prev) => ({ ...prev, page: p }));
  }, []);

  const setKeyword = useCallback((keyword: string) => {
    setParams((prev) => ({
      ...prev,
      keyword: keyword || undefined,
      page: 1,
    }));
  }, []);

  const remove = useMutation({
    mutationFn: (id: string | number) => deleteResource(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.resources.all,
      });
    },
  });

  const create = useMutation({
    mutationFn: (body: CreateStudioResourceRequest) => createResource(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.resources.all,
      });
    },
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      resources: list as StudioResource[],
      loading: query.isLoading,
      isFetching: query.isFetching,
      error: query.error ? String(query.error) : null,
      total,
      currentPage: page,
      totalPages,
      pageSize,
      setPage,
      setKeyword,
      params,
      refetch,
      deleteResource: remove.mutateAsync,
      createResource: create.mutateAsync,
      isDeleting: remove.isPending,
      isCreating: create.isPending,
    }),
    [
      list,
      query.isLoading,
      query.isFetching,
      query.error,
      total,
      page,
      totalPages,
      pageSize,
      setPage,
      setKeyword,
      params,
      refetch,
      remove.mutateAsync,
      remove.isPending,
      create.mutateAsync,
      create.isPending,
    ]
  );
}
