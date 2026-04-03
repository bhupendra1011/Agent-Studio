import type { LocalAgentPipeline } from "@/lib/types";
import type { AgentPipelineListParams } from "@/lib/types/api";

export async function getPipelines(
  params: AgentPipelineListParams = {}
): Promise<{ pipelines: LocalAgentPipeline[]; total: number }> {
  const { getAgentPipelineList, convertAgentPipelineToLocal } = await import(
    "@/lib/services/agent-pipeline"
  );
  const apiResponse = await getAgentPipelineList(params);
  const pipelines = (apiResponse.list || []).map(convertAgentPipelineToLocal);
  return {
    pipelines,
    total: apiResponse.total || 0,
  };
}
