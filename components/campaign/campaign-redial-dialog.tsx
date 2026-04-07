"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadCampaignRedialExport } from "@/lib/services/campaign";
import { downloadCSV } from "@/lib/utils/file-download";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export interface CohortOption {
  id: string;
  label: string;
  contactCount: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  cohorts: CohortOption[];
  onCreateCampaign: (selectedCategories: string[], csvText: string, filename: string) => void;
}

export function CampaignRedialDialog({
  open,
  onOpenChange,
  campaignId,
  cohorts,
  onCreateCampaign,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [creating, setCreating] = useState(false);

  const toggle = (id: string) => {
    const c = cohorts.find((x) => x.id === id);
    if (!c || c.contactCount === 0) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const close = () => {
    setSelected([]);
    onOpenChange(false);
  };

  const onDownload = async () => {
    if (selected.length === 0) return;
    setDownloading(true);
    try {
      const res = await downloadCampaignRedialExport(campaignId, {
        call_category: selected,
      });
      if (res.code !== 0) throw new Error(res.message);
      downloadCSV(res.data, `redial-${campaignId}.csv`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const onCreate = async () => {
    if (selected.length === 0) return;
    setCreating(true);
    try {
      const res = await downloadCampaignRedialExport(campaignId, {
        call_category: selected,
      });
      if (res.code !== 0) throw new Error(res.message);
      onCreateCampaign(selected, res.data, `redial-${campaignId}.csv`);
      close();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <DialogHeader>
          <DialogTitle>Select cohorts for new campaign</DialogTitle>
          <p className="text-sm text-[var(--studio-ink-muted)]">
            Choose call outcomes to include in the redial list.
          </p>
        </DialogHeader>
        <ul className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[var(--studio-border)] p-3">
          {cohorts.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={c.contactCount === 0}
                onClick={() => toggle(c.id)}
                className={
                  "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors " +
                  (selected.includes(c.id)
                    ? "bg-[var(--studio-teal)]/20"
                    : "hover:bg-[var(--studio-surface-muted)]") +
                  (c.contactCount === 0 ? " opacity-40" : "")
                }
              >
                <span>{c.label}</span>
                <span className="text-[var(--studio-ink-muted)]">{c.contactCount}</span>
              </button>
            </li>
          ))}
        </ul>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" className="rounded-xl" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={selected.length === 0 || downloading}
            onClick={() => void onDownload()}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download CSV
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)]"
            disabled={selected.length === 0 || creating}
            onClick={() => void onCreate()}
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
