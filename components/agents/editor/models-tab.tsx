"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown, Ear, MessageSquareText, Volume2 } from "lucide-react";
import type { Dispatch } from "react";
import { useState } from "react";
import type { EditorAction, EditorState } from "./editor-types";

const ASR_VENDORS = [
  { value: "microsoft", label: "Microsoft Azure" },
  { value: "google", label: "Google Cloud" },
  { value: "deepgram", label: "Deepgram" },
  { value: "tencent", label: "Tencent Cloud" },
];

const LLM_VENDORS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google Gemini" },
  { value: "dashscope", label: "Alibaba DashScope" },
  { value: "bytedance", label: "Volcengine" },
];

const TTS_VENDORS = [
  { value: "microsoft", label: "Microsoft Azure" },
  { value: "elevenlabs", label: "ElevenLabs" },
  { value: "bytedance", label: "Volcengine" },
  { value: "google", label: "Google Cloud" },
];

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
];

interface ModelsTabProps {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

function ModelCard({
  icon: Icon,
  iconColor,
  title,
  description,
  children,
  expandedContent,
  delay,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  delay: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] studio-reveal",
        delay
      )}
    >
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              iconColor
            )}
          >
            <Icon className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              {description}
            </p>
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </div>

      {expandedContent && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-[var(--studio-border)] px-6 py-2.5 text-xs font-medium text-[var(--studio-ink-muted)] transition-colors hover:text-[var(--studio-ink)]"
          >
            Advanced settings
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </button>
          {expanded && (
            <div className="border-t border-[var(--studio-border)] p-6 pt-4 studio-reveal">
              {expandedContent}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function ModelsTab({ state, dispatch }: ModelsTabProps) {
  const { asr, llm, tts } = state.graphData;

  return (
    <div className="space-y-6">
      {/* ASR Card */}
      <ModelCard
        icon={Ear}
        iconColor="bg-blue-500"
        title="ASR — Speech Recognition"
        description="Converts user speech into text"
        delay="studio-reveal-d1"
        expandedContent={
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Resource ID
              </Label>
              <Input
                value={(asr?.params?.resource_id as string) ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_ASR",
                    payload: {
                      params: { ...asr?.params, resource_id: e.target.value },
                    },
                  })
                }
                placeholder="Credential resource UUID"
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Region
              </Label>
              <Input
                value={asr?.params?.region ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_ASR",
                    payload: {
                      params: { ...asr?.params, region: e.target.value },
                    },
                  })
                }
                placeholder="eastus"
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
              />
            </div>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Vendor
            </Label>
            <Select
              value={asr?.vendor ?? "microsoft"}
              onValueChange={(v) => {
                if (v) dispatch({ type: "SET_ASR", payload: { vendor: v } });
              }}
            >
              <SelectTrigger className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ASR_VENDORS.map((v) => (
                  <SelectItem key={v.value} value={v.value} className="rounded-lg">
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Language
            </Label>
            <Select
              value={asr?.params?.language ?? "en-US"}
              onValueChange={(v) => {
                if (v) dispatch({ type: "SET_ASR", payload: { params: { ...asr?.params, language: v } } });
              }}
            >
              <SelectTrigger className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="rounded-lg">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModelCard>

      {/* LLM Card */}
      <ModelCard
        icon={MessageSquareText}
        iconColor="bg-[var(--studio-teal)]"
        title="LLM — Language Model"
        description="Generates intelligent responses"
        delay="studio-reveal-d2"
        expandedContent={
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Endpoint URL
              </Label>
              <Input
                value={llm?.url ?? ""}
                onChange={(e) =>
                  dispatch({ type: "SET_LLM", payload: { url: e.target.value } })
                }
                placeholder="https://api.openai.com/v1/chat/completions"
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Resource ID
              </Label>
              <Input
                value={llm?.resource_id ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_LLM",
                    payload: { resource_id: e.target.value },
                  })
                }
                placeholder="Credential resource UUID"
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Max Tokens
              </Label>
              <Input
                type="number"
                value={llm?.params?.max_tokens ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_LLM",
                    payload: {
                      params: {
                        ...llm?.params,
                        max_tokens: e.target.value ? Number(e.target.value) : undefined,
                      },
                    },
                  })
                }
                placeholder="1024"
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
              />
            </div>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Vendor
            </Label>
            <Select
              value={llm?.vendor ?? "openai"}
              onValueChange={(v) => {
                if (v) dispatch({ type: "SET_LLM", payload: { vendor: v } });
              }}
            >
              <SelectTrigger className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LLM_VENDORS.map((v) => (
                  <SelectItem key={v.value} value={v.value} className="rounded-lg">
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Model
            </Label>
            <Input
              value={llm?.params?.model ?? ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_LLM",
                  payload: { params: { ...llm?.params, model: e.target.value } },
                })
              }
              placeholder="gpt-4o-mini"
              className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
            />
          </div>
        </div>
      </ModelCard>

      {/* TTS Card */}
      <ModelCard
        icon={Volume2}
        iconColor="bg-[var(--studio-mauve)]"
        title="TTS — Text to Speech"
        description="Converts agent responses into natural speech"
        delay="studio-reveal-d3"
        expandedContent={
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Resource ID
              </Label>
              <Input
                value={(tts?.params?.resource_id as string) ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_TTS",
                    payload: {
                      params: { ...tts?.params, resource_id: e.target.value },
                    },
                  })
                }
                placeholder="Credential resource UUID"
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 font-mono text-xs"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                  Speed
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2"
                  value={tts?.params?.speed ?? tts?.params?.speed_ratio ?? 1}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_TTS",
                      payload: {
                        params: { ...tts?.params, speed: Number(e.target.value) },
                      },
                    })
                  }
                  className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
                />
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                  Volume
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={tts?.params?.volume ?? 70}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_TTS",
                      payload: {
                        params: { ...tts?.params, volume: Number(e.target.value) },
                      },
                    })
                  }
                  className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
                />
              </div>
            </div>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Vendor
            </Label>
            <Select
              value={tts?.vendor ?? "microsoft"}
              onValueChange={(v) => {
                if (v) dispatch({ type: "SET_TTS", payload: { vendor: v } });
              }}
            >
              <SelectTrigger className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {TTS_VENDORS.map((v) => (
                  <SelectItem key={v.value} value={v.value} className="rounded-lg">
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Voice
            </Label>
            <Input
              value={
                tts?.params?.voice_name ?? tts?.params?.voice_type ?? ""
              }
              onChange={(e) =>
                dispatch({
                  type: "SET_TTS",
                  payload: {
                    params: { ...tts?.params, voice_name: e.target.value },
                  },
                })
              }
              placeholder="en-US-AndrewMultilingualNeural"
              className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
            />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
            Language
          </Label>
          <Select
            value={tts?.params?.language ?? "en-US"}
            onValueChange={(v) => {
              if (v) dispatch({ type: "SET_TTS", payload: { params: { ...tts?.params, language: v } } });
            }}
          >
            <SelectTrigger className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value} className="rounded-lg">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ModelCard>
    </div>
  );
}
