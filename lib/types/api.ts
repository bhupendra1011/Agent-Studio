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

export interface GraphDataAsr {
  vendor: string;
  language?: string;
  params: {
    key?: string;
    language?: string;
    region?: string;
    url?: string;
    resource_id?: string;
    engine_model_type?: string;
    [key: string]: unknown;
  };
}

export interface GraphDataMcpServer {
  name: string;
  _uuid: string;
  endpoint: string;
  transport: string;
  timeout_ms?: number;
  headers?: Record<string, string>;
  queries?: Record<string, string>;
  allowed_tools?: string[];
}

export interface GraphDataLlm {
  vendor?: string;
  url?: string;
  api_key?: string;
  resource_id?: string;
  params?: { model?: string; max_tokens?: number; [key: string]: unknown };
  max_history?: number;
  greeting_message?: string;
  failure_message?: string;
  system_messages?: Array<{ content: string; role: string }>;
  mcp_servers?: GraphDataMcpServer[];
  rag_config?: {
    search_config?: { kb_id?: string };
  };
}

export interface GraphDataTts {
  vendor: string;
  params: {
    key?: string;
    language?: string;
    region?: string;
    voice_name?: string;
    voice_type?: string;
    speed?: number;
    speed_ratio?: number;
    volume?: number;
    volume_ratio?: number;
    pitch_ratio?: number;
    emotion?: string;
    sample_rate?: number;
    resource_id?: string;
    [key: string]: unknown;
  };
}

export interface GraphDataVad {
  threshold?: number;
  silence_duration_ms?: number;
  interrupt_duration_ms?: number;
  prefix_padding_ms?: number;
}

export interface GraphDataTurnDetection {
  threshold?: number;
  interrupt_mode?: "interrupt" | "keep";
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
}

export interface GraphDataParameters {
  silence_config?: {
    action?: string;
    content?: string;
    timeout_ms?: number;
  };
  transcript?: {
    enable?: boolean;
    protocol_version?: string;
    enable_words?: boolean;
    redundant?: boolean;
  };
  enable_metrics?: boolean;
  audio_scenario?: string;
  enable_flexible?: boolean;
  enable_dump?: boolean;
  enable_error_message?: boolean;
}

export interface GraphDataAdvancedFeatures {
  enable_sal?: boolean;
  enable_aivad?: boolean;
}

export interface GraphData {
  asr?: GraphDataAsr;
  llm?: GraphDataLlm;
  tts?: GraphDataTts;
  vad?: GraphDataVad;
  parameters?: GraphDataParameters;
  idle_timeout?: number;
  turn_detection?: GraphDataTurnDetection;
  advanced_features?: GraphDataAdvancedFeatures;
  avatar?: {
    enable?: boolean;
    vendor?: string;
    params?: Record<string, unknown>;
  };
  custom_settings?: {
    llm?: Partial<GraphDataLlm>;
  };
  [key: string]: unknown;
}

export interface StructuredSection {
  id: string;
  title: string;
  content: string;
  order?: number;
}

export interface GraphDataParamsConfig {
  llm?: {
    system_messages?: {
      active_mode: "structured" | "simple";
      simple_text?: string;
      structured_sections?: StructuredSection[];
    };
  };
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
  graph_data_params_config?: GraphDataParamsConfig;
}

export interface DeployAgentPipelineRequest {
  vids: string[];
  note?: string;
  graph_data?: GraphData;
}

export type DeployAgentPipelineResponse = AgentPipeline;

export interface StartAgentPreviewRequest {
  vid: number;
  pipeline_id?: number;
  graph_data: {
    name: string;
    properties: {
      channel: string;
      token: string;
      agent_rtc_uid: string;
      remote_rtc_uids: string[];
      enable_string_uid?: boolean;
      asr?: GraphDataAsr;
    };
    llm?: GraphDataLlm;
    tts?: GraphDataTts;
    vad?: GraphDataVad;
    parameters?: GraphDataParameters;
    idle_timeout?: number;
    turn_detection?: GraphDataTurnDetection;
    advanced_features?: GraphDataAdvancedFeatures;
  };
}

