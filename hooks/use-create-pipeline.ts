"use client";

import { pipelineKeys } from "@/hooks/use-agent-pipelines";
import { getPipelines } from "@/lib/data/pipelines";
import { createAgentPipeline } from "@/lib/services/agent-pipeline";
import type { CreateAgentPipelineRequest } from "@/lib/types/api";
import { invalidateAndPrefetchList } from "@/lib/utils/query-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentPipelineRequest) =>
      createAgentPipeline(data),
    onSuccess: () => {
      invalidateAndPrefetchList(queryClient, pipelineKeys, getPipelines);
    },
  });
}
