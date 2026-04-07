import type {
  CampaignCallHistoryItem,
  CampaignDetails,
  CampaignSummary,
} from "@/lib/types/api";

export interface CallDetail {
  id: string;
  agentId: string;
  phoneNumber: string;
  duration: string;
  turns: number;
  timestamp: string;
  type: "inbound" | "outbound";
  status:
    | "Answered"
    | "Unanswered"
    | "No Answer"
    | "Voicemail"
    | "Failed"
    | "Transferred"
    | "Transfer Failed"
    | "Transferred Success"
    | "Transferred Failed";
  rawData: CampaignCallHistoryItem;
}

const V2_STATUS: Record<
  CampaignCallHistoryItem["call_category_v2"],
  CallDetail["status"]
> = {
  human_answered: "Answered",
  no_answer: "No Answer",
  voicemail: "Voicemail",
  failed: "Failed",
  ai_answered: "Answered",
  ai_no_answer: "No Answer",
  outbound_transferred_success: "Transferred Success",
  outbound_transferred_failed: "Transferred Failed",
  transferred_success: "Transferred Success",
  transferred_failed: "Transferred Failed",
};

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTs(ts: number): string {
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function transformCallHistoryItem(
  item: CampaignCallHistoryItem,
  index: number
): CallDetail {
  const uniqueId =
    item.call_id ||
    (item.channel
      ? `${item.channel}-${item.call_ts}-${item.from_number}`
      : `call-${item.call_ts}-${index}`);

  return {
    id: uniqueId,
    agentId: item.agent_id || "",
    phoneNumber: item.to_number,
    duration: formatDuration(item.duration_seconds),
    turns: 0,
    timestamp: formatTs(item.call_ts),
    status: V2_STATUS[item.call_category_v2] ?? "No Answer",
    rawData: item,
    type: item.call_type,
  };
}

export function getDonutChartData(summary: CampaignSummary | null) {
  const empty = [
    { name: "Answered", value: 0, color: "#42B03D" },
    { name: "Voicemail", value: 0, color: "#8B5CF6" },
    { name: "Not Answered", value: 0, color: "var(--studio-teal)" },
    { name: "Failed", value: 0, color: "#DC383E" },
    { name: "Transferred Success", value: 0, color: "#F97316" },
    { name: "Transferred Failed", value: 0, color: "#B3B3B3" },
  ];
  if (!summary) return empty;
  return [
    { name: "Answered", value: summary.human_answered_calls, color: "#42B03D" },
    { name: "Voicemail", value: summary.voicemail_calls, color: "#8B5CF6" },
    { name: "Not Answered", value: summary.no_answer_calls, color: "#22d3ee" },
    { name: "Failed", value: summary.failed_calls || 0, color: "#DC383E" },
    {
      name: "Transferred Success",
      value: summary.transferred_success_calls || 0,
      color: "#F97316",
    },
    {
      name: "Transferred Failed",
      value: summary.transferred_failed_calls || 0,
      color: "#B3B3B3",
    },
  ];
}

export const chartConfig = {
  Answered: { label: "Answered", color: "#42B03D" },
  Voicemail: { label: "Voicemail", color: "#8B5CF6" },
  "Not Answered": { label: "Not Answered", color: "#22d3ee" },
  Failed: { label: "Failed", color: "#DC383E" },
  "Transferred Success": { label: "Transferred Success", color: "#F97316" },
  "Transferred Failed": { label: "Transferred Failed", color: "#B3B3B3" },
} as const;

export function getStatusFilterOptions(): Array<{ value: string; label: string }> {
  return [
    { value: "all", label: "All" },
    { value: "human_answered", label: "Answered" },
    { value: "no_answer", label: "No answer" },
    { value: "voicemail", label: "Voicemail" },
    { value: "failed", label: "Failed" },
    { value: "outbound_transferred_success", label: "Transferred success" },
    { value: "outbound_transferred_failed", label: "Transferred failed" },
  ];
}

export function transformStatus(
  status: string
): "Scheduled" | "Active" | "Paused" | "Failed" | "Completed" {
  const m: Record<string, "Scheduled" | "Active" | "Paused" | "Failed" | "Completed"> = {
    scheduled: "Scheduled",
    running: "Active",
    active: "Active",
    paused: "Paused",
    failed: "Failed",
    completed: "Completed",
    interrupted: "Paused",
  };
  return m[status?.toLowerCase() || ""] ?? "Scheduled";
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatScheduledStartTime(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr} ${timeStr}`;
}

export function getDateRange(details: CampaignDetails | null): {
  fromDate: string;
  toDate: string;
} {
  if (!details) return { fromDate: "", toDate: "" };
  return {
    fromDate: formatDate(details.created_at),
    toDate: formatDate(details.updated_at),
  };
}

export function getCallStatusLabel(status: CallDetail["status"]): string {
  return status;
}
