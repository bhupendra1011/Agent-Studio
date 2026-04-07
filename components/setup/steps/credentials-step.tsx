"use client";

import { SetupPasswordInput } from "@/components/setup/password-input";
import { cn } from "@/lib/utils";
import {
  CREDENTIAL_PRESETS,
  type CredentialPreset,
} from "@/lib/integration/credential-presets";
import { Check } from "lucide-react";

const LLM_PRESETS = CREDENTIAL_PRESETS.filter((p) => p.type_key === "llm");
const ASR_PRESETS = CREDENTIAL_PRESETS.filter((p) => p.type_key === "asr");
const TTS_PRESETS = CREDENTIAL_PRESETS.filter((p) => p.type_key === "tts");

function emptyFromPreset(preset: CredentialPreset): Record<string, string> {
  const o: Record<string, string> = {};
  for (const f of preset.fields) o[f.key] = "";
  return o;
}

export interface CredentialsStepData {
  llmPresetId: string;
  llmValues: Record<string, string>;
  asrPresetId: string;
  asrValues: Record<string, string>;
  ttsPresetId: string;
  ttsValues: Record<string, string>;
}

const defaultLlm = LLM_PRESETS[0];
const defaultAsr = ASR_PRESETS[0];
const defaultTts = TTS_PRESETS[0];

export const defaultCredentialsData: CredentialsStepData = {
  llmPresetId: defaultLlm?.id ?? "llm-openai",
  llmValues: defaultLlm ? emptyFromPreset(defaultLlm) : {},
  asrPresetId: defaultAsr?.id ?? "asr-microsoft",
  asrValues: defaultAsr ? emptyFromPreset(defaultAsr) : {},
  ttsPresetId: defaultTts?.id ?? "tts-microsoft",
  ttsValues: defaultTts ? emptyFromPreset(defaultTts) : {},
};

function PresetChips({
  presets,
  selectedId,
  onSelect,
}: {
  presets: CredentialPreset[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {presets.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            selectedId === p.id
              ? "border-[var(--studio-teal)] bg-[color-mix(in_oklch,var(--studio-teal)_10%,transparent)] text-[var(--studio-teal)]"
              : "border-[var(--studio-border)] bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)] hover:border-[var(--studio-ink-muted)]"
          )}
        >
          {p.label.replace(/\s*\([^)]+\)\s*$/, "")}
        </button>
      ))}
    </div>
  );
}

function Section({
  title,
  presets,
  presetId,
  values,
  onPresetId,
  onValues,
  optional,
}: {
  title: string;
  presets: CredentialPreset[];
  presetId: string;
  values: Record<string, string>;
  onPresetId: (id: string) => void;
  onValues: (next: Record<string, string>) => void;
  optional?: boolean;
}) {
  const preset = presets.find((p) => p.id === presetId) ?? presets[0];
  if (!preset) return null;

  return (
    <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--studio-ink)]">
          {title}
        </span>
        {optional ? (
          <span className="text-[0.625rem] font-medium uppercase tracking-wide text-[var(--studio-ink-muted)]">
            Optional
          </span>
        ) : null}
      </div>
      <PresetChips
        presets={presets}
        selectedId={preset.id}
        onSelect={(id) => {
          const p = presets.find((x) => x.id === id);
          onPresetId(id);
          if (p) onValues(emptyFromPreset(p));
        }}
      />
      <div className="space-y-3">
        {preset.fields.map((field) =>
          field.secret ? (
            <div key={field.key}>
              <label
                htmlFor={`cred-${field.key}`}
                className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
              >
                {field.label}
              </label>
              <SetupPasswordInput
                id={`cred-${field.key}`}
                value={values[field.key] ?? ""}
                onChange={(v) =>
                  onValues({ ...values, [field.key]: v })
                }
                placeholder={field.placeholder}
              />
            </div>
          ) : (
            <div key={field.key}>
              <label
                htmlFor={`cred-${field.key}`}
                className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
              >
                {field.label}
              </label>
              <input
                id={`cred-${field.key}`}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  onValues({ ...values, [field.key]: e.target.value })
                }
                placeholder={field.placeholder}
                className="h-10 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 text-sm text-[var(--studio-ink)]"
              />
            </div>
          )
        )}
      </div>
      {Object.values(values).some((v) => v.trim().length > 0) ? (
        <div className="mt-2 flex items-center gap-1 text-[0.6875rem] text-[var(--studio-teal)]">
          <Check className="h-3 w-3" strokeWidth={2.5} />
          Ready to save on continue
        </div>
      ) : null}
    </div>
  );
}

