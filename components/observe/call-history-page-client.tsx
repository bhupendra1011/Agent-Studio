"use client";

import { CampaignCallDetailSheet } from "@/components/campaign/campaign-call-detail-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useDeployedAgentsList } from "@/hooks/use-deployed-agents-list";
import { useGlobalCallHistory } from "@/hooks/use-global-call-history";
import type { CallHistoryItem } from "@/lib/types/api";
import { getDefaultCallHistoryTimeRange } from "@/lib/utils/timestamp";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatCallTime(ts: number): string {
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(row: CallHistoryItem): string {
  const v2 = row.call_category_v2;
  const map: Record<string, string> = {
    human_answered: "Answered",
    no_answer: "No answer",
    voicemail: "Voicemail",
    failed: "Failed",
    ai_answered: "Answered",
    ai_no_answer: "No answer",
    outbound_transferred_success: "Transferred",
    outbound_transferred_failed: "Transfer failed",
    transferred_success: "Transferred",
    transferred_failed: "Transfer failed",
  };
  return map[v2] ?? v2.replace(/_/g, " ");
}

function parseSortFromSearch(sortParam: string | null): {
  sortBy: "call_ts" | "duration_seconds";
  sortOrder: "asc" | "desc";
} {
  if (!sortParam?.includes(":")) {
    return { sortBy: "call_ts", sortOrder: "desc" };
  }
  const [col, ord] = sortParam.split(":");
  const sortBy =
    col === "duration_seconds" ? "duration_seconds" : "call_ts";
  const sortOrder = ord === "asc" ? "asc" : "desc";
  return { sortBy, sortOrder };
}

const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "human_answered", label: "Answered" },
  { id: "no_answer", label: "No answer" },
  { id: "voicemail", label: "Voicemail" },
  { id: "failed", label: "Failed" },
  { id: "outbound_transferred_success", label: "Transferred" },
  { id: "outbound_transferred_failed", label: "Transfer failed" },
];

