"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useDeleteCampaign, useInterruptCampaign } from "@/hooks/use-campaign-mutations";
import type { Campaign } from "@/lib/types/api";
import {
  formatScheduledStartTime,
  transformStatus,
} from "@/lib/utils/campaign-details";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function statusBadge(status: string) {
  const t = transformStatus(status);
  const cls =
    t === "Completed"
      ? "bg-[var(--studio-surface-muted)] text-[var(--studio-ink)]"
      : t === "Active" || t === "Scheduled"
        ? "bg-[var(--studio-teal)]/20 text-[var(--studio-ink)]"
        : t === "Paused"
          ? "bg-amber-500/20 text-amber-900 dark:text-amber-100"
          : "bg-[var(--studio-mauve-dim)] text-[var(--studio-ink)]";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {t}
    </span>
  );
}

function progress(c: Campaign) {
  const done = c.already_dialed_count ?? 0;
  const total =
    c.recipients_phone_number_count ??
    c.total_calls ??
    c.phone_numbers ??
    0;
  return `${done}/${total || "—"}`;
}

export function CampaignListPageClient() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const {
    campaigns,
    loading,
    total,
    currentPage,
    totalPages,
    setPage,
    setQueryParams,
    refetch,
  } = useCampaigns({ page: 1, page_size: 10 });

  const deleteMut = useDeleteCampaign();
  const interruptMut = useInterruptCampaign();

  useEffect(() => {
    const t = setTimeout(() => {
      setQueryParams((prev) => ({
        ...prev,
        search_keyword: searchInput.trim() || undefined,
        page: 1,
      }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setQueryParams]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await deleteMut.mutateAsync(id);
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInterrupt = async (id: string) => {
    try {
      await interruptMut.mutateAsync(id);
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold text-[var(--studio-ink)]">
            Campaign
          </h2>
          <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
            Manage and monitor your outbound calling campaigns.
          </p>
        </div>
        <Link
          href="/dashboard/campaign/create"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--studio-teal)] px-4 text-sm font-medium text-[var(--studio-ink)] transition-opacity hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create campaign
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by agent, campaign name, or phone…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xl rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface)]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 text-[var(--studio-ink-muted)]">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Scheduled</th>
                <th className="w-12 px-4 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    Loading campaigns…
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    No campaigns yet. Create one to start outbound dialing.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr
                    key={c.campaign_id}
                    className="border-b border-[var(--studio-border)]/80 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--studio-ink)]">
                      {c.campaign_name}
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {c.agent_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--studio-ink-muted)]">
                      {c.phone_number || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {progress(c)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {formatScheduledStartTime(c.scheduled_start_time)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/campaign/${c.campaign_id}`)
                            }
                          >
                            View results
                          </DropdownMenuItem>
                          {(c.status === "scheduled" || c.status === "running") && (
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/campaign/${c.campaign_id}/edit`)
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          {c.status === "running" && (
                            <DropdownMenuItem onClick={() => handleInterrupt(c.campaign_id)}>
                              Stop campaign
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(c.campaign_id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--studio-border)] px-4 py-3 text-sm text-[var(--studio-ink-muted)]">
            <span>
              {total} campaign{total === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
