"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCallDetailByCallId } from "@/lib/services/sip-number";
import type {
  CallDetailByCallId,
  CallHistoryItem,
  CampaignCallHistoryItem,
} from "@/lib/types/api";
import { formatDuration } from "@/lib/utils/campaign-details";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DetailTab = "transcript" | "structured_output" | "events" | "latency";

function formatCallTimestamp(ts: number): string {
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function callCategoryLabel(cat: CampaignCallHistoryItem["call_category_v2"]): string {
  const m: Record<CampaignCallHistoryItem["call_category_v2"], string> = {
    human_answered: "Answered",
    no_answer: "No Answer",
    voicemail: "Voicemail",
    failed: "Failed",
    ai_answered: "Answered",
    ai_no_answer: "No Answer",
    outbound_transferred_success: "Transferred Success",
    outbound_transferred_failed: "Transferred Failed",
    transferred_success: "Transferred Success",
    transferred_failed: "Transfer Failed",
  };
  return m[cat] ?? String(cat).replace(/_/g, " ");
}

function mergeStructuredResults(d: CallDetailByCallId | undefined): Record<string, string | boolean | number> {
  if (!d) return {};
  const ci = d.call_info;
  return {
    ...(ci?.llm_call_evaluation_result?.raw_evaluation_results ?? {}),
    ...(ci?.raw_evaluation_results ?? {}),
    ...(d.raw_evaluation_results ?? {}),
    ...(ci?.llm_call_evaluation_result?.raw_custom_evaluation_results ?? {}),
    ...(ci?.raw_custom_evaluation_results ?? {}),
    ...(d.raw_custom_evaluation_results ?? {}),
  };
}

function getCallOutcomeDisplay(
  status: CallHistoryItem["llm_call_evaluation_status"] | undefined,
  success: boolean | undefined,
  failedReason: string | undefined
): string {
  if (status === undefined || status === "disabled") return "—";
  if (status === "failed") {
    const r = String(failedReason ?? "");
    if (r.includes("llm") || r === "llm_service_error") return "Evaluation Exception";
    return "Evaluation failed";
  }
  if (status === "completed" && success !== undefined) return success ? "Yes" : "No";
  if (status === "completed") return "Completed";
  if (status === "evaluating") return "Evaluating";
  if (status === "scheduled") return "Pending";
  return "—";
}

function formatResultForJson(
  val: string | boolean | number
): { text: string; quoted: boolean } {
  if (typeof val === "string") {
    const max = 120;
    const t = val.length > max ? `${val.slice(0, max)}…` : val;
    return { text: t, quoted: true };
  }
  if (typeof val === "boolean") return { text: val ? "true" : "false", quoted: false };
  return { text: String(val), quoted: false };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: CallHistoryItem | null;
  campaignName?: string | null;
}

export function CampaignCallDetailSheet({
  open,
  onOpenChange,
  row,
  campaignName,
}: Props) {
  const [tab, setTab] = useState<DetailTab>("transcript");
  const callId = row?.call_id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["sip-numbers", "call-detail", callId],
    queryFn: () => getCallDetailByCallId(callId!),
    enabled: open && Boolean(callId),
  });

  const transcript =
    data?.call_info?.transcript?.map((m) => ({
      role: m.role === "assistant" ? "Agent" : "Customer",
      content: m.content,
    })) ?? [];

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  const errMsg =
    error instanceof Error ? error.message : error ? String(error) : null;

  const structured = mergeStructuredResults(data);
  const structuredEntries = Object.entries(structured).sort(([a], [b]) => a.localeCompare(b));

  const llmStatus =
    data?.call_info?.llm_call_evaluation_status ?? row?.llm_call_evaluation_status;
  const successResult =
    data?.call_info?.llm_call_evaluation_result?.call_success_evaluation_result ??
    row?.llm_call_evaluation_result?.call_success_evaluation_result;
  const failedReason =
    data?.call_info?.llm_call_evaluation_failed_reason ??
    row?.llm_call_evaluation_failed_reason;

  const campaignLabel = campaignName ?? row?.campaign_name;
  const durationSeconds =
    data?.call_info?.duration_seconds ?? row?.duration_seconds ?? 0;
  const callTs = data?.call_info?.call_ts ?? row?.call_ts;

  const tabButton = (id: DetailTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={cn(
        "cursor-pointer border-b-2 px-3 pb-3 pt-2 text-sm font-semibold transition-colors -mb-px",
        tab === id
          ? "border-[var(--studio-teal)] text-[var(--studio-ink)]"
          : "border-transparent text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
      )}
    >
      {label}
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full max-w-full flex-col gap-0 overflow-hidden border-[var(--studio-border)] bg-[var(--studio-surface)] p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-0 px-6 pb-2 pt-6 text-left">
          <SheetTitle className="text-lg">Call Details</SheetTitle>
        </SheetHeader>

        {!row ? null : (
          <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
            {/* Metadata — label left, value right (convo-ai-studio pattern) */}
            <div className="mb-4 flex shrink-0 flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">
                  Direction
                </span>
                <span className="inline-flex rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--studio-ink)]">
                  {row.call_type}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">
                  Call ID
                </span>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span className="break-words text-right font-mono text-xs text-[var(--studio-ink)]">
                    {row.call_id}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--studio-border)] text-[var(--studio-teal)] transition-colors hover:bg-[var(--studio-surface-muted)]"
                    onClick={() => copy(row.call_id)}
                    aria-label="Copy call ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">From</span>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span className="break-words text-right font-mono text-xs font-medium text-[var(--studio-ink)]">
                    {row.from_number}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--studio-border)] text-[var(--studio-teal)] transition-colors hover:bg-[var(--studio-surface-muted)]"
                    onClick={() => copy(row.from_number)}
                    aria-label="Copy from number"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">To</span>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span className="break-words text-right font-mono text-xs font-medium text-[var(--studio-ink)]">
                    {row.to_number}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--studio-border)] text-[var(--studio-teal)] transition-colors hover:bg-[var(--studio-surface-muted)]"
                    onClick={() => copy(row.to_number)}
                    aria-label="Copy to number"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {campaignLabel ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">
                    Campaign
                  </span>
                  <span className="min-w-0 flex-1 text-right font-medium text-[var(--studio-ink)]">
                    {row.campaign_id ? (
                      <Link
                        href={`/dashboard/campaign/${row.campaign_id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {campaignLabel}
                      </Link>
                    ) : (
                      campaignLabel
                    )}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">
                  Timestamp
                </span>
                <span className="min-w-0 flex-1 text-right font-medium text-[var(--studio-ink)]">
                  {callTs != null ? formatCallTimestamp(callTs) : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">
                  Call duration
                </span>
                <span className="min-w-0 flex-1 text-right font-medium text-[var(--studio-ink)]">
                  {formatDuration(durationSeconds)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">
                  Call status
                </span>
                <span className="inline-flex max-w-[min(100%,14rem)] rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-2.5 py-0.5 text-right text-xs font-semibold text-[var(--studio-ink)]">
                  {callCategoryLabel(row.call_category_v2)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="min-w-[120px] shrink-0 text-[var(--studio-ink-muted)]">
                  Call outcome
                </span>
                <span className="inline-flex max-w-[min(100%,14rem)] rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-2.5 py-0.5 text-right text-xs font-semibold text-[var(--studio-ink)]">
                  {getCallOutcomeDisplay(llmStatus, successResult, failedReason)}
                </span>
              </div>
            </div>

            {/* Tabbed content (convo-ai-studio) */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--studio-border)]">
              <div className="shrink-0 border-b border-[var(--studio-border)] px-3 pt-2">
                <div className="flex flex-wrap gap-0">
                  {tabButton("transcript", "Transcript")}
                  {tabButton("structured_output", "Structured Output")}
                  {tabButton("events", "Events")}
                  {tabButton("latency", "Latency")}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {tab === "transcript" && (
                  <>
                    {open && callId && isLoading && !errMsg ? (
                      <p className="text-sm text-[var(--studio-ink-muted)]">Loading…</p>
                    ) : errMsg ? (
                      <p className="text-sm text-red-600">{errMsg}</p>
                    ) : transcript.length === 0 ? (
                      <div className="flex min-h-[160px] items-center justify-center">
                        <p className="text-sm text-[var(--studio-ink-muted)]">
                          No transcript available
                        </p>
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-6 text-sm">
                        {transcript.map((line, i) => (
                          <li key={i} className="flex flex-col gap-1">
                            <span className="text-[var(--studio-ink-muted)]">{line.role}</span>
                            <span className="font-medium leading-relaxed text-[var(--studio-ink)]">
                              {line.content}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {tab === "structured_output" && (
                  <>
                    {open && callId && isLoading && !data ? (
                      <p className="text-sm text-[var(--studio-ink-muted)]">Loading…</p>
                    ) : errMsg ? (
                      <p className="text-sm text-red-600">{errMsg}</p>
                    ) : structuredEntries.length === 0 ? (
                      <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30">
                        <p className="px-4 text-center text-sm text-[var(--studio-ink-muted)]">
                          No evaluation results available
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40 p-3 font-mono text-sm leading-relaxed">
                        <span className="text-[var(--studio-ink)]">{"{"}</span>
                        <div className="ml-4 flex flex-col gap-0.5">
                          {structuredEntries.map(([key, value], index) => {
                            const { text, quoted } = formatResultForJson(value);
                            const isLast = index === structuredEntries.length - 1;
                            return (
                              <div key={key}>
                                <span className="text-[var(--studio-ink)]">&quot;{key}&quot;</span>
                                <span className="text-[var(--studio-ink)]">: </span>
                                {quoted ? (
                                  <span className="text-[var(--studio-teal)]">&quot;{text}&quot;</span>
                                ) : (
                                  <span className="text-[var(--studio-teal)]">{text}</span>
                                )}
                                {!isLast && <span className="text-[var(--studio-ink)]">,</span>}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-[var(--studio-ink)]">{"}"}</span>
                      </div>
                    )}
                  </>
                )}

                {tab === "events" && (
                  <div className="flex min-h-[160px] items-center justify-center">
                    <p className="max-w-sm text-center text-sm text-[var(--studio-ink-muted)]">
                      Event timeline is not available in this build. It requires debugging session
                      APIs used by the full studio.
                    </p>
                  </div>
                )}

                {tab === "latency" && (
                  <div className="flex min-h-[160px] items-center justify-center">
                    <p className="max-w-sm text-center text-sm text-[var(--studio-ink-muted)]">
                      Latency breakdown is not available in this build. It requires debugging
                      session APIs used by the full studio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
