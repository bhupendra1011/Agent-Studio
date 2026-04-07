"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearImpersonation,
  readImpersonation,
  writeImpersonation,
} from "@/lib/impersonation-storage";
import { useCallback, useEffect, useState } from "react";

export function AdminSessionToolsClient() {
  const [label, setLabel] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const sync = useCallback(() => {
    setActive(readImpersonation()?.label ?? null);
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  const start = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    writeImpersonation({ label: trimmed, note: "admin-console" });
    setActive(trimmed);
    window.dispatchEvent(new Event("studio-impersonation-change"));
  };

  const stop = () => {
    clearImpersonation();
    setActive(null);
    window.dispatchEvent(new Event("studio-impersonation-change"));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--studio-ink)]">
          Session tools
        </h1>
        <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
          Manual impersonation banner. Prefer <strong>User Management → View as</strong>{" "}
          when testing a specific row.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
          Impersonation banner
        </h2>
        <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
          Sets the top banner only — does not switch server session or tenant.
        </p>
        {active ? (
          <p className="mt-4 rounded-xl border border-[var(--studio-teal)]/30 bg-[var(--studio-teal)]/5 px-4 py-3 text-sm text-[var(--studio-ink)]">
            Active: <span className="font-semibold">{active}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--studio-ink-muted)]">
            No banner active.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--studio-ink-muted)]">
              Display label
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. john.doe@acme.com"
              className="mt-1 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") start();
              }}
            />
          </div>
          <Button
            type="button"
            className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)]"
            onClick={start}
          >
            Start
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={stop}>
            Clear
          </Button>
        </div>
      </section>
    </div>
  );
}
