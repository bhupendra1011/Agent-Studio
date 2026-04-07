"use client";

import { InsightsBar } from "@/components/analytics/insights-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallAnalytics } from "@/hooks/use-call-analytics";
import { useDeployedAgentsList } from "@/hooks/use-deployed-agents-list";
import type { AgentPipeline } from "@/lib/types/api";
import { buildAnalyticsInsights } from "@/lib/utils/analytics-insights";
import {
  buildKpiCards,
  buildStatusDistribution,
  buildTaskSuccessSeries,
  buildTransferRateSeries,
} from "@/lib/utils/observe-analytics";
import {
  getEndOfTodayInTimezone,
  getStartOfDayDaysAgoInTimezone,
} from "@/lib/utils/timestamp";
import { cn } from "@/lib/utils";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function MiniSparkline({
  data,
  className,
}: {
  data: { date: string; value: number }[];
  className?: string;
}) {
  if (!data.length) return <div className={cn("h-12", className)} />;
  return (
    <div className={cn("h-12 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--studio-teal)"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function resolveDeployUuid(
  pipeline: AgentPipeline,
  deployedMatch: { pipeline_id: number; pipeline_deploy_uuid: string } | undefined
): string | null {
  const fromList = pipeline.deploy_uuids?.map((u) => u.trim()).filter(Boolean) ?? [];
  if (fromList.length) return fromList[0] ?? null;
  if (deployedMatch?.pipeline_deploy_uuid) return deployedMatch.pipeline_deploy_uuid;
  return null;
}

interface AgentAnalyticsTabProps {
  pipeline: AgentPipeline;
}

export function AgentAnalyticsTab({ pipeline }: AgentAnalyticsTabProps) {
  const [preset, setPreset] = useState("7");
  const [callType, setCallType] = useState<"inbound" | "outbound">("outbound");

  const { agents, loading: agentsLoading } = useDeployedAgentsList({
    page: 1,
    page_size: 200,
  });

  const deployUuid = useMemo(() => {
    const pid = Number(pipeline.id);
    const match = agents.find((a) => a.pipeline_id === pid);
    return resolveDeployUuid(pipeline, match);
  }, [pipeline, agents]);

  const timezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  const { fromTime, toTime } = useMemo(() => {
    const days = Math.max(1, parseInt(preset, 10) || 7);
    const from = getStartOfDayDaysAgoInTimezone(days - 1, timezone);
    const to = getEndOfTodayInTimezone(timezone);
    return { fromTime: from, toTime: to };
  }, [preset, timezone]);

  const {
    overviewData,
    analysisData,
    previousPeriodData,
    trendLoading,
    loading,
    error,
    refetch,
  } = useCallAnalytics({
    fromTime,
    toTime,
    agentUuid: deployUuid ?? undefined,
    callType,
    timezone,
    enabled: Boolean(deployUuid),
  });

  const kpiCards = useMemo(
    () =>
      buildKpiCards(overviewData, callType, previousPeriodData, trendLoading),
    [overviewData, callType, previousPeriodData, trendLoading]
  );

  const statusDist = useMemo(
    () => buildStatusDistribution(analysisData, callType),
    [analysisData, callType]
  );

  const taskSuccess = useMemo(
    () => buildTaskSuccessSeries(analysisData, callType),
    [analysisData, callType]
  );

  const transferRate = useMemo(
    () => buildTransferRateSeries(analysisData, callType),
    [analysisData, callType]
  );

  const insights = useMemo(
    () =>
      buildAnalyticsInsights(
        overviewData,
        analysisData,
        callType,
        statusDist
      ),
    [overviewData, analysisData, callType, statusDist]
  );

  if (!deployUuid && !agentsLoading) {
    return (
      <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-8 text-center shadow-sm">
        <BarChart3 className="mx-auto h-10 w-10 text-[var(--studio-teal)]" />
        <h3 className="font-heading mt-4 text-lg font-semibold text-[var(--studio-ink)]">
          Publish to unlock analytics
        </h3>
        <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
          Per-agent metrics need a deployed pipeline UUID. Deploy this agent, then
          open this tab again.
        </p>
        <p className="mt-4 text-sm text-[var(--studio-ink-muted)]">
          You can still explore workspace-wide analytics on{" "}
          <Link
            href="/dashboard/analytics"
            className="font-medium text-[var(--studio-teal)] hover:underline"
          >
            Analytics
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[var(--studio-teal)]" />
          <h3 className="font-heading text-base font-semibold text-[var(--studio-ink)]">
            Performance (this agent)
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-2">
            <Select
              value={preset}
              onValueChange={(v) => {
                if (v) setPreset(v);
              }}
            >
              <SelectTrigger className="h-8 w-[130px] border-0 shadow-none">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-2">
            <Select
              value={callType}
              onValueChange={(v) => {
                if (v === "inbound" || v === "outbound") setCallType(v);
              }}
            >
              <SelectTrigger className="h-8 w-[120px] border-0 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">Outbound</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={() => refetch()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <section
        className={cn(
          "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
          loading && "opacity-60"
        )}
      >
        {kpiCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-[var(--studio-border)] bg-card p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {card.value}
                {card.unit ? (
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    {card.unit}
                  </span>
                ) : null}
              </span>
              {card.trend && !card.trendLoading ? (
                <span
                  className={cn(
                    "text-xs font-medium",
                    card.trend.direction === "up"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {card.trend.direction === "up" ? "↑" : "↓"} {card.trend.percentage}%
                </span>
              ) : null}
              {card.trendLoading ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : null}
            </div>
            <MiniSparkline data={card.chartData} className="mt-3" />
          </div>
        ))}
      </section>

      <InsightsBar insights={insights} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--studio-border)] bg-card p-5 shadow-sm">
          <h4 className="font-heading text-base font-semibold">Call status mix</h4>
          <p className="text-sm text-muted-foreground">For the selected period.</p>
          {statusDist.slices.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No data for this agent in this window.
            </p>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDist.slices}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={40}
                      outerRadius={64}
                      paddingAngle={1}
                    >
                      {statusDist.slices.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="min-w-0 flex-1 space-y-2 text-sm">
                {statusDist.slices.map((s) => (
                  <li key={s.label} className="flex justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {s.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--studio-border)] bg-card p-5 shadow-sm">
          <h4 className="font-heading text-base font-semibold">Task success</h4>
          <div className="mt-4 h-52">
            {taskSuccess.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No trend data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskSuccess}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Success"]} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="var(--studio-teal)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--studio-border)] bg-card p-5 shadow-sm">
        <h4 className="font-heading text-base font-semibold">
          Transfer rate{callType === "outbound" ? " (outbound)" : ""}
        </h4>
        <div className="mt-4 h-52">
          {transferRate.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No transfer trend.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transferRate}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v: number) => [`${v}%`, "Transfer"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="Transfer rate"
                  stroke="var(--studio-mauve)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
