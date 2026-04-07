"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InsightsBar } from "@/components/analytics/insights-bar";
import { useCallAnalytics } from "@/hooks/use-call-analytics";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useDeployedAgentsList } from "@/hooks/use-deployed-agents-list";
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
import {
  Calendar,
  ChevronDown,
  Loader2,
  Megaphone,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
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

export function AnalyticsPageClient() {
  const [preset, setPreset] = useState("7");
  const [callType, setCallType] = useState<"inbound" | "outbound">("outbound");
  const [agentUuids, setAgentUuids] = useState<string[]>([]);
  const [campaignIds, setCampaignIds] = useState<string[]>([]);

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

  const analyticsParams = useMemo(
    () => ({
      fromTime,
      toTime,
      callType,
      campaignId: campaignIds.length ? campaignIds.join(",") : undefined,
      agentUuid: agentUuids.length ? agentUuids.join(",") : undefined,
      timezone,
    }),
    [fromTime, toTime, callType, campaignIds, agentUuids, timezone]
  );

  const { agents, loading: agentsLoading } = useDeployedAgentsList({
    page: 1,
    page_size: 100,
  });
  const { campaigns, loading: campaignsLoading } = useCampaigns({
    page: 1,
    page_size: 100,
  });

  const {
    overviewData,
    analysisData,
    previousPeriodData,
    trendLoading,
    loading,
    error,
    refetch,
  } = useCallAnalytics(analyticsParams);

  const kpiCards = useMemo(
    () =>
      buildKpiCards(
        overviewData,
        callType,
        previousPeriodData,
        trendLoading
      ),
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

  const insights = useMemo(() => {
    return buildAnalyticsInsights(
      overviewData,
      analysisData,
      callType,
      statusDist
    );
  }, [overviewData, analysisData, callType, statusDist]);

  const filtersReady = !agentsLoading && !campaignsLoading;

  const toggleAgent = (uuid: string) => {
    setAgentUuids((prev) =>
      prev.includes(uuid) ? prev.filter((x) => x !== uuid) : [...prev, uuid]
    );
  };

  const toggleCampaign = (id: string) => {
    setCampaignIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor, debug, and optimize voice agents with aggregated call metrics.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-2">
          <Calendar className="h-4 w-4 text-[var(--studio-ink-muted)]" />
          <Select
            value={preset}
            onValueChange={(v) => {
              if (v) setPreset(v);
            }}
          >
            <SelectTrigger className="h-8 w-[140px] border-0 shadow-none">
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
          <User className="h-4 w-4 text-[var(--studio-ink-muted)]" />
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!filtersReady}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-normal hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              {agentUuids.length
                ? `${agentUuids.length} agent${agentUuids.length > 1 ? "s" : ""}`
                : "All agents"}
              <ChevronDown className="h-4 w-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Agents</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {agents.map((a) => (
                <DropdownMenuCheckboxItem
                  key={a.pipeline_deploy_uuid}
                  checked={agentUuids.includes(a.pipeline_deploy_uuid)}
                  onCheckedChange={() => toggleAgent(a.pipeline_deploy_uuid)}
                >
                  {a.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-2">
          <Phone className="h-4 w-4 text-[var(--studio-ink-muted)]" />
          <Select
            value={callType}
            onValueChange={(v) => {
              if (v === "inbound" || v === "outbound") setCallType(v);
            }}
          >
            <SelectTrigger className="h-8 w-[130px] border-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-2">
          <Megaphone className="h-4 w-4 text-[var(--studio-ink-muted)]" />
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!filtersReady}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-normal hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              {campaignIds.length
                ? `${campaignIds.length} campaign${campaignIds.length > 1 ? "s" : ""}`
                : "All campaigns"}
              <ChevronDown className="h-4 w-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Campaigns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {campaigns.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.campaign_id}
                  checked={campaignIds.includes(c.campaign_id)}
                  onCheckedChange={() => toggleCampaign(c.campaign_id)}
                >
                  {c.campaign_name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
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

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <section
        className={cn(
          "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
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
                  {card.trend.direction === "up" ? "↑" : "↓"}{" "}
                  {card.trend.percentage}%
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
          <h2 className="font-heading text-lg font-semibold">Call status distribution</h2>
          <p className="text-sm text-muted-foreground">
            Breakdown of calls by outcome for the selected period.
          </p>
          {statusDist.slices.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No data for this selection.
            </p>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDist.slices}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={48}
                      outerRadius={72}
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
          <h2 className="font-heading text-lg font-semibold">Task success rate</h2>
          <p className="text-sm text-muted-foreground">
            Share of successful evaluations over answered calls (when available).
          </p>
          <div className="mt-4 h-56">
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
                  <Tooltip formatter={(v: number) => [`${v}%`, "Success rate"]} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="var(--studio-teal)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--studio-border)] bg-card p-5 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">
          Transfer to human rate
          {callType === "outbound" ? " (outbound)" : ""}
        </h2>
        <p className="text-sm text-muted-foreground">
          Portion of calls that requested or completed a human transfer.
        </p>
        <div className="mt-4 h-56">
          {transferRate.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No transfer trend data.
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
                <Tooltip formatter={(v: number) => [`${v}%`, "Transfer rate"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="Transfer rate"
                  stroke="var(--studio-mauve)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