export interface StartAgentPreviewResponse {
  agent_id: string;
  create_ts: number;
  status: string;
}

export interface PipelineEditStatus {
  editable: boolean;
  hasInbound: boolean;
  hasOutbound: boolean;
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

/** Studio resource (BYOK credential) — list item */
export interface StudioResource {
  id: number;
  uuid: string;
  name: string;
  type?: string;
  type_key?: string;
  source?: string;
  description?: string;
  icon_url?: string;
  status?: number;
  vendor?: string;
  resource_data?: Record<string, unknown>;
  creator?: string;
  create_time?: string;
  update_time?: string;
}

export interface StudioResourceListParams extends PaginationParams {
  source?: string;
  type?: string;
  vendor?: string;
  sort?: string;
  category?: string;
}

export interface StudioResourceListPayload {
  total: number;
  list: StudioResource[];
}

export interface CreateStudioResourceRequest {
  name: string;
  type_key: string;
  vendor: string;
  description?: string;
  icon_url?: string;
  resource_data: Record<string, unknown>;
}

export interface UpdateStudioResourceRequest {
  name?: string;
  description?: string;
  icon_url?: string;
  vendor?: string;
  resource_data?: Record<string, unknown>;
}

export type KnowledgeBaseStatus = string;

export interface KnowledgeBase {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  status?: KnowledgeBaseStatus;
  totalDocuments?: number;
  totalSize?: number;
  processingDocuments?: number;
  failedDocuments?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface KnowledgeBaseListParams extends PaginationParams {
  search?: string;
}

export interface KnowledgeBaseListPayload {
  list: KnowledgeBase[];
  total: number;
  page?: number;
  page_size?: number;
}

export type McpTransportApi = "sse" | "http" | "streamable_http";

export interface McpServerConfig {
  endpoint: string;
  transport: string;
  timeout_ms?: number;
  headers?: Record<string, string>;
  queries?: Record<string, string>;
}

export interface McpServer {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  status?: string;
  icon_url?: string;
  config: McpServerConfig;
  creator?: string;
  createTime?: string;
  updateTime?: string;
  last_detected_time?: string | null;
}

export interface McpListParams extends PaginationParams {
  search?: string;
  status?: string;
  sort_field?: string;
  sort_order?: string;
}

export interface McpListPayload {
  list: McpServer[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface CreateMcpRequest {
  name: string;
  description?: string;
  icon_url?: string;
  config: {
    endpoint: string;
    transport: McpTransportApi;
    timeout_ms: number;
    headers?: Record<string, string>;
    queries?: Record<string, string>;
  };
}

export interface UpdateMcpRequest {
  name?: string;
  description?: string;
  icon_url?: string;
  config?: CreateMcpRequest["config"];
}

// ---------------------------------------------------------------------------
// SIP numbers — outbound-only in custom-studio-app (see docs/White_label_api.md §9)
// ---------------------------------------------------------------------------

export type SipTransport = "tcp" | "udp" | "tls";

/** Create/update uses `outbound_configs` only. Other keys may appear on API responses. */
export interface SipNumberConfig {
  outbound_configs?: {
    address?: string;
    user?: string;
    password?: string;
    transport?: string;
  };
  [key: string]: unknown;
}

export interface SipNumber {
  id: string;
  cid: string;
  phone_number: string;
  vendor: string;
  created_from: string;
  source: string;
  type: string;
  description: string;
  config: SipNumberConfig;
  status: number;
  is_deleted: number;
  creator: string;
  create_time: string;
  update_time: string;
}

export type SipNumberListParams = PaginationParams;

export interface SipNumberListPayload {
  list: SipNumber[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface CreateSipNumberRequest {
  number: string;
  source: string;
  description?: string;
  config: SipNumberConfig;
}

export interface UpdateSipNumberRequest {
  number?: string;
  source?: string;
  description?: string;
  config?: SipNumberConfig;
}

export interface SipNumberEditStatusItem {
  id: string;
  editable: boolean;
}

