"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Gauge, Radio, Shield, Timer } from "lucide-react";
import type { Dispatch } from "react";
import { useCallback } from "react";
import type { EditorAction, EditorState } from "./editor-types";

interface AdvancedTabProps {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

type Preset = "responsive" | "balanced" | "patient" | "custom";

const PRESETS: { id: Preset; label: string; desc: string; values: { threshold: number; silence_duration_ms: number; prefix_padding_ms: number } }[] = [
  {
    id: "responsive",
    label: "Responsive",
    desc: "Fast-paced conversations",
    values: { threshold: 0.4, silence_duration_ms: 300, prefix_padding_ms: 400 },
  },
  {
    id: "balanced",
    label: "Balanced",
    desc: "Most use cases",
    values: { threshold: 0.5, silence_duration_ms: 480, prefix_padding_ms: 800 },
  },
  {
    id: "patient",
    label: "Patient",
    desc: "Thoughtful conversations",
    values: { threshold: 0.6, silence_duration_ms: 800, prefix_padding_ms: 1200 },
  },
  {
    id: "custom",
    label: "Custom",
    desc: "Configure manually",
    values: { threshold: 0.5, silence_duration_ms: 480, prefix_padding_ms: 800 },
  },
];

function detectPreset(td: EditorState["graphData"]["turn_detection"]): Preset {
  if (!td) return "balanced";
  for (const p of PRESETS) {
    if (p.id === "custom") continue;
    if (
      td.threshold === p.values.threshold &&
      td.silence_duration_ms === p.values.silence_duration_ms &&
      td.prefix_padding_ms === p.values.prefix_padding_ms
    ) {
      return p.id;
    }
  }
  return "custom";
}

export function AdvancedTab({ state, dispatch }: AdvancedTabProps) {
  const td = state.graphData.turn_detection;
  const vad = state.graphData.vad;
  const af = state.graphData.advanced_features;
  const currentPreset = detectPreset(td);

  const applyPreset = useCallback(
    (preset: Preset) => {
      const p = PRESETS.find((x) => x.id === preset);
      if (!p || preset === "custom") return;
      dispatch({
        type: "SET_TURN_DETECTION",
        payload: p.values,
      });
    },
    [dispatch]
  );

  return (
    <div className="space-y-6">
      {/* Turn Detection */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d1">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500">
            <Gauge className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              Turn Detection
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              How the agent manages conversation flow and turn-taking
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-all",
                currentPreset === p.id
                  ? "border-[var(--studio-teal)] bg-[var(--studio-teal)]/10 shadow-sm"
                  : "border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 hover:border-[var(--studio-teal)]/30"
              )}
            >
              <div className="text-sm font-medium text-[var(--studio-ink)]">
                {p.label}
              </div>
              <div className="text-xs text-[var(--studio-ink-muted)]">
                {p.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Detail sliders */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-[var(--studio-ink-muted)]">
                Threshold
              </Label>
              <span className="font-mono text-xs text-[var(--studio-ink)]">
                {td?.threshold ?? 0.5}
              </span>
            </div>
            <Slider
              value={[td?.threshold ?? 0.5]}
              min={0.1}
              max={1.0}
              step={0.05}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                dispatch({ type: "SET_TURN_DETECTION", payload: { threshold: val } });
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-[var(--studio-ink-muted)]">
                Silence Duration (ms)
              </Label>
              <span className="font-mono text-xs text-[var(--studio-ink)]">
                {td?.silence_duration_ms ?? 480}
              </span>
            </div>
            <Slider
              value={[td?.silence_duration_ms ?? 480]}
              min={100}
              max={2000}
              step={20}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                dispatch({ type: "SET_TURN_DETECTION", payload: { silence_duration_ms: val } });
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-[var(--studio-ink-muted)]">
                Prefix Padding (ms)
              </Label>
              <span className="font-mono text-xs text-[var(--studio-ink)]">
                {td?.prefix_padding_ms ?? 800}
              </span>
            </div>
            <Slider
              value={[td?.prefix_padding_ms ?? 800]}
              min={100}
              max={2000}
              step={50}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                dispatch({ type: "SET_TURN_DETECTION", payload: { prefix_padding_ms: val } });
              }}
            />
          </div>

          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Interrupt Mode
            </Label>
            <div className="flex gap-2">
              {(["interrupt", "keep"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "SET_TURN_DETECTION",
                      payload: { interrupt_mode: mode },
                    })
                  }
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    (td?.interrupt_mode ?? "interrupt") === mode
                      ? "border-[var(--studio-teal)] bg-[var(--studio-teal)]/10 text-[var(--studio-ink)]"
                      : "border-[var(--studio-border)] text-[var(--studio-ink-muted)] hover:border-[var(--studio-teal)]/30"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Voice Activity Detection */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d2">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
            <Radio className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              Voice Activity Detection
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              Controls how speech start and end are detected
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-[var(--studio-ink-muted)]">
                VAD Threshold
              </Label>
              <span className="font-mono text-xs text-[var(--studio-ink)]">
                {vad?.threshold ?? 0.5}
              </span>
            </div>
            <Slider
              value={[vad?.threshold ?? 0.5]}
              min={0.1}
              max={1.0}
              step={0.05}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                dispatch({ type: "SET_VAD", payload: { threshold: val } });
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Silence Duration (ms)
              </Label>
              <Input
                type="number"
                value={vad?.silence_duration_ms ?? 480}
                onChange={(e) =>
                  dispatch({
                    type: "SET_VAD",
                    payload: { silence_duration_ms: Number(e.target.value) },
                  })
                }
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Interrupt Duration (ms)
              </Label>
              <Input
                type="number"
                value={vad?.interrupt_duration_ms ?? 160}
                onChange={(e) =>
                  dispatch({
                    type: "SET_VAD",
                    payload: { interrupt_duration_ms: Number(e.target.value) },
                  })
                }
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* General Settings */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d3">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
            <Timer className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              General
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              Timeouts and conversation history
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Idle Timeout (seconds)
            </Label>
            <Input
              type="number"
              value={state.graphData.idle_timeout ?? 120}
              onChange={(e) =>
                dispatch({
                  type: "SET_GRAPH_DATA",
                  payload: { idle_timeout: Number(e.target.value) },
                })
              }
              className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
            />
            <p className="mt-1 text-xs text-[var(--studio-ink-muted)]">
              Disconnect after all users leave the channel
            </p>
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
              Max History
            </Label>
            <Input
              type="number"
              value={state.graphData.llm?.max_history ?? 10}
              onChange={(e) =>
                dispatch({
                  type: "SET_LLM",
                  payload: { max_history: Number(e.target.value) },
                })
              }
              className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
            />
            <p className="mt-1 text-xs text-[var(--studio-ink-muted)]">
              Messages included in LLM context
            </p>
          </div>
        </div>
      </section>

      {/* Feature Toggles */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--studio-mauve)]">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              Advanced Features
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              Optional capabilities for specialized use cases
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 p-4">
            <div>
              <div className="text-sm font-medium text-[var(--studio-ink)]">
                Selective Attention Locking (SAL)
              </div>
              <div className="text-xs text-[var(--studio-ink-muted)]">
                Focus on the right voice while filtering background noise
              </div>
            </div>
            <Switch
              checked={af?.enable_sal ?? false}
              onCheckedChange={(v) =>
                dispatch({
                  type: "SET_ADVANCED_FEATURES",
                  payload: { enable_sal: v },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 p-4">
            <div>
              <div className="text-sm font-medium text-[var(--studio-ink)]">
                AI Voice Activity Detection
              </div>
              <div className="text-xs text-[var(--studio-ink-muted)]">
                Use AI-powered VAD for more accurate speech detection
              </div>
            </div>
            <Switch
              checked={af?.enable_aivad ?? false}
              onCheckedChange={(v) =>
                dispatch({
                  type: "SET_ADVANCED_FEATURES",
                  payload: { enable_aivad: v },
                })
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