export function CredentialsStep({
  data,
  onChange,
}: {
  data: CredentialsStepData;
  onChange: (next: CredentialsStepData) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Section
        title="LLM provider"
        presets={LLM_PRESETS}
        presetId={data.llmPresetId}
        values={data.llmValues}
        onPresetId={(llmPresetId) => onChange({ ...data, llmPresetId })}
        onValues={(llmValues) => onChange({ ...data, llmValues })}
      />
      <Section
        title="Speech recognition (ASR)"
        presets={ASR_PRESETS}
        presetId={data.asrPresetId}
        values={data.asrValues}
        onPresetId={(asrPresetId) => onChange({ ...data, asrPresetId })}
        onValues={(asrValues) => onChange({ ...data, asrValues })}
        optional
      />
      <Section
        title="Voice synthesis (TTS)"
        presets={TTS_PRESETS}
        presetId={data.ttsPresetId}
        values={data.ttsValues}
        onPresetId={(ttsPresetId) => onChange({ ...data, ttsPresetId })}
        onValues={(ttsValues) => onChange({ ...data, ttsValues })}
        optional
      />
    </div>
  );
}

export function credentialsStepValid(data: CredentialsStepData): boolean {
  const preset =
    LLM_PRESETS.find((p) => p.id === data.llmPresetId) ?? LLM_PRESETS[0];
  if (!preset) return false;
  const keyField = preset.fields.find((f) => f.secret) ?? preset.fields[0];
  const keyVal = keyField ? (data.llmValues[keyField.key] ?? "").trim() : "";
  return keyVal.length > 0;
}

export function buildCredentialCreates(data: CredentialsStepData): Array<{
  name: string;
  type_key: string;
  vendor: string;
  resource_data: Record<string, unknown>;
}> {
  const out: Array<{
    name: string;
    type_key: string;
    vendor: string;
    resource_data: Record<string, unknown>;
  }> = [];

  const llmPreset =
    LLM_PRESETS.find((p) => p.id === data.llmPresetId) ?? LLM_PRESETS[0];
  if (llmPreset) {
    const rd: Record<string, unknown> = {};
    for (const f of llmPreset.fields) {
      rd[f.key] = data.llmValues[f.key] ?? "";
    }
    const hasAny = Object.values(rd).some(
      (v) => typeof v === "string" && v.trim().length > 0
    );
    if (hasAny) {
      out.push({
        name: `Onboarding — ${llmPreset.label}`,
        type_key: llmPreset.type_key,
        vendor: llmPreset.vendor,
        resource_data: rd,
      });
    }
  }

  const pushOptional = (
    preset: CredentialPreset | undefined,
    values: Record<string, string>,
    label: string
  ) => {
    if (!preset) return;
    const rd: Record<string, unknown> = {};
    for (const f of preset.fields) {
      rd[f.key] = values[f.key] ?? "";
    }
    const hasAny = Object.values(rd).some(
      (v) => typeof v === "string" && v.trim().length > 0
    );
    if (!hasAny) return;
    out.push({
      name: `Onboarding — ${label}`,
      type_key: preset.type_key,
      vendor: preset.vendor,
      resource_data: rd,
    });
  };

  pushOptional(
    ASR_PRESETS.find((p) => p.id === data.asrPresetId),
    data.asrValues,
    "ASR"
  );
  pushOptional(
    TTS_PRESETS.find((p) => p.id === data.ttsPresetId),
    data.ttsValues,
    "TTS"
  );

  return out;
}
