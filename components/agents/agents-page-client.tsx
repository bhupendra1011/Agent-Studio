"use client";

import { CreateAgentModal } from "@/components/agents/create-agent-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { MergedAgent } from "@/hooks/use-agents";
import { useAgents } from "@/hooks/use-agents";
import { maskAppId } from "@/lib/format-app-id";
import { initialsFromName } from "@/lib/initials-from-name";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatDt(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function AgentsPageClient() {
  const [listParams, setListParams] = useState({
    page: 1,
    page_size: 10,
    keyword: undefined as string | undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteAgent, setDeleteAgent] = useState<MergedAgent | null>(null);
  const [renameTarget, setRenameTarget] = useState<MergedAgent | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingRename, setPendingRename] = useState(false);

  const onParamsChange = useCallback(
    (next: { keyword?: string; page?: number; page_size?: number }) => {
      setListParams((prev) => ({ ...prev, ...next }));
    },
    []
  );

  const {
    agents,
    loading,
    total,
    search,
    setPage,
    currentPage,
    totalPages,
    refetch,
    deleteAgent: removeAgent,
    renameAgent: doRename,
    duplicateAgent,
    toggleAgentStatus,
  } = useAgents(listParams, { onParamsChange });

  useEffect(() => {
    const t = setTimeout(() => {
      void search(searchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  const statusVariant = useCallback((s: MergedAgent["status"]) => {
    if (s === "live")
      return "bg-[var(--studio-teal)]/20 text-[var(--studio-ink)] border-[var(--studio-teal)]/40";
    if (s === "paused")
      return "bg-amber-500/15 text-amber-900 dark:text-amber-100 border-amber-500/30";
    return "bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)] border-[var(--studio-border)]";
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteAgent) return;
    setPendingDelete(true);
    try {
      await removeAgent(deleteAgent.pipeline_id);
      setDeleteAgent(null);
    } finally {
      setPendingDelete(false);
    }
  };

  const handleConfirmRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setPendingRename(true);
    try {
      await doRename(renameTarget.pipeline_id, renameValue.trim());
      setRenameTarget(null);
    } finally {
      setPendingRename(false);
    }
  };

  const openRename = (a: MergedAgent) => {
    setRenameTarget(a);
    setRenameValue(a.name);
  };

  const showEmpty = useMemo(
    () => !loading && agents.length === 0,
    [loading, agents.length]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight text-[var(--studio-ink)]">
          Agents
        </h1>
        <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
          Create and manage conversational voice AI agents.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by agent…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-md rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface)]"
        />
        <Button
          type="button"
          className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
          onClick={() => setCreateOpen(true)}
        >
          + Create Agent
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 text-[var(--studio-ink-muted)]">
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Agent ID</th>
                <th className="px-4 py-3 font-medium">Project / App ID</th>
                <th className="px-4 py-3 font-medium">Last published</th>
                <th className="px-4 py-3 font-medium">Last edited</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-12 px-4 py-3 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    Loading agents…
                  </td>
                </tr>
              ) : showEmpty ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    No agents yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                agents.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[var(--studio-border)] last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-[var(--studio-border)]">
                          <AvatarFallback className="bg-[var(--studio-mauve-dim)] text-xs font-medium text-[var(--studio-ink)]">
                            {initialsFromName(a.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[var(--studio-ink)] line-clamp-1">
                            {a.name}
                          </div>
                          <div className="text-xs capitalize text-[var(--studio-ink-muted)]">
                            {a.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--studio-ink-muted)]">
                      {a.agent_id ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      <div className="line-clamp-1">
                        {a.project_name ?? "—"}
                      </div>
                      <div className="font-mono text-xs">
                        {maskAppId(a.app_id)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {formatDt(a.last_deployed_time)}
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {formatDt(a.update_time)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`rounded-lg capitalize border ${statusVariant(a.status)}`}
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--studio-ink)] hover:bg-[var(--studio-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            className="rounded-lg"
                            onClick={() => openRename(a)}
                          >
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-lg"
                            onClick={() => void duplicateAgent(a)}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          {a.project_id && a.agent_id ? (
                            <DropdownMenuItem
                              className="rounded-lg"
                              onClick={() => void toggleAgentStatus(a)}
                            >
                              {a.status === "live" ? "Pause" : "Resume"}
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            className="rounded-lg text-red-600 focus:text-red-600"
                            onClick={() => setDeleteAgent(a)}
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--studio-ink-muted)]">
        <span>
          Page {currentPage} of {Math.max(totalPages, 1)} · {total} pipeline
          {total !== 1 ? "s" : ""} (rows may expand per deployment)
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={currentPage <= 1 || loading}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={currentPage >= totalPages || loading || totalPages === 0}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <CreateAgentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void refetch()}
      />

      <Dialog
        open={Boolean(deleteAgent)}
        onOpenChange={(o) => !o && setDeleteAgent(null)}
      >
        <DialogContent className="border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete agent</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--studio-ink-muted)]">
            Delete pipeline{" "}
            <span className="font-medium text-[var(--studio-ink)]">
              {deleteAgent?.name}
            </span>
            ? This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteAgent(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              disabled={pendingDelete}
              onClick={() => void handleConfirmDelete()}
            >
              {pendingDelete ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(renameTarget)}
        onOpenChange={(o) => !o && setRenameTarget(null)}
      >
        <DialogContent className="border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename agent</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="rounded-xl border-[var(--studio-border)]"
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setRenameTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)]"
              disabled={
                pendingRename ||
                !renameValue.trim() ||
                renameValue.trim() === renameTarget?.name
              }
              onClick={() => void handleConfirmRename()}
            >
              {pendingRename ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
