import { axiosStudio } from "@/lib/api/clients";
import type {
  DeployedAgentListParams,
  DeployedAgentListResponse,
} from "@/lib/types/api";

export async function getDeployedAgentList(
  params: DeployedAgentListParams = {}
): Promise<DeployedAgentListResponse> {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.append("keyword", params.keyword);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.page_size) searchParams.append("page_size", String(params.page_size));
  if (params.status !== undefined) searchParams.append("status", String(params.status));

  const qs = searchParams.toString();
  const url = `/agent-deploy-pipeline${qs ? `?${qs}` : ""}`;
  const response = await axiosStudio.get<DeployedAgentListResponse>(url);
  const raw = response.data;
  return {
    list: raw.list ?? [],
    total: raw.total ?? 0,
    page: raw.page ?? params.page ?? 1,
    page_size: raw.page_size ?? params.page_size ?? 10,
  };
}

export async function updateDeployedAgentStatus(
  project_id: string,
  deployId: string,
  status: number
): Promise<void> {
  await axiosStudio.put(
    `/agent-deploy-pipeline/${project_id}/${deployId}/status`,
    { status }
  );
}
