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
import {
  CREDENTIAL_PRESETS,
  findPreset,
  type CredentialPreset,
} from "@/lib/integration/credential-presets";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface CreateCredentialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: {
    name: string;
    type_key: string;
    vendor: string;
    resource_data: Record<string, unknown>;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

function emptyValues(preset: CredentialPreset): Record<string, string> {
  const o: Record<string, string> = {};
  for (const f of preset.fields) o[f.key] = "";
  return o;
}

export function CreateCredentialModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateCredentialModalProps) {
  const [presetId, setPresetId] = useState(CREDENTIAL_PRESETS[0]?.id ?? "");
  const [name, setName] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    CREDENTIAL_PRESETS[0]
      ? emptyValues(CREDENTIAL_PRESETS[0])
      : {}
  );
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  const preset = useMemo(() => findPreset(presetId), [presetId]);

  useEffect(() => {
    if (!open) return;
    setName("");
    const p = findPreset(presetId) ?? CREDENTIAL_PRESETS[0];
    if (p) setValues(emptyValues(p));
    setShowSecret({});
  }, [open, presetId]);

  const handlePresetChange = useCallback((id: string) => {
    setPresetId(id);
    const p = findPreset(id);
    if (p) setValues(emptyValues(p));
  }, []);

  const handleSave = async () => {
    if (!preset || !name.trim()) return;
    const resource_data: Record<string, unknown> = {};
    for (const f of preset.fields) {
      resource_data[f.key] = values[f.key] ?? "";
    }
    await onSubmit({
      name: name.trim(),
      type_key: preset.type_key,
      vendor: preset.vendor,
      resource_data,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-syne)] text-lg">
            Add credential
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cred-preset">Provider</Label>
              <select
                id="cred-preset"
                value={presetId}
                onChange={(e) => handlePresetChange(e.target.value)}
                className={cn(
                  "h-9 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] px-3 text-sm text-[var(--studio-ink)]"
                )}
              >
                {CREDENTIAL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cred-type-hint">Type</Label>
              <p
                id="cred-type-hint"
                className="flex h-9 items-center text-sm capitalize text-[var(--studio-ink-muted)]"
              >
                {preset?.type_key ?? "—"}
              </p>
            </div>
          </div>
          <p className="text-xs text-[var(--studio-ink-muted)]">
            Each credential supports one provider type. Create separate entries
            for other vendors or modalities.
          </p>

          <div className="grid gap-2">
            <Label htmlFor="cred-name">Name</Label>
            <Input
              id="cred-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production OpenAI"
              className="rounded-xl border-[var(--studio-border)]"
            />
          </div>

          {preset?.fields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label htmlFor={`cred-${field.key}`}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={`cred-${field.key}`}
                  type={
                    field.secret && !showSecret[field.key] ? "password" : "text"
                  }
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((s) => ({ ...s, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="rounded-xl border-[var(--studio-border)] pr-10"
                  autoComplete="off"
                />
                {field.secret ? (
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)] hover:text-[var(--studio-ink)]"
                    onClick={() =>
                      setShowSecret((s) => ({
                        ...s,
                        [field.key]: !s[field.key],
                      }))
                    }
                    aria-label={
                      showSecret[field.key] ? "Hide value" : "Show value"
                    }
                  >
                    {showSecret[field.key] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
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
            disabled={isSubmitting || !name.trim() || !preset}
            onClick={() => void handleSave()}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
