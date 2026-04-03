import { axiosStudio } from "@/lib/api/clients";

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
