"use client";

import { phoneNumberKeys } from "@/lib/query-keys";
import {
  checkSipNumberEditStatus,
  createSipNumber,
  deleteSipNumber,
  fetchSipNumberList,
  updateSipNumber,
} from "@/lib/services/sip-number";
import type {
  CreateSipNumberRequest,
  SipNumberListParams,
  UpdateSipNumberRequest,
} from "@/lib/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export function usePhoneNumbers(initial: SipNumberListParams = {}) {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<SipNumberListParams>({
    page: initial.page ?? 1,
    page_size: initial.page_size ?? 10,
    ...initial,
  });

  const query = useQuery({
    queryKey: phoneNumberKeys.list(params),
    queryFn: () => fetchSipNumberList(params),
  });

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
      keyword: keyword.trim() || undefined,
      page: 1,
    }));
  }, []);

  const remove = useMutation({
    mutationFn: (id: string) => deleteSipNumber(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
    },
  });

  const create = useMutation({
    mutationFn: (body: CreateSipNumberRequest) => createSipNumber(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateSipNumberRequest;
    }) => updateSipNumber(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
    },
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const checkEditStatus = useCallback(
    (ids: string[]) => checkSipNumberEditStatus(ids),
    []
  );

  return useMemo(
    () => ({
      numbers: query.data?.list ?? [],
      loading: query.isLoading,
      isFetching: query.isFetching,
      error: query.error ? String(query.error) : null,
      total,
      currentPage: page,
      totalPages,
      pageSize,
      setPage,
      setKeyword,
      refetch,
      deleteNumber: remove.mutateAsync,
      createNumber: create.mutateAsync,
      updateNumber: update.mutateAsync,
      checkEditStatus,
      isDeleting: remove.isPending,
      isCreating: create.isPending,
      isUpdating: update.isPending,
    }),
    [
      query.data?.list,
      query.isLoading,
      query.isFetching,
      query.error,
      total,
      page,
      totalPages,
      pageSize,
      setPage,
      setKeyword,
      refetch,
      remove.mutateAsync,
      remove.isPending,
      create.mutateAsync,
      create.isPending,
      update.mutateAsync,
      update.isPending,
      checkEditStatus,
    ]
  );
}
