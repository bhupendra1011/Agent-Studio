import type {
  AgentPipelineListParams,
  DeployedAgentListParams,
  KnowledgeBaseListParams,
  McpListParams,
  SipNumberListParams,
  StudioResourceListParams,
} from "@/lib/types/api";


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

export function normalizeResourceKeyParams(
  params: StudioResourceListParams
): StudioResourceListParams {
  const n = { ...params };
  if (!n.keyword || n.keyword.trim() === "") delete n.keyword;
  return n;
}

export function normalizeKbKeyParams(
  params: KnowledgeBaseListParams
): KnowledgeBaseListParams {
  const n = { ...params };
  const s = n.search ?? n.keyword;
  if (!s || s.trim() === "") {
    delete n.search;
    delete n.keyword;
  } else {
    n.search = s.trim();
    delete n.keyword;
  }
  return n;
}

export function normalizeMcpKeyParams(params: McpListParams): McpListParams {
  const n = { ...params };
  const s = n.search ?? n.keyword;
  if (!s || s.trim() === "") {
    delete n.search;
    delete n.keyword;
  } else {
    n.search = s.trim();
    delete n.keyword;
  }
  return n;
}

export function normalizeSipNumberKeyParams(
  params: SipNumberListParams
): SipNumberListParams {
  const n = { ...params };
  if (!n.keyword || n.keyword.trim() === "") delete n.keyword;
  return n;
}

export const phoneNumberKeys = {
  all: ["sip-numbers"] as const,
  lists: () => [...phoneNumberKeys.all, "list"] as const,
  list: (params: SipNumberListParams) =>
    [...phoneNumberKeys.lists(), normalizeSipNumberKeyParams(params)] as const,
  detail: (id: string) => [...phoneNumberKeys.all, "detail", id] as const,
};

export const integrationKeys = {
  resources: {
    all: ["studio-resources"] as const,
    lists: () => [...integrationKeys.resources.all, "list"] as const,
    list: (params: StudioResourceListParams) =>
      [...integrationKeys.resources.lists(), normalizeResourceKeyParams(params)] as const,
  },
  knowledgeBases: {
    all: ["knowledge-bases"] as const,
    lists: () => [...integrationKeys.knowledgeBases.all, "list"] as const,
    list: (params: KnowledgeBaseListParams) =>
      [...integrationKeys.knowledgeBases.lists(), normalizeKbKeyParams(params)] as const,
  },
  mcps: {
    all: ["mcps"] as const,
    lists: () => [...integrationKeys.mcps.all, "list"] as const,
    list: (params: McpListParams) =>
      [...integrationKeys.mcps.lists(), normalizeMcpKeyParams(params)] as const,
  },
};

