"use client";

import { integrationKeys } from "@/lib/query-keys";
import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  fetchKnowledgeBaseList,
} from "@/lib/services/knowledge-bases";
import type { KnowledgeBase, KnowledgeBaseListParams } from "@/lib/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export function useKnowledgeBases(initial: KnowledgeBaseListParams = {}) {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<KnowledgeBaseListParams>({
    page: initial.page ?? 1,
    page_size: initial.page_size ?? 10,
    ...initial,
  });

  const query = useQuery({
    queryKey: integrationKeys.knowledgeBases.list(params),
    queryFn: () => fetchKnowledgeBaseList(params),
  });

  const list = query.data?.list ?? [];
  const total = query.data?.total ?? 0;
  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPage = useCallback((p: number) => {
    setParams((prev) => ({ ...prev, page: p }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }));
  }, []);

  const remove = useMutation({
    mutationFn: (id: string) => deleteKnowledgeBase(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.knowledgeBases.all,
      });
    },
  });

  const create = useMutation({
    mutationFn: (input: {
      name: string;
      description?: string;
      files?: File[];
    }) => createKnowledgeBase(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationKeys.knowledgeBases.all,
      });
    },
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      knowledgeBases: list as KnowledgeBase[],
      loading: query.isLoading,
      isFetching: query.isFetching,
      error: query.error ? String(query.error) : null,
      total,
      currentPage: page,
      totalPages,
      pageSize,
      setPage,
      setSearch,
      refetch,
      deleteKnowledgeBase: remove.mutateAsync,
      createKnowledgeBase: create.mutateAsync,
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
      setSearch,
      refetch,
      remove.mutateAsync,
      remove.isPending,
      create.mutateAsync,
      create.isPending,
    ]
  );
}
