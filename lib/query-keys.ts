import type { AgentPipelineListParams, DeployedAgentListParams } from "@/lib/types/api";

export type PipelineQueryKeyParams = AgentPipelineListParams & {
  disabled?: boolean;
};

export function normalizePipelineKeyParams(
  params: PipelineQueryKeyParams
): PipelineQueryKeyParams {
  const normalized = { ...params };
  if (!normalized.keyword || normalized.keyword.trim() === "") {
    delete normalized.keyword;
  }
  return normalized;
}

export function normalizeDeployedAgentKeyParams(
  params: DeployedAgentListParams
): DeployedAgentListParams {
  const normalized = { ...params };
  if (!normalized.keyword || normalized.keyword.trim() === "") {
    delete normalized.keyword;
  }
  return normalized;
}

export const pipelineKeys = {
  all: ["pipelines"] as const,
  lists: () => [...pipelineKeys.all, "list"] as const,
  list: (params: PipelineQueryKeyParams) =>
    [...pipelineKeys.lists(), normalizePipelineKeyParams(params)] as const,
  detail: (id: string) => [...pipelineKeys.all, "detail", id] as const,
};

export const agentKeys = {
  all: ["deployed-agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (params: DeployedAgentListParams) =>
    [...agentKeys.lists(), normalizeDeployedAgentKeyParams(params)] as const,
};
