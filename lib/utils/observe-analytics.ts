import type {
  AnalysisDataPoint,
  CallAnalysisData,
  CallOverviewData,
  InboundStatusDistribution,
  OutboundStatusDistribution,
  TrendDataPoint,
} from "@/lib/types/analytics-api";

export interface ChartPoint {
  date: string;
  value: number;
}

export interface KpiCardViewModel {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trend?: { direction: "up" | "down"; percentage: number };
  trendLoading?: boolean;
  chartData: ChartPoint[];
}

export interface StatusSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface RateLinePoint {
  date: string;
  percentage: number;
}

const OUTBOUND_STATUS_COLORS: Record<string, string> = {
  human_answered: "#42B03D",
  no_answer: "#00C2FF",
  voicemail: "#8B5CF6",
  failed: "#DC383E",
  outbound_transferred_success: "#F97316",
  outbound_transferred_failed: "#B3B3B3",
};

const INBOUND_STATUS_COLORS: Record<string, string> = {
  ai_answered: "#42B03D",
  ai_no_answer: "#00C2FF",
  transfered_success: "#F97316",
  transfered_failed: "#B3B3B3",
};

const OUTBOUND_LABELS: Record<string, string> = {
  human_answered: "Answered",
  no_answer: "No answer",
  voicemail: "Voicemail",
  failed: "Failed",
};

const INBOUND_LABELS: Record<string, string> = {
  ai_answered: "Answered",
  ai_no_answer: "No answer",
  transfered_success: "Transferred",
  transfered_failed: "Transfer failed",
};

function calculateTrendFromTotals(
  currentTotal: number,
  previousTotal: number
): { direction: "up" | "down"; percentage: number } {
  if (previousTotal === 0 && currentTotal === 0) {
    return { direction: "up", percentage: 0 };
  }
  if (previousTotal === 0 && currentTotal > 0) {
    return { direction: "up", percentage: 100 };
  }
  const difference = currentTotal - previousTotal;
  const percentage = (difference / previousTotal) * 100;
  return {
    direction: difference >= 0 ? "up" : "down",
    percentage: Math.round(Math.abs(percentage) * 10) / 10,
  };
}

function convertTrend(trendData: TrendDataPoint[]): ChartPoint[] {
  if (!trendData?.length) return [];
  const chartData = trendData.map((p) => ({ date: p.date, value: p.value }));
  if (chartData.length === 1) {
    return [chartData[0], { ...chartData[0] }];
  }
  return chartData;
}

function formatDurationToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

export function buildKpiCards(
  overviewData: CallOverviewData | null,
  callType: "inbound" | "outbound",
  previousPeriodData: CallOverviewData | null,
  trendLoading: boolean
): KpiCardViewModel[] {
  if (!overviewData) return [];

  const cards: KpiCardViewModel[] = [];

  const totalCallsChart = convertTrend(overviewData.total_calls_trend || []);
  cards.push({
    id: "total-calls",
    title: "Total calls",
    value: overviewData.total_calls ?? 0,
    trend: calculateTrendFromTotals(
      overviewData.total_calls ?? 0,
      previousPeriodData?.total_calls ?? 0
    ),
    trendLoading,
    chartData: totalCallsChart,
  });

  if (callType === "outbound" && overviewData.total_answer_rate !== undefined) {
    const arChart = convertTrend(overviewData.total_answer_rate_trend || []);
    const answerRatePercent = Math.round((overviewData.total_answer_rate || 0) * 100);
    const cur = overviewData.total_answer_rate || 0;
    const prev = previousPeriodData?.total_answer_rate || 0;
    cards.push({
      id: "answer-rate",
      title: "Answer rate (total)",
      value: answerRatePercent,
      unit: "%",
      trend: calculateTrendFromTotals(cur * 100, prev * 100),
      trendLoading,
      chartData: arChart.map((p) => ({
        ...p,
        value: Math.round(p.value * 100),
      })),
    });
  }

  const durChart = convertTrend(overviewData.total_duration_trend || []);
  const durMin = formatDurationToMinutes(overviewData.total_duration_seconds || 0);
  const curDur = overviewData.total_duration_seconds || 0;
  const prevDur = previousPeriodData?.total_duration_seconds || 0;
  cards.push({
    id: "call-duration",
    title: "Call duration (total)",
    value: durMin,
    unit: "min",
    trend: calculateTrendFromTotals(curDur, prevDur),
    trendLoading,
    chartData: durChart.map((p) => ({
      ...p,
      value: formatDurationToMinutes(p.value),
    })),
  });

  const answeredChart = convertTrend(overviewData.total_answered_trend || []);
  cards.push({
    id: "answered-calls",
    title: "Answered calls (total)",
    value: overviewData.total_answered ?? 0,
    trend: calculateTrendFromTotals(
      overviewData.total_answered ?? 0,
      previousPeriodData?.total_answered ?? 0
    ),
    trendLoading,
    chartData: answeredChart,
  });

  return cards;
}

export function buildStatusDistribution(
  analysisData: CallAnalysisData | null,
  callType: "inbound" | "outbound"
): { slices: StatusSlice[]; total: number } {
  if (!analysisData) return { slices: [], total: 0 };

  let raw: (InboundStatusDistribution | OutboundStatusDistribution)[] = [];
  let colors: Record<string, string>;
  let labels: Record<string, string>;

  if (callType === "outbound" && analysisData.outbound_analysis) {
    raw = analysisData.outbound_analysis.status_distribution || [];
    colors = OUTBOUND_STATUS_COLORS;
    labels = OUTBOUND_LABELS;
  } else if (callType === "inbound" && analysisData.inbound_analysis) {
    raw = analysisData.inbound_analysis.status_distribution_v2 || [];
    colors = INBOUND_STATUS_COLORS;
    labels = INBOUND_LABELS;
  } else {
    return { slices: [], total: 0 };
  }

  const total = raw.reduce((s, x) => s + x.count, 0);
  if (total === 0) return { slices: [], total: 0 };

  const slices: StatusSlice[] = raw.map((x) => ({
    label: labels[x.status] ?? x.status,
    value: x.count,
    percentage: Math.round((x.count / total) * 100),
    color: colors[x.status] ?? "#757575",
  }));

  return { slices, total };
}

function mapRateTrend(data: AnalysisDataPoint[] | undefined): RateLinePoint[] {
  if (!data?.length) return [];
  const mapped = data.map((p) => ({
    date: p.date,
    percentage: Math.round(p.value * 100),
  }));
  if (mapped.length === 1) return [mapped[0], { ...mapped[0] }];
  return mapped;
}

export function buildTaskSuccessSeries(
  analysisData: CallAnalysisData | null,
  callType: "inbound" | "outbound"
): RateLinePoint[] {
  let series: AnalysisDataPoint[] | undefined;
  if (callType === "outbound") {
    series =
      analysisData?.outbound_analysis?.call_success_evaluation_result_rate_trend;
  } else {
    series =
      analysisData?.inbound_analysis?.call_success_evaluation_result_rate_trend;
  }
  return mapRateTrend(series);
}

export function buildTransferRateSeries(
  analysisData: CallAnalysisData | null,
  callType: "inbound" | "outbound"
): RateLinePoint[] {
  let series: AnalysisDataPoint[] | undefined;
  if (callType === "outbound") {
    series = analysisData?.outbound_analysis?.transferred_rate_trend;
  } else {
    series = analysisData?.inbound_analysis?.transferred_rate_trend;
  }
  return mapRateTrend(series);
}
