import type { LocalAgentPipeline } from "@/lib/types";
import type {
  AgentPipeline,
  AgentPipelineListParams,
  AgentPipelineListResponse,
  CreateAgentPipelineRequest,
  CreateAgentPipelineResponse,
  UpdateAgentPipelineRequest,
} from "@/lib/types/api";
import { axiosStudio } from "@/lib/api/clients";

export async function getAgentPipelineList(
  params: AgentPipelineListParams = {}
): Promise<AgentPipelineListResponse> {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.append("keyword", params.keyword);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.page_size)
    searchParams.append("page_size", params.page_size.toString());
  if (params.status !== undefined)
    searchParams.append("status", params.status.toString());
  searchParams.append("sort_field", params.sort_field ?? "update_time");
  searchParams.append("sort_order", params.sort_order ?? "DESC");

  const queryString = searchParams.toString();
  const url = `/agent-pipeline${queryString ? `?${queryString}` : ""}`;
  const response = await axiosStudio.get<AgentPipelineListResponse>(url);
  const raw = response.data;
  return {
    list: raw.list ?? [],
    total: raw.total ?? 0,
    page: (raw as { page?: number }).page ?? params.page ?? 1,
    page_size:
      (raw as { page_size?: number }).page_size ?? params.page_size ?? 10,
  };
}

export async function createAgentPipeline(
  data: CreateAgentPipelineRequest
): Promise<CreateAgentPipelineResponse> {
  const response = await axiosStudio.post<CreateAgentPipelineResponse>(
    "/agent-pipeline",
    data
  );
  return response.data;
}

export async function updateAgentPipeline(
  pipelineId: number,
  data: UpdateAgentPipelineRequest
): Promise<AgentPipeline> {
  const response = await axiosStudio.put<AgentPipeline>(
    `/agent-pipeline/${pipelineId}`,
    data
  );
  return response.data;
}

export async function deleteAgentPipeline(id: string): Promise<void> {
  await axiosStudio.delete(`/agent-pipeline/${id}`);
}

export async function duplicatePipelineWithData(pipeline: {
  name: string;
  description: string;
  type: string;
  vid: number;
  graph_data?: import("@/lib/types/api").GraphData;
}): Promise<CreateAgentPipelineResponse> {
  return createAgentPipeline({
    name: `${pipeline.name} (Copy)`,
    description: pipeline.description,
    type: pipeline.type,
    vid: pipeline.vid,
    graph_data: pipeline.graph_data,
  });
}

export function convertAgentPipelineToLocal(
  agentPipeline: AgentPipeline
): LocalAgentPipeline {
  return {
    ...agentPipeline,
    lastRun: agentPipeline.last_deployed_time
      ? new Date(agentPipeline.last_deployed_time).toLocaleDateString()
      : "Never",
    statusColor:
      agentPipeline.deploy_status === 1
        ? "var(--studio-teal)"
        : "var(--studio-ink-muted)",
    type: agentPipeline.type === "chatbot" ? "conversational" : "voice",
    agents: [],
    config: {
      maxTokens: agentPipeline.graph_data.llm?.max_history || 1000,
      temperature: 0.7,
      responseTime: "fast",
    },
  };
}
