"use client";

import { AddPhoneNumberSheet } from "@/components/phone-numbers/add-phone-number-sheet";
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
import { usePhoneNumbers } from "@/hooks/use-phone-numbers";
import type { CreateSipNumberRequest, SipNumber } from "@/lib/types/api";
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

export function PhoneNumbersPageClient() {
  const [searchInput, setSearchInput] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<SipNumber | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SipNumber | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [inUseOpen, setInUseOpen] = useState(false);
  const [inUsePhone, setInUsePhone] = useState("");

  const {
    numbers,
    loading,
    total,
    currentPage,
    totalPages,
    setPage,
    setKeyword,
    deleteNumber,
    createNumber,
    updateNumber,
    checkEditStatus,
    isDeleting,
    isCreating,
    isUpdating,
  } = usePhoneNumbers({ page: 1, page_size: 10 });

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(searchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setKeyword]);

  const openCreate = () => {
    setSheetMode("create");
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (row: SipNumber) => {
    setSheetMode("edit");
    setEditing(row);
    setSheetOpen(true);
  };

  const handleDeleteRequest = async (row: SipNumber) => {
    if (checkingId) return;
    setCheckingId(row.id);
    try {
      const statuses = await checkEditStatus([row.id]);
      const st = statuses.find((s) => s.id === row.id);
      if (!st?.editable) {
        setInUsePhone(row.phone_number);
        setInUseOpen(true);
        return;
      }
      setDeleteTarget(row);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setPendingDelete(true);
    try {
      await deleteNumber(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setPendingDelete(false);
    }
  };

  const showEmpty = !loading && numbers.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold text-[var(--studio-ink)]">
          Phone numbers
        </h2>
        <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
          Outbound-only caller IDs over SIP trunk settings. Each row maps to a{" "}
          <code className="rounded bg-[var(--studio-surface-muted)] px-1 font-mono text-xs">
            phone_number_id
          </code>{" "}
          for campaigns and outbound APIs. Inbound calling is not in scope for
          this app.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by number or name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-md rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface)]"
        />
        <Button
          type="button"
          className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
          onClick={openCreate}
        >
          + Add phone number
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 text-[var(--studio-ink-muted)]">
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Display name</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">SIP domain</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="w-12 px-4 py-3 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    Loading phone numbers…
                  </td>
                </tr>
              ) : showEmpty ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[var(--studio-ink-muted)]"
                  >
                    No phone numbers yet. Add a SIP trunk to start outbound
                    calling.
                  </td>
                </tr>
              ) : (
                numbers.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-[var(--studio-border)] last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[var(--studio-ink)]">
                      {n.phone_number}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[var(--studio-ink)]">
                      {n.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {n.vendor || n.source || "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-[var(--studio-ink-muted)]">
                      {n.config?.outbound_configs?.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--studio-ink-muted)]">
                      {formatDt(n.update_time)}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--studio-ink)] hover:bg-[var(--studio-surface-muted)] focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none disabled:opacity-50"
                          disabled={checkingId === n.id}
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            className="rounded-lg"
                            onClick={() => openEdit(n)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-lg text-red-600 focus:text-red-600"
                            onClick={() => void handleDeleteRequest(n)}
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
          Page {currentPage} of {Math.max(totalPages, 1)} · {total} number
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

      <AddPhoneNumberSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        initial={editing}
        isSubmitting={isCreating || isUpdating}
        onCreate={async (body: CreateSipNumberRequest) => {
          await createNumber(body);
          setSheetOpen(false);
        }}
        onUpdate={async (id, body) => {
          await updateNumber({ id, body });
          setSheetOpen(false);
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete phone number</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--studio-ink-muted)]">
            Remove{" "}
            <span className="font-mono font-medium text-[var(--studio-ink)]">
              {deleteTarget?.phone_number}
            </span>
            ? Campaigns that reference this id may fail until you use another
            number.
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

      <Dialog open={inUseOpen} onOpenChange={setInUseOpen}>
        <DialogContent className="border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Number in use</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--studio-ink-muted)]">
            <span className="font-mono font-medium text-[var(--studio-ink)]">
              {inUsePhone}
            </span>{" "}
            cannot be deleted right now because it is linked to an active
            campaign or scheduled job. Remove those bindings in the main studio
            first.
          </p>
          <DialogFooter className="border-0 bg-transparent p-0">
            <Button
              className="rounded-xl"
              onClick={() => setInUseOpen(false)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
