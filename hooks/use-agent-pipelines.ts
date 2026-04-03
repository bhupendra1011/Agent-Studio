"use client";

import { getPipelines } from "@/lib/data/pipelines";
import { normalizePipelineKeyParams, pipelineKeys } from "@/lib/query-keys";
import {
  deleteAgentPipeline,
  duplicatePipelineWithData,
  updateAgentPipeline,
} from "@/lib/services/agent-pipeline";
import type { LocalAgentPipeline } from "@/lib/types";
import type { GraphData } from "@/lib/types/api";
import {
  invalidateAndPrefetchPipelineLists,
  invalidateDeployedAgentsQueries,
} from "@/lib/utils/query-cache";
import { useStudioGate } from "@/hooks/use-studio-gate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export { pipelineKeys };

export type AgentPipelineListParams =
  import("@/lib/query-keys").PipelineQueryKeyParams;

interface UseAgentPipelinesResult {
  pipelines: LocalAgentPipeline[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  search: (keyword: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  deletePipeline: (id: string) => Promise<void>;
  duplicatePipeline: (
    pipeline: LocalAgentPipeline
  ) => Promise<import("@/lib/types/api").AgentPipeline>;
  updateAgentPipelineName: (pipelineId: number, name: string) => Promise<void>;
  updateAgentPipeline: (
    pipelineId: number,
    name: string,
    graphData?: GraphData
  ) => Promise<void>;
}

export interface UseAgentPipelinesOptions {
  onParamsChange?: (next: AgentPipelineListParams) => void;
}

export function useAgentPipelines(
  initialParams: AgentPipelineListParams = {},
  options?: UseAgentPipelinesOptions
): UseAgentPipelinesResult {
  const isControlled = Boolean(options?.onParamsChange);
  const onParamsChangeRef = useRef(options?.onParamsChange);
  useEffect(() => {
    onParamsChangeRef.current = options?.onParamsChange;
  }, [options?.onParamsChange]);

  const [internalParams, setInternalParams] =
    useState<AgentPipelineListParams>({
      page: 1,
      page_size: 10,
      ...initialParams,
    });

  const params = useMemo(
    () =>
      isControlled
        ? {
            page: initialParams.page ?? 1,
            page_size: initialParams.page_size ?? 10,
            ...(initialParams.keyword && { keyword: initialParams.keyword }),
          }
        : internalParams,
    [
      isControlled,
      initialParams.page,
      initialParams.page_size,
      initialParams.keyword,
      internalParams,
    ]
  );

  const { ready: gateReady } = useStudioGate();
  const queryClient = useQueryClient();

  const currentPage = params.page || 1;
  const pageSize = params.page_size || 10;

  const stableParams = useMemo(
    () => normalizePipelineKeyParams(params),
    [params]
  );

  const queryFn = useCallback(() => getPipelines(stableParams), [stableParams]);

  const placeholderData = useCallback(() => {
    const page = stableParams.page ?? 1;
    if (page <= 1) return undefined;
    const prevKey = pipelineKeys.list({ ...stableParams, page: page - 1 });
    return queryClient.getQueryData(prevKey) as
      | { pipelines: LocalAgentPipeline[]; total: number; totalPages: number }
      | undefined;
  }, [queryClient, stableParams]);

  const query = useQuery({
    queryKey: pipelineKeys.list(stableParams),
    queryFn,
    enabled: gateReady && !params.disabled,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
    placeholderData,
    select: (data) => ({
      pipelines: data.pipelines,
      total: data.total,
      totalPages: Math.ceil(data.total / pageSize),
    }),
  });

  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 0;

  const deletePipelineMutation = useMutation({
    mutationFn: (id: string) => deleteAgentPipeline(id),
    onSuccess: () => {
      invalidateAndPrefetchPipelineLists(queryClient);
      invalidateDeployedAgentsQueries(queryClient);
    },
  });

  const duplicatePipelineMutation = useMutation({
    mutationFn: (pipeline: LocalAgentPipeline) =>
      duplicatePipelineWithData({
        ...pipeline,
        vid: pipeline.vid || 0,
      }),
    onSuccess: () => {
      invalidateAndPrefetchPipelineLists(queryClient);
    },
  });

  const updatePipelineMutation = useMutation({
    mutationFn: ({
      pipelineId,
      name,
      graphData,
    }: {
      pipelineId: number;
      name: string;
      graphData?: GraphData;
    }) =>
      updateAgentPipeline(pipelineId, {
        name,
        ...(graphData ? { graph_data: graphData } : {}),
      }),
    onSuccess: () => {
      invalidateAndPrefetchPipelineLists(queryClient);
    },
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const search = useCallback(
    async (keyword: string) => {
      const newParams = { ...params, page: 1 };
      if (keyword && keyword.trim() !== "") {
        newParams.keyword = keyword.trim();
      } else {
        delete newParams.keyword;
      }
      if (isControlled) {
        onParamsChangeRef.current?.(newParams);
      } else {
        setInternalParams(newParams);
      }
    },
    [isControlled, params]
  );

  const setPage = useCallback(
    (page: number) => {
      if (isControlled) {
        onParamsChangeRef.current?.({ ...params, page });
      } else {
        setInternalParams((prev) => ({ ...prev, page }));
      }
    },
    [isControlled, params]
  );

  const setPageSize = useCallback(
    (size: number) => {
      if (isControlled) {
        onParamsChangeRef.current?.({ ...params, page_size: size, page: 1 });
      } else {
        setInternalParams((prev) => ({
          ...prev,
          page_size: size,
          page: 1,
        }));
      }
    },
    [isControlled, params]
  );

  const deletePipeline = useCallback(
    async (id: string) => {
      await deletePipelineMutation.mutateAsync(id);
    },
    [deletePipelineMutation]
  );

  const duplicatePipeline = useCallback(
    async (pipeline: LocalAgentPipeline) => {
      return await duplicatePipelineMutation.mutateAsync(pipeline);
    },
    [duplicatePipelineMutation]
  );

  const updateAgentPipelineFn = useCallback(
    async (pipelineId: number, name: string, graphData?: GraphData) => {
      await updatePipelineMutation.mutateAsync({
        pipelineId,
        name,
        graphData,
      });
    },
    [updatePipelineMutation]
  );

  const updateAgentPipelineName = useCallback(
    async (pipelineId: number, name: string) => {
      await updateAgentPipelineFn(pipelineId, name);
    },
    [updateAgentPipelineFn]
  );

  const isLoading =
    !query.isPlaceholderData &&
    (query.isLoading ||
      query.isFetching ||
      (!gateReady && !query.data) ||
      (gateReady && !query.data && !query.error));

  return {
    pipelines: query.data?.pipelines ?? [],
    loading: isLoading,
    isFetching: query.isFetching,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to fetch pipelines"
      : null,
    total,
    refetch,
    search,
    setPage,
    setPageSize,
    currentPage,
    totalPages,
    pageSize,
    deletePipeline,
    duplicatePipeline,
    updateAgentPipelineName,
    updateAgentPipeline: updateAgentPipelineFn,
  };
}