export function CallHistoryPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultRange = useMemo(() => getDefaultCallHistoryTimeRange(), []);

  const q = searchParams.get("q") ?? "";
  const direction = (searchParams.get("dir") ?? "all") as
    | "all"
    | "inbound"
    | "outbound";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const psRaw = parseInt(searchParams.get("ps") ?? "10", 10);
  const pageSize = [10, 25, 50].includes(psRaw) ? psRaw : 10;
  const agentUuid = searchParams.get("agent")?.trim() || "";
  const campaignId = searchParams.get("campaign")?.trim() || "";
  const catRaw = searchParams.get("cat")?.trim() || "";
  const statusFilters = catRaw
    ? catRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const sortParam = searchParams.get("sort");
  const { sortBy, sortOrder } = useMemo(
    () => parseSortFromSearch(sortParam),
    [sortParam]
  );

  const [searchInput, setSearchInput] = useState(q);
  const [detailRow, setDetailRow] = useState<CallHistoryItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const { agents, loading: agentsLoading } = useDeployedAgentsList({
    page: 1,
    page_size: 100,
  });
  const { campaigns, loading: campaignsLoading } = useCampaigns({
    page: 1,
    page_size: 100,
  });

  const setQuery = useCallback(
    (updates: Record<string, string | undefined | null>) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === "") {
          p.delete(key);
        } else {
          p.set(key, value);
        }
      }
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filters = useMemo(
    () => ({
      call_type: direction,
      from_time: defaultRange.fromTime,
      to_time: defaultRange.toTime,
      search_keyword: q || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      agent_uuids: agentUuid || undefined,
      campaign_ids: campaignId || undefined,
      call_category: statusFilters.length ? statusFilters : undefined,
    }),
    [
      direction,
      defaultRange.fromTime,
      defaultRange.toTime,
      q,
      sortBy,
      sortOrder,
      agentUuid,
      campaignId,
      statusFilters,
    ]
  );

  const {
    calls,
    total,
    totalPages,
    loading,
    error,
  } = useGlobalCallHistory({
    filters,
    controlledPage: page,
    controlledPageSize: pageSize,
  });

  const setPage = (n: number) =>
    setQuery({ page: n <= 1 ? undefined : String(n) });
  const setPageSize = (n: number) =>
    setQuery({ ps: n === 10 ? undefined : String(n), page: undefined });

  const toggleSort = (col: "call_ts" | "duration_seconds") => {
    const sameCol = sortBy === col;
    const nextOrder = sameCol
      ? sortOrder === "asc"
        ? "desc"
        : "asc"
      : "desc";
    const nextSort = `${col}:${nextOrder}`;
    const isDefault = nextSort === "call_ts:desc";
    setQuery({
      sort: isDefault ? undefined : nextSort,
      page: undefined,
    });
  };

  const SortIcon = ({ col }: { col: "call_ts" | "duration_seconds" }) => {
    if (sortBy !== col)
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5" />
    );
  };

  const toggleStatus = (id: string) => {
    const next = statusFilters.includes(id)
      ? statusFilters.filter((x) => x !== id)
      : [...statusFilters, id];
    setQuery({
      cat: next.length ? next.join(",") : undefined,
      page: undefined,
    });
  };

  const filtersReady = !agentsLoading && !campaignsLoading;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Call history
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filters sync to the URL — share or bookmark a view. Default window: last
          90 days.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by agent, campaign, or phone number…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setQuery({
                q: searchInput.trim() || undefined,
                page: undefined,
              });
            }
          }}
          className="max-w-md rounded-xl"
        />
        <Button
          variant="secondary"
          size="sm"
          className="rounded-xl"
          onClick={() =>
            setQuery({
              q: searchInput.trim() || undefined,
              page: undefined,
            })
          }
        >
          Search
        </Button>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-1.5">
          <Select
            value={direction}
            onValueChange={(v) => {
              if (v === "all" || v === "inbound" || v === "outbound") {
                setQuery({ dir: v === "all" ? undefined : v, page: undefined });
              }
            }}
          >
            <SelectTrigger className="h-8 w-[140px] border-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All directions</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-1.5">
          <Select
            value={agentUuid || "all"}
            disabled={!filtersReady}
            onValueChange={(v) => {
              setQuery({
                agent: v === "all" ? undefined : v,
                page: undefined,
              });
            }}
          >
            <SelectTrigger className="h-8 w-[min(200px,50vw)] border-0 shadow-none">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.pipeline_deploy_uuid} value={a.pipeline_deploy_uuid}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-card px-3 py-1.5">
          <Select
            value={campaignId || "all"}
            disabled={!filtersReady}
            onValueChange={(v) => {
              setQuery({
                campaign: v === "all" ? undefined : v,
                page: undefined,
              });
            }}
          >
            <SelectTrigger className="h-8 w-[min(200px,50vw)] border-0 shadow-none">
              <SelectValue placeholder="Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.campaign_id} value={c.campaign_id}>
                  {c.campaign_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={!filtersReady}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-[var(--studio-border)] bg-card px-3 text-sm font-normal hover:bg-accent disabled:opacity-50"
          >
            {statusFilters.length
              ? `${statusFilters.length} status filters`
              : "All statuses"}
            <ChevronDown className="h-4 w-4 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Call status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((o) => (
              <DropdownMenuCheckboxItem
                key={o.id}
                checked={statusFilters.includes(o.id)}
                onCheckedChange={() => toggleStatus(o.id)}
              >
                {o.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium tabular-nums text-foreground">{calls.length}</span>{" "}
        on this page ·{" "}
        <span className="font-medium tabular-nums text-foreground">{total}</span> total
      </p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--studio-border)] bg-card shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50">
              <th className="px-4 py-3 font-medium">Direction</th>
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center hover:text-foreground"
                  onClick={() => toggleSort("call_ts")}
                >
                  Timestamp
                  <SortIcon col="call_ts" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center hover:text-foreground"
                  onClick={() => toggleSort("duration_seconds")}
                >
                  Duration
                  <SortIcon col="duration_seconds" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : calls.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No calls match your filters.
                </td>
              </tr>
            ) : (
              calls.map((row, idx) => (
                <tr
                  key={row.call_id}
                  onClick={() => {
                    setDetailRow(row);
                    setSheetOpen(true);
                  }}
                  className={cn(
                    "cursor-pointer border-b border-[var(--studio-border)]/60 transition-colors hover:bg-[var(--studio-surface-muted)]/60",
                    idx % 2 === 1 && "bg-[var(--studio-surface-muted)]/30"
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      {row.call_type === "inbound" ? (
                        <PhoneIncoming className="h-4 w-4 text-[var(--studio-teal)]" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-[var(--studio-mauve)]" />
                      )}
                      <span className="capitalize">{row.call_type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {formatCallTime(row.call_ts)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3" title={row.agent_name}>
                    {row.agent_name}
                  </td>
                  <td className="max-w-[180px] px-4 py-3">
                    {row.campaign_id && row.campaign_name ? (
                      <Link
                        href={`/dashboard/campaign/${row.campaign_id}`}
                        className="text-primary underline-offset-4 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.campaign_name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.from_number}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.to_number}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatDuration(row.duration_seconds)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {statusLabel(row)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
        <span className="text-muted-foreground">Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            if (v) setPageSize(Number(v));
          }}
        >
          <SelectTrigger className="h-9 w-[72px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">
          Page {page} of {totalPages} ({total} total)
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            disabled={page <= 1}
            onClick={() => setPage(1)}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CampaignCallDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        row={detailRow}
        campaignName={detailRow?.campaign_name}
      />
    </div>
  );
}
