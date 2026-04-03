// API types (subset aligned with convo-ai-studio / docs/api.text)

export interface PaginationParams {
  page?: number;
  page_size?: number;
  keyword?: string;
}

export interface PaginatedResponse<T = unknown> {
  total: number;
  list: T[];
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface GraphData {
  asr?: {
    vendor: string;
    params: { key: string; language: string; region: string };
  };
  llm?: {
    vendor?: string;
    url?: string;
    params?: { model?: string; [key: string]: unknown };
    max_history?: number;
    greeting_message?: string;
    failure_message?: string;
    system_messages?: Array<{ content: string; role: string }>;
    api_key?: string;
  };
  tts?: {
    vendor: string;
    params: { key: string; language: string; region: string };
  };
  idle_timeout?: number;
  advanced_features?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PipelineDeployment {
  id: string;
  appId: string;
  appName: string;
  project_id?: string | number;
  uuid?: string;
  vid?: number;
  status?: number;
}

export interface BasePipeline {
  id: string;
  name: string;
  type: string;
  description: string;
  icon_url: string;
  creator: string;
  deploy_status: number;
  graph_data: GraphData;
  create_time: string;
  update_time: string;
  last_deployed_time: string;
  vid?: number;
  project_name?: string;
  project_id?: string;
  app_id?: string;
}

export interface AgentPipeline extends BasePipeline {
  current_pipeline_version: string;
  deploy_version_id: string | null;
  deploy_app_ids: string[];
  deploy_vids?: number[];
  deploy_uuids?: string[];
  deployments?: PipelineDeployment[];
}

export interface AgentPipelineListParams extends PaginationParams {
  status?: number;
  sort_field?: "update_time" | "create_time";
  sort_order?: "DESC" | "ASC";
}

export type AgentPipelineListResponse = PaginatedResponse<AgentPipeline> & {
  page?: number;
  page_size?: number;
};

export interface CreateAgentPipelineRequest {
  name: string;
  description?: string;
  type: string;
  icon_url?: string;
  vid?: number;
  template_id?: string;
  graph_data?: GraphData;
}

export type CreateAgentPipelineResponse = AgentPipeline;

export interface UpdateAgentPipelineRequest {
  name?: string;
  description?: string;
  vid?: number;
  type?: string;
  icon_url?: string;
  graph_data?: GraphData;
}

export interface DeployedAgentListParams extends PaginationParams {
  status?: number;
}

export interface TemplateListParams extends PaginationParams {
  type?: string;
}

export interface Project {
  id: number;
  name: string;
  projectId: string;
  key: string;
  signkey: string;
  projectType: string;
  stage: number;
  status: number;
  allowStaticWithDynamic: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface ProjectListParams {
  fetchAll?: boolean;
}

export interface ProjectListResponse {
  total: number;
  items: Project[];
}

export interface CreateProjectRequest {
  enableCertificate: boolean;
  projectName: string;
  useCaseId: string;
}

export interface CreateProjectResponse {
  id: number;
  name: string;
  projectId?: string;
  key?: string;
  signkey?: string;
}
