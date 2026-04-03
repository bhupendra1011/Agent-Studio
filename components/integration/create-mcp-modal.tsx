"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uiTransportToApi } from "@/lib/integration/mcp-transport";
import type { CreateMcpRequest } from "@/lib/types/api";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface CreateMcpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: CreateMcpRequest) => Promise<void>;
  isSubmitting?: boolean;
}

type Row = { key: string; value: string };

const TRANSPORTS = [
  { value: "sse", label: "SSE" },
  { value: "http", label: "HTTP" },
  { value: "streamable_http", label: "Streamable HTTP" },
] as const;

export function CreateMcpModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateMcpModalProps) {
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [timeoutMs, setTimeoutMs] = useState("10000");
  const [transport, setTransport] = useState<string>("sse");
  const [description, setDescription] = useState("");
  const [headerRows, setHeaderRows] = useState<Row[]>([]);
  const [queryRows, setQueryRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEndpoint("");
    setTimeoutMs("10000");
    setTransport("sse");
    setDescription("");
    setHeaderRows([]);
    setQueryRows([]);
  }, [open]);

  const addHeader = useCallback(() => {
    setHeaderRows((r) => [...r, { key: "", value: "" }]);
  }, []);

  const addQuery = useCallback(() => {
    setQueryRows((r) => [...r, { key: "", value: "" }]);
  }, []);

  const toObject = (rows: Row[]): Record<string, string> | undefined => {
    const o: Record<string, string> = {};
    for (const row of rows) {
      const k = row.key.trim();
      if (k) o[k] = row.value;
    }
    return Object.keys(o).length ? o : undefined;
  };

  const handleSave = async () => {
    if (!name.trim() || !endpoint.trim()) return;
    const t = Number(timeoutMs);
    const timeout_ms = Number.isFinite(t) && t > 0 ? t : 10000;
    const body: CreateMcpRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      config: {
        endpoint: endpoint.trim(),
        transport: uiTransportToApi(transport),
        timeout_ms,
        headers: toObject(headerRows),
        queries: toObject(queryRows),
      },
    };
    await onSubmit(body);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-syne)] text-lg">
            Add MCP server
          </DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1">
          <div className="grid gap-2">
            <Label htmlFor="mcp-name">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="mcp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MCP server name"
              className="rounded-xl border-[var(--studio-border)]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div className="grid gap-2">
              <Label htmlFor="mcp-url">
                Server URL <span className="text-red-600">*</span>
              </Label>
              <Input
                id="mcp-url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://example.com/sse"
                className="rounded-xl border-[var(--studio-border)]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mcp-timeout">Timeout (ms)</Label>
              <Input
                id="mcp-timeout"
                type="number"
                min={1000}
                step={500}
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(e.target.value)}
                className="rounded-xl border-[var(--studio-border)]"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="rounded-xl border-[var(--studio-border)]"
            />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium">
              Server protocol <span className="text-red-600">*</span>
            </span>
            <div className="flex flex-wrap gap-4">
              {TRANSPORTS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-[var(--studio-ink)]"
                >
                  <input
                    type="radio"
                    name="mcp-transport"
                    value={opt.value}
                    checked={transport === opt.value}
                    onChange={() => setTransport(opt.value)}
                    className="h-4 w-4 accent-[var(--studio-teal)]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <section className="rounded-xl border border-[var(--studio-border)] p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-[var(--studio-ink)]">
                  HTTP headers
                </h3>
                <p className="text-xs text-[var(--studio-ink-muted)]">
                  Optional authentication or custom headers.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-xl"
                onClick={addHeader}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add header
              </Button>
            </div>
            <div className="space-y-2">
              {headerRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Name"
                    value={row.key}
                    onChange={(e) => {
                      const v = e.target.value;
                      setHeaderRows((rows) =>
                        rows.map((r, j) => (j === i ? { ...r, key: v } : r))
                      );
                    }}
                    className="rounded-xl border-[var(--studio-border)]"
                  />
                  <Input
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => {
                      const v = e.target.value;
                      setHeaderRows((rows) =>
                        rows.map((r, j) => (j === i ? { ...r, value: v } : r))
                      );
                    }}
                    className="rounded-xl border-[var(--studio-border)]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 rounded-xl"
                    aria-label="Remove header"
                    onClick={() =>
                      setHeaderRows((rows) => rows.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[var(--studio-border)] p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-[var(--studio-ink)]">
                  Query parameters
                </h3>
                <p className="text-xs text-[var(--studio-ink-muted)]">
                  Appended to the server URL.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-xl"
                onClick={addQuery}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add parameter
              </Button>
            </div>
            <div className="space-y-2">
              {queryRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={row.key}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQueryRows((rows) =>
                        rows.map((r, j) => (j === i ? { ...r, key: v } : r))
                      );
                    }}
                    className="rounded-xl border-[var(--studio-border)]"
                  />
                  <Input
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQueryRows((rows) =>
                        rows.map((r, j) => (j === i ? { ...r, value: v } : r))
                      );
                    }}
                    className="rounded-xl border-[var(--studio-border)]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 rounded-xl"
                    aria-label="Remove parameter"
                    onClick={() =>
                      setQueryRows((rows) => rows.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
            disabled={isSubmitting || !name.trim() || !endpoint.trim()}
            onClick={() => void handleSave()}
          >
            {isSubmitting ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
