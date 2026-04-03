import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectListParams,
  ProjectListResponse,
} from "@/lib/types/api";
import { axiosConsoleV2 } from "@/lib/api/clients";

export async function getProjectList(
  params: ProjectListParams = {}
): Promise<ProjectListResponse> {
  const searchParams = new URLSearchParams();
  if (params.fetchAll) searchParams.append("fetchAll", "true");
  const queryString = searchParams.toString();
  const url = `/projects${queryString ? `?${queryString}` : ""}`;
  const response = await axiosConsoleV2.get<ProjectListResponse>(url);
  return response.data;
}

export async function createProject(
  data: CreateProjectRequest
): Promise<CreateProjectResponse> {
  const response = await axiosConsoleV2.post<CreateProjectResponse>(
    "/project",
    {
      enableCertificate: data.enableCertificate,
      projectName: data.projectName,
      useCaseId: data.useCaseId,
    }
  );
  return response.data;
}
