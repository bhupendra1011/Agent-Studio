"use client";

import { CreateKnowledgeBaseModal } from "@/components/integration/create-knowledge-base-modal";
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
import { useKnowledgeBases } from "@/hooks/use-knowledge-bases";
import type { KnowledgeBase } from "@/lib/types/api";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

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

export function KnowledgeBasesTabClient() {
  const [searchInput, setSearchInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeBase | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  const {
    knowledgeBases,
    loading,
    total,
    currentPage,
    totalPages,
    setPage,
    setSearch,
    deleteKnowledgeBase,
    createKnowledgeBase,
    isDeleting,
    isCreating,
  } = useKnowledgeBases({ page: 1, page_size: 10 });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setSearch]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setPendingDelete(true);
    try {
      await deleteKnowledgeBase(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setPendingDelete(false);
    }
  };

  const showEmpty = !loading && knowledgeBases.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold text-[var(--studio-ink)]">
          Knowledge bases
        </h2>
        <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
          Documents your agents can retrieve during conversations.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-md rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface)]"
        />
        <Button
          type="button"
          className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
          onClick={() => setCreateOpen(true)}
        >
          + Add knowledge base
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 text-[var(--studio-ink-muted)]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Documents</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="w-12 px-4 py-3 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    Loading knowledge bases…
                  </td>
                </tr>
              ) : showEmpty ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    No knowledge bases yet. Create one and upload PDF or DOCX
                    files.
                  </td>
                </tr>
              ) : (
                knowledgeBases.map((kb) => (
                  <tr
                    key={kb.id}
                    className="border-b border-[var(--studio-border)] last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--studio-ink)]">
                        {kb.name}
                      </div>
                      {kb.description ? (
                        <div className="mt-0.5 line-clamp-1 text-xs text-[var(--studio-ink-muted)]">
                          {kb.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="rounded-lg border-[var(--studio-border)] capitalize"
                      >
                        {(kb.status ?? "—").toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {kb.totalDocuments ?? 0}
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {formatDt(kb.updatedAt)}
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
                            className="rounded-lg text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(kb)}
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
          Page {currentPage} of {Math.max(totalPages, 1)} · {total} knowledge
          base
          {total !== 1 ? "s" : ""}
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

      <CreateKnowledgeBaseModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSubmitting={isCreating}
        onSubmit={async (input) => {
          await createKnowledgeBase(input);
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete knowledge base</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--studio-ink-muted)]">
            Delete{" "}
            <span className="font-medium text-[var(--studio-ink)]">
              {deleteTarget?.name}
            </span>
            ? This cannot be undone.
          </p>
          <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
              disabled={pendingDelete || isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {pendingDelete ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
