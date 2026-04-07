"use client";

import { SetupChecklistWidget } from "@/components/dashboard/setup-checklist-widget";
import { Button } from "@/components/ui/button";
import { useAgentPipelines } from "@/hooks/use-agent-pipelines";
import { useCallAnalytics } from "@/hooks/use-call-analytics";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useDeployedAgentsList } from "@/hooks/use-deployed-agents-list";
import { usePhoneNumbers } from "@/hooks/use-phone-numbers";
import type { Campaign, SipNumber } from "@/lib/types/api";
import type { LocalAgentPipeline } from "@/lib/types/entities";
import {
  getCurrentUnixTimestamp,
  getEndOfTodayInTimezone,
  getStartOfDayDaysAgoInTimezone,
} from "@/lib/utils/timestamp";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Megaphone,
  Phone,
  PhoneCall,
  Plus,
  Sparkles,
  User,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatRelativeMs(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function isCampaignActive(status: string | undefined): boolean {
  const s = (status ?? "").toLowerCase();
  return (
    s.includes("running") ||
    s.includes("active") ||
    s.includes("progress") ||
    s.includes("in_progress")
  );
}

type FeedKind = "agent" | "campaign" | "phone";

interface FeedItem {
  id: string;
  kind: FeedKind;
  label: string;
  sub: string;
  ts: number;
  href: string;
}

function mergeActivityFeed(
  pipelines: LocalAgentPipeline[],
  campaigns: Campaign[],
  numbers: SipNumber[]
): FeedItem[] {
  const items: FeedItem[] = [];

  for (const p of pipelines) {
    const ts = Date.parse(p.update_time);
    if (!Number.isNaN(ts)) {
      items.push({
        id: `agent-${p.id}`,
        kind: "agent",
        label: p.deploy_status === 1 ? `${p.name} published` : `${p.name} updated`,
        sub: "Agent",
        ts,
        href: `/dashboard/agents/${p.id}/edit`,
      });
    }
  }

  for (const c of campaigns) {
    const ts = Date.parse(c.updated_at);
    if (!Number.isNaN(ts)) {
      items.push({
        id: `camp-${c.campaign_id}`,
        kind: "campaign",
        label: `${c.campaign_name} · ${c.status}`,
        sub: "Campaign",
        ts,
        href: `/dashboard/campaign/${c.campaign_id}`,
      });
    }
  }

  for (const n of numbers) {
    const ts = Date.parse(n.update_time);
    if (!Number.isNaN(ts)) {
      items.push({
        id: `phone-${n.id}`,
        kind: "phone",
        label: `${n.phone_number} updated`,
        sub: "Phone number",
        ts,
        href: "/dashboard/phone-numbers",
      });
    }
  }

  return items.sort((a, b) => b.ts - a.ts).slice(0, 10);
}

export function DashboardOverviewClient() {
  const timezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  const { pipelines, loading: pLoading } = useAgentPipelines({
    page: 1,
    page_size: 40,
  });
  const { campaigns, loading: cLoading } = useCampaigns({
    page: 1,
    page_size: 40,
  });
  const { total: phoneTotal, numbers, loading: phoneLoading } = usePhoneNumbers({
    page: 1,
    page_size: 40,
  });
  const { agents: deployedAgents, loading: depLoading } = useDeployedAgentsList({
    page: 1,
    page_size: 100,
  });

  const now = getCurrentUnixTimestamp();
  const from7 = getStartOfDayDaysAgoInTimezone(6, timezone);
  const to7 = getEndOfTodayInTimezone(timezone);

  const analytics7d = useCallAnalytics({
    fromTime: from7,
    toTime: to7,
    callType: "outbound",
    timezone,
  });

  const analytics24h = useCallAnalytics({
    fromTime: now - 86400,
    toTime: now,
    callType: "outbound",
    timezone,
  });

  const publishedAgents = useMemo(
    () => pipelines.filter((p) => p.deploy_status === 1).length,
    [pipelines]
  );

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => isCampaignActive(c.status)).length,
    [campaigns]
  );

  const volumeData = useMemo(() => {
    const trend = analytics7d.overviewData?.total_calls_trend ?? [];
    return trend.map((pt) => ({
      date: pt.date,
      calls: Math.round(pt.value),
    }));
  }, [analytics7d.overviewData]);

  const calls24h = analytics24h.overviewData?.total_calls ?? 0;
  const calls24hPrev = analytics24h.previousPeriodData?.total_calls ?? 0;
  const trend24 =
    calls24hPrev === 0 && calls24h === 0
      ? null
      : calls24hPrev === 0
        ? "+100%"
        : `${calls24h >= calls24hPrev ? "+" : ""}${Math.round(((calls24h - calls24hPrev) / calls24hPrev) * 100)}%`;

  const feed = useMemo(
    () => mergeActivityFeed(pipelines, campaigns, numbers),
    [pipelines, campaigns, numbers]
  );

  const topAgents = deployedAgents.slice(0, 5);

  const loadingEssentials = pLoading || cLoading || phoneLoading || depLoading;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--studio-ink)]">
          Overview
        </h1>
        <p className="mt-2 text-[var(--studio-ink-muted)]">
          Command center for agents, campaigns, and call volume.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/agents"
          className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm transition-colors hover:border-[var(--studio-teal)]/40"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--studio-teal)]">
            Published agents
          </p>
          <p className="font-heading mt-3 text-3xl font-bold text-[var(--studio-ink)]">
            {loadingEssentials ? "…" : publishedAgents}
          </p>
          <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
            deploy_status = live
          </p>
        </Link>
        <Link
          href="/dashboard/phone-numbers"
          className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm transition-colors hover:border-[var(--studio-teal)]/40"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--studio-teal)]">
            Phone numbers
          </p>
          <p className="font-heading mt-3 text-3xl font-bold text-[var(--studio-ink)]">
            {phoneLoading ? "…" : phoneTotal}
          </p>
          <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
            Imported SIP numbers
          </p>
        </Link>
        <Link
          href="/dashboard/campaign"
          className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm transition-colors hover:border-[var(--studio-teal)]/40"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--studio-teal)]">
            Active campaigns
          </p>
          <p className="font-heading mt-3 text-3xl font-bold text-[var(--studio-ink)]">
            {cLoading ? "…" : activeCampaigns}
          </p>
          <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
            Running / in progress
          </p>
        </Link>
        <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--studio-teal)]">
            Total calls (24h)
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-heading text-3xl font-bold text-[var(--studio-ink)]">
              {analytics24h.loading ? "…" : calls24h}
            </p>
            {trend24 ? (
              <span
                className={cn(
                  "text-xs font-medium",
                  calls24h >= calls24hPrev
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                vs prior 24h {trend24}
              </span>
            ) : null}
          </div>
          <Link
            href="/dashboard/analytics"
            className="mt-2 inline-block text-sm text-[var(--studio-teal)] hover:underline"
          >
            Open analytics
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm">
              <h2 className="font-heading text-base font-semibold text-[var(--studio-ink)]">
                Recent activity
              </h2>
              <ul className="mt-4 space-y-3">
                {feed.length === 0 ? (
                  <li className="text-sm text-[var(--studio-ink-muted)]">
                    No recent updates yet.
                  </li>
                ) : (
                  feed.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-[var(--studio-surface-muted)]/60"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--studio-surface-muted)]">
                          {item.kind === "agent" ? (
                            <User className="h-4 w-4 text-[var(--studio-teal)]" />
                          ) : item.kind === "campaign" ? (
                            <Megaphone className="h-4 w-4 text-[var(--studio-mauve)]" />
                          ) : (
                            <Phone className="h-4 w-4 text-[var(--studio-teal)]" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--studio-ink)]">
                            {item.label}
                          </p>
                          <p className="text-xs text-[var(--studio-ink-muted)]">
                            {item.sub} · {formatRelativeMs(item.ts)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm">
              <h2 className="font-heading text-base font-semibold text-[var(--studio-ink)]">
                Quick actions
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/dashboard/campaign/new">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col gap-1 rounded-xl py-4"
                    type="button"
                  >
                    <Plus className="h-5 w-5 text-[var(--studio-teal)]" />
                    <span className="text-xs font-medium">New campaign</span>
                  </Button>
                </Link>
                <Link href="/dashboard/agents">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col gap-1 rounded-xl py-4"
                    type="button"
                  >
                    <Sparkles className="h-5 w-5 text-[var(--studio-teal)]" />
                    <span className="text-xs font-medium">Agents</span>
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col gap-1 rounded-xl py-4"
                    type="button"
                  >
                    <BarChart3 className="h-5 w-5 text-[var(--studio-teal)]" />
                    <span className="text-xs font-medium">Analytics</span>
                  </Button>
                </Link>
                <Link href="/dashboard/phone-numbers">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col gap-1 rounded-xl py-4"
                    type="button"
                  >
                    <PhoneCall className="h-5 w-5 text-[var(--studio-teal)]" />
                    <span className="text-xs font-medium">Numbers</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-[var(--studio-ink)]">
              Call volume (7 days, outbound)
            </h2>
            <div className="mt-4 h-56">
              {analytics7d.loading || volumeData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-[var(--studio-ink-muted)]">
                  {analytics7d.loading ? "Loading…" : "No trend points for this period."}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="calls"
                      fill="var(--studio-teal)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-[var(--studio-ink)]">
              Top deployed agents
            </h2>
            <p className="mt-1 text-xs text-[var(--studio-ink-muted)]">
              Published pipelines — open an agent to bind to campaigns.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--studio-border)] text-[var(--studio-ink-muted)]">
                    <th className="pb-2 font-medium">Agent</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {depLoading ? (
                    <tr>
                      <td colSpan={2} className="py-6 text-[var(--studio-ink-muted)]">
                        Loading…
                      </td>
                    </tr>
                  ) : topAgents.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-6 text-[var(--studio-ink-muted)]">
                        No deployed agents yet.
                      </td>
                    </tr>
                  ) : (
                    topAgents.map((a) => (
                      <tr
                        key={a.pipeline_deploy_uuid}
                        className="border-b border-[var(--studio-border)]/60"
                      >
                        <td className="py-2">
                          <Link
                            href={`/dashboard/agents/${a.pipeline_id}/edit`}
                            className="font-medium text-[var(--studio-ink)] hover:text-[var(--studio-teal)]"
                          >
                            {a.name}
                          </Link>
                        </td>
                        <td className="py-2 text-[var(--studio-ink-muted)]">
                          <span className="inline-flex items-center gap-1">
                            <Workflow className="h-3.5 w-3.5" />
                            Live
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SetupChecklistWidget />
        </div>
      </div>
    </div>
  );
}
