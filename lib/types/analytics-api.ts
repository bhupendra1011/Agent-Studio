/**
 * Call analytics overview / analysis API types.
 * GET /sip-numbers/all/call-history/overview
 * GET /sip-numbers/all/call-history/analysis
 */

export interface CallAnalyticsParams {
  from_time?: number;
  to_time?: number;
  campaign_ids?: string;
  agent_uuids?: string;
  call_type: "inbound" | "outbound";
  time_granularity: "day";
  timezone?: string;
}

export interface CallOverviewResponse {
  code: number;
  message: string;
  data: CallOverviewData;
  request_id: string;
  ts: number;
}

export interface CallOverviewData {
  total_calls: number;
  total_answered: number;
  total_duration_seconds: number;
  total_answer_rate?: number;
  total_calls_trend: TrendDataPoint[];
  total_answered_trend: TrendDataPoint[];
  total_duration_trend: TrendDataPoint[];
  total_answer_rate_trend?: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface CallAnalysisResponse {
  code: number;
  message: string;
  data: CallAnalysisData;
  request_id: string;
  ts: number;
}

export interface CallAnalysisData {
  inbound_analysis?: InboundAnalysis;
  outbound_analysis?: OutboundAnalysis;
}

export interface InboundAnalysis {
  avg_answered_duration: AnalysisDataPoint[];
  status_distribution_v2: InboundStatusDistribution[];
  transferred_rate_trend?: AnalysisDataPoint[];
  call_success_evaluation_result_rate_trend?: AnalysisDataPoint[];
}

export interface OutboundAnalysis {
  avg_answered_duration: AnalysisDataPoint[];
  status_distribution: OutboundStatusDistribution[];
  total_answer_rate_trend?: AnalysisDataPoint[];
  transferred_rate_trend?: AnalysisDataPoint[];
  call_success_evaluation_result_rate_trend?: AnalysisDataPoint[];
}

export interface AnalysisDataPoint {
  date: string;
  value: number;
}

export interface InboundStatusDistribution {
  status:
    | "ai_no_answer"
    | "ai_answered"
    | "transfered_success"
    | "transfered_failed";
  count: number;
}

export interface OutboundStatusDistribution {
  status: "human_answered" | "no_answer" | "voicemail" | "failed";
  count: number;
}
