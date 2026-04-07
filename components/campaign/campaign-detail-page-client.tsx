"use client";

import { CampaignCallDetailSheet } from "@/components/campaign/campaign-call-detail-sheet";
import {
  CampaignRedialDialog,
  type CohortOption,
} from "@/components/campaign/campaign-redial-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCampaignCallHistory } from "@/hooks/use-campaign-call-history";
import { useCampaignDetails } from "@/hooks/use-campaign-details";
import { useCampaignSummary } from "@/hooks/use-campaign-summary";
import { useInterruptCampaign } from "@/hooks/use-campaign-mutations";
import { useRedialCampaign } from "@/lib/contexts/redial-campaign-context";
import {
  downloadCampaignCallHistoryExport,
  downloadCampaignSummaryExport,
} from "@/lib/services/campaign";
import type { CampaignCallHistoryItem } from "@/lib/types/api";
import {
  formatDuration,
  formatScheduledStartTime,
  getDonutChartData,
  getStatusFilterOptions,
  transformCallHistoryItem,
  type CallDetail,
} from "@/lib/utils/campaign-details";
import { downloadCSV } from "@/lib/utils/file-download";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Megaphone,
  Phone,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  campaignId: string;
}

export function CampaignDetailPageClient({ campaignId }: Props) {
  const router = useRouter();
  const { campaignDetails, loading: dLoading } = useCampaignDetails(campaignId);
  const { summary, loading: sLoading } = useCampaignSummary(campaignId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { list, total, loading: hLoading } = useCampaignCallHistory(campaignId, {
    page,
    page_size: pageSize,
    search_keyword: search.trim() || undefined,
    call_category: statusFilter === "all" ? undefined : statusFilter,
  });

  const interruptMut = useInterruptCampaign();
  const { setRedialCsvData, setRedialCampaignConfig } = useRedialCampaign();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CampaignCallHistoryItem | null>(null);
  const [redialOpen, setRedialOpen] = useState(false);

  const donut = useMemo(() => getDonutChartData(summary), [summary]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const rows: CallDetail[] = useMemo(
    () => list.map((item, i) => transformCallHistoryItem(item, i)),
    [list]
  );

  const cohorts: CohortOption[] = useMemo(() => {
    if (!summary) {
      return [
        { id: "no_answer", label: "No answer", contactCount: 0 },
        { id: "voicemail", label: "Voicemail", contactCount: 0 },
        { id: "human_answered", label: "Answered", contactCount: 0 },
        { id: "failed", label: "Failed", contactCount: 0 },
        {
          id: "outbound_transferred_success",
          label: "Transferred success",
          contactCount: 0,
        },
        {
          id: "outbound_transferred_failed",
          label: "Transferred failed",
          contactCount: 0,
        },
      ];
    }
    return [
      { id: "no_answer", label: "No answer", contactCount: summary.no_answer_calls },
      { id: "voicemail", label: "Voicemail", contactCount: summary.voicemail_calls },
      {
        id: "human_answered",
        label: "Answered",
        contactCount: summary.human_answered_calls,
      },
      { id: "failed", label: "Failed", contactCount: summary.failed_calls },
      {
        id: "outbound_transferred_success",
        label: "Transferred success",
        contactCount: summary.transferred_success_calls,
      },
      {
        id: "outbound_transferred_failed",
        label: "Transferred failed",
        contactCount: summary.transferred_failed_calls,
      },
    ];
  }, [summary]);

  const onDownloadSummary = async () => {
    const res = await downloadCampaignSummaryExport(campaignId);
    if (res.code === 0) downloadCSV(res.data, `campaign-${campaignId}-summary.csv`);
  };

  const onDownloadHistory = async () => {
    const res = await downloadCampaignCallHistoryExport(campaignId, {
      search_keyword: search.trim() || undefined,
      call_category:
        statusFilter === "all" ? undefined : [statusFilter],
    });
    if (res.code === 0) downloadCSV(res.data, `campaign-${campaignId}-calls.csv`);
  };

  const onRedialCreate = (csv: string, filename: string) => {
    setRedialCsvData(csv, filename);
    if (campaignDetails) {
      setRedialCampaignConfig({
        is_send_immediately: campaignDetails.is_send_immediately,
        agent_uuid: campaignDetails.agent_uuid,
        phone_number_id: campaignDetails.phone_number_id,
        timezone: campaignDetails.timezone,
        call_interval_ms: campaignDetails.call_interval_ms,
        hangup_configuration: campaignDetails.hangup_configuration,
        switch_configuration: campaignDetails.switch_configuration,
        scheduled_time_ranges_config: campaignDetails.scheduled_time_ranges_config,
        llm_call_evaluation_configuration:
          campaignDetails.llm_call_evaluation_configuration,
        sip_transfer: campaignDetails.sip_transfer,
      });
    }
    router.push("/dashboard/campaign/create");
  };

  const title = campaignDetails?.campaign_name ?? "Campaign";
  const scheduled = formatScheduledStartTime(
    campaignDetails?.scheduled_start_time ?? null
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/campaign"
            className="mb-2 inline-flex items-center gap-1 text-sm text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Campaigns
          </Link>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold text-[var(--studio-ink)]">
            {dLoading ? "Loading…" : title}
          </h2>
          {scheduled && (
            <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">{scheduled}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => setRedialOpen(true)}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            Redial as new campaign
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)]"
            onClick={() => void onDownloadSummary()}
          >
            <Download className="mr-2 h-4 w-4" />
            Download results
          </Button>
          {campaignDetails?.status === "running" && (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => void interruptMut.mutateAsync(campaignId)}
            >
              Stop campaign
            </Button>
          )}
        </div>
      </div>

      <div className="grid min-w-0 w-full gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
        {[
          { label: "Total calls", value: summary?.total_calls ?? 0, Icon: Phone },
          {
            label: "Answered",
            value: summary?.human_answered_calls ?? 0,
            Icon: PhoneCall,
          },
          { label: "Not answered", value: summary?.no_answer_calls ?? 0, Icon: Phone },
          { label: "Voicemail", value: summary?.voicemail_calls ?? 0, Icon: Phone },
          { label: "Failed", value: summary?.failed_calls ?? 0, Icon: Phone },
          {
            label: "Xfer success",
            value: summary?.transferred_success_calls ?? 0,
            Icon: Phone,
          },
          {
            label: "Xfer failed",
            value: summary?.transferred_failed_calls ?? 0,
            Icon: Phone,
          },
        ].map(({ label, value, Icon }) => (
          <Card
            key={label}
            className="border-[var(--studio-border)] bg-[var(--studio-surface)]"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-5 w-5 text-[var(--studio-teal)]" />
              <div>
                <p className="text-xs text-[var(--studio-ink-muted)]">{label}</p>
                <p className="text-lg font-semibold text-[var(--studio-ink)]">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card className="min-w-0 border-[var(--studio-border)] bg-[var(--studio-surface)]">
          <CardHeader>
            <CardTitle className="text-base">Call status distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-0">
            {sLoading ? (
              <p className="py-8 text-sm text-[var(--studio-ink-muted)]">Loading chart…</p>
            ) : (
              <>
                <div className="h-56 w-full shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donut}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={56}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {donut.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs text-[var(--studio-ink-muted)] sm:grid-cols-3">
                  {donut.map((d) => (
                    <li key={d.name} className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="min-w-0 leading-snug">
                        <span className="text-[var(--studio-ink)]">{d.name}</span>
                        <span className="text-[var(--studio-ink-muted)]"> · {d.value}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0 border-[var(--studio-border)] bg-[var(--studio-surface)]">
          <CardHeader>
            <CardTitle className="text-base">More details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--studio-ink-muted)]">Total duration</span>
              <span>{formatDuration(summary?.total_duration_seconds ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--studio-ink-muted)]">Answered duration</span>
              <span>{formatDuration(summary?.answered_duration_seconds ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--studio-ink-muted)]">Success rate</span>
              <span>{Math.round((summary?.success_rate ?? 0) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--studio-ink-muted)]">Successful calls</span>
              <span>{summary?.successful_calls ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Call details</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search by phone…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-xs rounded-xl"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v ?? "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {getStatusFilterOptions().map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => void onDownloadHistory()}
            >
              Export filtered
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--studio-border)] text-[var(--studio-ink-muted)]">
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">To</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {hLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-[var(--studio-ink-muted)]"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-[var(--studio-ink-muted)]"
                    >
                      No calls match filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-b border-[var(--studio-border)]/60 hover:bg-[var(--studio-surface-muted)]/50"
                      onClick={() => {
                        setSelectedRow(r.rawData);
                        setSheetOpen(true);
                      }}
                    >
                      <td className="px-3 py-2 text-[var(--studio-ink-muted)]">
                        {r.timestamp}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{r.phoneNumber}</td>
                      <td className="px-3 py-2">{r.status}</td>
                      <td className="px-3 py-2">{r.duration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--studio-ink-muted)]">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CampaignCallDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        row={selectedRow}
        campaignName={campaignDetails?.campaign_name}
      />

      <CampaignRedialDialog
        open={redialOpen}
        onOpenChange={setRedialOpen}
        campaignId={campaignId}
        cohorts={cohorts}
        onCreateCampaign={(_cats, csv, fn) => onRedialCreate(csv, fn)}
      />
    </div>
  );
}
