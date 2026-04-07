import type { CallAnalysisData, CallOverviewData } from "@/lib/types/analytics-api";
import type { StatusSlice } from "@/lib/utils/observe-analytics";
import {
  buildTaskSuccessSeries,
  buildTransferRateSeries,
} from "@/lib/utils/observe-analytics";

export interface AnalyticsInsight {
  id: string;
  severity: "info" | "warning" | "success";
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

function lastPercent(
  series: { percentage: number }[]
): number | null {
  if (!series?.length) return null;
  const last = series[series.length - 1];
  return typeof last?.percentage === "number" ? last.percentage : null;
}

export function buildAnalyticsInsights(
  overview: CallOverviewData | null,
  analysis: CallAnalysisData | null,
  callType: "inbound" | "outbound",
  statusDist: { slices: StatusSlice[]; total: number }
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];
  const totalCalls = overview?.total_calls ?? 0;

  if (totalCalls === 0) {
    insights.push({
      id: "no-volume",
      severity: "info",
      title: "No calls in this period",
      message:
        "Launch a campaign or route inbound traffic to start collecting performance data.",
      actionHref: "/dashboard/campaign/new",
      actionLabel: "New campaign",
    });
    return insights;
  }

  if (callType === "outbound") {
    const answerPct = Math.round((overview?.total_answer_rate ?? 0) * 100);
    if (answerPct < 50) {
      insights.push({
        id: "answer-rate",
        severity: "warning",
        title: "Answer rate under 50%",
        message:
          "Consider adjusting call windows to business hours in your contacts' time zones.",
        actionHref: "/dashboard/campaign",
        actionLabel: "Review campaigns",
      });
    }
  }

  const totalStatuses = statusDist.total;
  if (totalStatuses > 0) {
    const vmSlice = statusDist.slices.find((s) =>
      /voicemail/i.test(s.label)
    );
    if (vmSlice) {
      const vmPct = (vmSlice.value / totalStatuses) * 100;
      if (vmPct > 30) {
        insights.push({
          id: "voicemail",
          severity: "warning",
          title: "High voicemail share",
          message:
            "Many calls reach voicemail. Enable voicemail detection or tune retries to save agent minutes.",
          actionHref: "/dashboard/agents",
          actionLabel: "Tune agents",
        });
      }
    }
  }

  const transferPct = lastPercent(
    buildTransferRateSeries(analysis, callType)
  );
  if (transferPct != null && transferPct > 20) {
    insights.push({
      id: "transfer",
      severity: "warning",
      title: "Elevated transfer rate",
      message:
        "Review prompts and tools so your agent can resolve more scenarios without a human handoff.",
      actionHref: "/dashboard/agents",
      actionLabel: "Edit agents",
    });
  }

  const taskPct = lastPercent(
    buildTaskSuccessSeries(analysis, callType)
  );
  if (taskPct != null && taskPct < 70) {
    insights.push({
      id: "task-success",
      severity: "warning",
      title: "Task success below 70%",
      message:
        "Scan recent transcripts in call history to spot common failure patterns.",
      actionHref: "/dashboard/call-history",
      actionLabel: "Open call history",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "healthy",
      severity: "success",
      title: "Metrics look healthy",
      message:
        "No major issues for this window. Scale volume with a new campaign when you're ready.",
      actionHref: "/dashboard/campaign/new",
      actionLabel: "New campaign",
    });
  }

  return insights.slice(0, 3);
}
