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

/** Deployed pipeline row; `pipeline_deploy_uuid` is sent as `agent_uuid` on campaigns. */
export interface DeployedAgent extends BasePipeline {
  pipeline_id: number;
  pipeline_uuid: string;
  pipeline_deploy_uuid: string;
  pipeline_deploy_name: string;
  current_version: string;
}

export type DeployedAgentListResponse = PaginatedResponse<DeployedAgent> & {
  page?: number;
  page_size?: number;
};

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

// ---------------------------------------------------------------------------
// Campaign + call detail (see docs/White_label_api.md §10–11)
// ---------------------------------------------------------------------------

export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  agent_name: string;
  agent_uuid: string;
  phone_numbers: number;
  phone_number?: string;
  already_dialed_count?: number;
  total_calls?: number;
  recipients_phone_number_count?: number;
  scheduled_start_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignListParams {
  page?: number;
  page_size?: number;
  search_keyword?: string;
  search_fields?: string;
  campaign_ids?: string[];
  agent_uuids?: string[];
  phone_number_ids?: string[];
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CampaignListResponseData {
  page: number;
  page_size: number;
  count: number;
  total: number;
  list: Campaign[];
}

export interface CampaignListResponse {
  code: number;
  message: string;
  data: CampaignListResponseData;
  request_id: string;
  ts: number;
}

export interface UploadRecipientsResponse {
  code: number;
  message: string;
  data: { file_url: string };
  request_id: string;
  ts: number;
}

export interface ScheduledTimeRange {
  start: string;
  end: string;
}

export interface ScheduledTimeRangesConfig {
  time_ranges: ScheduledTimeRange[];
  weekday: number;
}

export interface HangupConfiguration {
  max_duration_seconds?: number;
  max_silence_duration_seconds?: number;
  max_ring_duration_seconds?: number;
}

export interface SwitchConfiguration {
  enable_transcript?: boolean;
  enable_recording?: boolean;
  enable_voicemail?: boolean;
  enable_user_auto_hangup?: boolean;
  enable_max_silence_duration_hangup?: boolean;
  enable_llm_call_evaluation?: boolean;
}

export interface CustomEvaluation {
  variable_name: string;
  type: string;
  criteria: string;
  options?: string[];
}

export interface LlmCallEvaluationConfiguration {
  call_success_evaluation?: { criteria?: string };
  custom_evaluations?: CustomEvaluation[];
}

export interface SystemEvaluation {
  variable_name: string;
  type: string;
}

export interface SystemEvaluationsResponse {
  code: number;
  message: string;
  data: SystemEvaluation[];
}

export interface CreateCampaignRequest {
  agent_uuid: string;
  campaign_name: string;
  is_send_immediately: boolean;
  phone_number_id: string;
  recipients_file_url: string;
  call_interval_ms?: number;
  scheduled_start_time?: string;
  timezone?: string;
  hangup_configuration?: HangupConfiguration;
  scheduled_time_ranges_config?: ScheduledTimeRangesConfig[];
  switch_configuration?: SwitchConfiguration;
  llm_call_evaluation_configuration?: LlmCallEvaluationConfiguration;
  sip_transfer?: {
    enable_sip_transfer?: boolean;
    format_e164?: boolean;
    static_target?: {
      phone_number?: string;
      transfer_description?: string;
    };
  };
}

export interface UpdateCampaignRequest {
  campaign_name: string;
  phone_number_id: string;
  agent_uuid: string;
  recipients_file_url: string;
  is_send_immediately: boolean;
  call_interval_ms?: number;
  scheduled_start_time?: string;
  timezone?: string;
  hangup_configuration?: HangupConfiguration;
  scheduled_time_ranges_config?: ScheduledTimeRangesConfig[];
  switch_configuration?: SwitchConfiguration;
  llm_call_evaluation_configuration?: LlmCallEvaluationConfiguration;
  sip_transfer?: {
    enable_sip_transfer?: boolean;
    format_e164?: boolean;
    static_target?: {
      phone_number?: string;
      transfer_description?: string;
    };
  };
}

export interface UpdateCampaignResponse {
  code: number;
  message: string;
  data: { campaign_id: string; campaign_name: string };
  request_id: string;
  ts: number;
}

export interface CreateCampaignResponse {
  code: number;
  message: string;
  data: { campaign_id: string; campaign_name: string };
  request_id: string;
  ts: number;
}

export interface DeleteCampaignResponse {
  code: number;
  message: string;
  data: unknown;
  request_id: string;
  ts: number;
}

export interface CampaignDetails {
  cid: number;
  campaign_id: string;
  campaign_name: string;
  phone_number_id: string;
  phone_number: string;
  agent_uuid: string;
  recipients_phone_number_count: number;
  recipients_file_url: string;
  call_interval_ms?: number;
  scheduled_start_time_input: string;
  is_send_immediately?: boolean;
  timezone: string;
  scheduled_start_time: string;
  hangup_configuration?: HangupConfiguration;
  llm_call_evaluation_configuration?: LlmCallEvaluationConfiguration;
  scheduled_time_ranges_config?: ScheduledTimeRangesConfig[];
  switch_configuration?: SwitchConfiguration;
  sip_transfer?: {
    enable_sip_transfer?: boolean;
    format_e164?: boolean;
    static_target?: {
      phone_number?: string;
      transfer_description?: string;
    };
  };
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignDetailsResponse {
  code: number;
  message: string;
  data: CampaignDetails;
  request_id: string;
  ts: number;
}

export interface CampaignTemplateExportResponse {
  code: number;
  message: string;
  data: string;
  request_id: string;
  ts: number;
}

export interface CampaignSummaryExportResponse {
  code: number;
  message: string;
  data: string;
  request_id: string;
  ts: number;
}

export interface CampaignCallHistoryExportResponse {
  code: number;
  message: string;
  data: string;
  request_id: string;
  ts: number;
}

export interface CampaignRedialExportParams {
  call_category: string[];
}

export interface CampaignRedialExportResponse {
  code: number;
  message: string;
  data: string;
  request_id: string;
  ts: number;
}

export interface CampaignCallHistoryExportParams {
  page?: number;
  page_size?: number;
  call_category?: string[];
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search_keyword?: string;
}

export interface CampaignSummary {
  total_calls: number;
  no_answer_calls: number;
  scheduled_calls: number;
  human_answered_calls: number;
  voicemail_calls: number;
  transferred_success_calls: number;
  transferred_failed_calls: number;
  successful_calls: number;
  success_rate: number;
  total_duration_seconds: number;
  answered_duration_seconds: number;
  no_answer_duration_seconds: number;
  human_answered_duration_seconds: number;
  voicemail_duration_seconds: number;
  failed_calls: number;
  failed_rate: number;
  has_completed_calls: number;
}

export interface CampaignSummaryResponse {
  code: number;
  message: string;
  data: CampaignSummary;
  request_id: string;
  ts: number;
}

export enum LlmCallEvaluationFailedReason {
  TranscriptDisabled = "transcript_disabled",
  TranscriptEmpty = "transcript_empty",
  TranscriptMissing = "transcript_missing",
  LlmMaxRetriesExceeded = "llm_max_retries_exceeded",
  LlmServiceError = "llm_service_error",
  SuccessEvaluationPromptMissing = "success_evaluation_prompt_missing",
  SystemPromptMissing = "system_prompt_missing",
}

export interface CampaignCallHistoryItem {
  call_id: string;
  agent_id: string;
  agent_name: string;
  from_number: string;
  to_number: string;
  campaign_id: string;
  campaign_name: string;
  call_type: "inbound" | "outbound";
  hangup_reason: string;
  call_category:
    | "human_answered"
    | "no_answer"
    | "voicemail"
    | "failed"
    | "ai_answered"
    | "ai_no_answer"
    | "transfered_success"
    | "transfered_failed";
  call_category_v2:
    | "failed"
    | "no_answer"
    | "voicemail"
    | "human_answered"
    | "outbound_transferred_success"
    | "outbound_transferred_failed"
    | "ai_answered"
    | "ai_no_answer"
    | "transferred_success"
    | "transferred_failed";
  transfer_phone_number: string;
  duration_seconds: number;
  answered_ts: number;
  state: string;
  call_failed_reason: string;
  call_ts: number;
  channel: string;
  agent_uuid: string;
  llm_call_evaluation_status?:
    | "disabled"
    | "failed"
    | "scheduled"
    | "evaluating"
    | "completed";
  llm_call_evaluation_failed_reason?: LlmCallEvaluationFailedReason;
  llm_call_evaluation_result?: {
    call_success_evaluation_result: boolean;
  };
}

export interface CallHistoryItem extends CampaignCallHistoryItem {
  campaign_exists?: boolean;
  create_ts?: number;
  pipeline_id?: string;
  reason?: string;
  stop_ts?: number | null;
  labels?: { campaign_id: string };
  campaign?: { name: string; id: string } | null;
  pipeline_name?: string;
}

export interface CallDetailCallInfo {
  agent_name: string;
  agent_id: string;
  agent_uuid?: string;
  call_category_v2:
    | "human_answered"
    | "no_answer"
    | "voicemail"
    | "failed"
    | "ai_answered"
    | "ai_no_answer"
    | "transferred_success"
    | "transferred_failed"
    | "outbound_transferred_success"
    | "outbound_transferred_failed";
  from_number: string;
  to_number: string;
  transcript: Array<{ content: string; role: "assistant" | "user" }>;
  transferred_number: string;
  duration_seconds: number;
  record_file_url: string;
  call_ts: number;
  hangup_reason: string;
  llm_call_evaluation_status?:
    | "disabled"
    | "failed"
    | "scheduled"
    | "evaluating"
    | "completed";
  llm_call_evaluation_failed_reason?: LlmCallEvaluationFailedReason;
  llm_call_evaluation_result?: {
    call_success_evaluation_result?: boolean;
    raw_custom_evaluation_results?: Record<string, string | boolean | number>;
    raw_evaluation_results?: Record<string, string | boolean | number>;
  };
  raw_custom_evaluation_results?: Record<string, string | boolean | number>;
  raw_evaluation_results?: Record<string, string | boolean | number>;
}

export interface CallDetailByCallId {
  call_id: string;
  call_info: CallDetailCallInfo;
  status: string;
  call_type: "inbound" | "outbound";
  created_at: string;
  updated_at: string;
  raw_custom_evaluation_results?: Record<string, string | boolean | number>;
  raw_evaluation_results?: Record<string, string | boolean | number>;
}

export interface CallDetailByCallIdResponse {
  code: number;
  message: string;
  data: CallDetailByCallId;
  request_id: string;
  ts: number;
}

export interface CampaignCallHistoryParams {
  campaign_id: string;
  type?: "all" | "inbound" | "outbound";
  from_time?: number;
  to_time?: number;
  reason?: string;
  answered?: number;
  call_category?: string;
  search_keyword?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
  cursor?: string;
}

export interface CampaignCallHistoryResponse {
  code: number;
  message: string;
  data: {
    page: number;
    page_size: number;
    count: number;
    total: number;
    list: CampaignCallHistoryItem[];
  };
  meta?: { cursor?: string; total?: number };
  status?: string;
}

export interface InterruptCampaignResponse {
  code: number;
  message: string;
  data: null;
  request_id: string;
  ts: number;
}

