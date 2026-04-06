"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { Dispatch } from "react";
import { useCallback } from "react";
import type { EditorAction, EditorState } from "./editor-types";

interface PromptTabProps {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

export function PromptTab({ state, dispatch }: PromptTabProps) {
  const llm = state.graphData.llm;
  const paramsConfig = state.graphDataParamsConfig?.llm?.system_messages;
  const activeMode = paramsConfig?.active_mode ?? "simple";
  const sections = paramsConfig?.structured_sections ?? [];

  const systemText =
    activeMode === "simple"
      ? paramsConfig?.simple_text ??
        llm?.system_messages?.[0]?.content ??
        ""
      : "";

  const updateParamsConfig = useCallback(
    (patch: Partial<NonNullable<typeof paramsConfig>>) => {
      dispatch({
        type: "SET_PARAMS_CONFIG",
        payload: {
          ...state.graphDataParamsConfig,
          llm: {
            ...state.graphDataParamsConfig?.llm,
            system_messages: {
              active_mode: activeMode,
              simple_text: paramsConfig?.simple_text,
              structured_sections: paramsConfig?.structured_sections,
              ...paramsConfig,
              ...patch,
            },
          },
        },
      });
    },
    [dispatch, state.graphDataParamsConfig, activeMode, paramsConfig]
  );

  const handleSimpleTextChange = useCallback(
    (text: string) => {
      updateParamsConfig({ simple_text: text, active_mode: "simple" });
      dispatch({
        type: "SET_LLM",
        payload: {
          system_messages: [{ role: "system", content: text }],
        },
      });
    },
    [dispatch, updateParamsConfig]
  );

  const handleAddSection = useCallback(() => {
    const newSection = {
      id: `s${Date.now()}`,
      title: "",
      content: "",
      order: sections.length,
    };
    updateParamsConfig({
      active_mode: "structured",
      structured_sections: [...sections, newSection],
    });
  }, [sections, updateParamsConfig]);

  const handleRemoveSection = useCallback(
    (id: string) => {
      updateParamsConfig({
        structured_sections: sections.filter((s) => s.id !== id),
      });
    },
    [sections, updateParamsConfig]
  );

  const handleSectionChange = useCallback(
    (id: string, field: "title" | "content", value: string) => {
      updateParamsConfig({
        structured_sections: sections.map((s) =>
          s.id === id ? { ...s, [field]: value } : s
        ),
      });
    },
    [sections, updateParamsConfig]
  );

  return (
    <div className="space-y-6 studio-reveal">
      {/* System Prompt */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d1">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              System Prompt
            </h3>
            <p className="mt-0.5 text-sm text-[var(--studio-ink-muted)]">
              Define how your agent behaves and what persona it takes on.
            </p>
          </div>
          <div className="flex gap-1 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] p-0.5">
            <button
              type="button"
              onClick={() => updateParamsConfig({ active_mode: "simple" })}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                activeMode === "simple"
                  ? "bg-[var(--studio-surface)] text-[var(--studio-ink)] shadow-sm"
                  : "text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
              )}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => updateParamsConfig({ active_mode: "structured" })}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                activeMode === "structured"
                  ? "bg-[var(--studio-surface)] text-[var(--studio-ink)] shadow-sm"
                  : "text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
              )}
            >
              Structured
            </button>
          </div>
        </div>

        {activeMode === "simple" ? (
          <Textarea
            value={systemText}
            onChange={(e) => handleSimpleTextChange(e.target.value)}
            placeholder="You are a helpful customer support assistant. Be friendly, concise, and professional…"
            className="min-h-[180px] resize-y rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 font-mono text-sm text-[var(--studio-ink)] placeholder:text-[var(--studio-ink-muted)]/50 focus-visible:ring-[var(--studio-teal)]/30"
          />
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className="group flex gap-2 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 p-3"
              >
                <div className="flex shrink-0 items-start pt-2 text-[var(--studio-ink-muted)]/40">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      handleSectionChange(section.id, "title", e.target.value)
                    }
                    placeholder="Section title (e.g., Role, Goals, Boundaries)"
                    className="h-8 rounded-lg border-transparent bg-transparent text-sm font-medium text-[var(--studio-ink)] placeholder:text-[var(--studio-ink-muted)]/40 focus-visible:border-[var(--studio-border)] focus-visible:ring-[var(--studio-teal)]/20"
                  />
                  <Textarea
                    value={section.content}
                    onChange={(e) =>
                      handleSectionChange(
                        section.id,
                        "content",
                        e.target.value
                      )
                    }
                    placeholder="Section content…"
                    className="min-h-[60px] resize-y rounded-lg border-transparent bg-transparent text-sm text-[var(--studio-ink)] placeholder:text-[var(--studio-ink-muted)]/40 focus-visible:border-[var(--studio-border)] focus-visible:ring-[var(--studio-teal)]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSection(section.id)}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--studio-ink-muted)] opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSection}
              className="rounded-xl border-dashed border-[var(--studio-border)] text-[var(--studio-ink-muted)] hover:border-[var(--studio-teal)] hover:text-[var(--studio-teal)]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add section
            </Button>
          </div>
        )}
      </section>

      {/* Greeting Message */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d2">
        <Label className="mb-2 block">
          <span className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
            Greeting Message
          </span>
          <span className="mt-0.5 block text-sm text-[var(--studio-ink-muted)]">
            The first thing your agent says when a session starts.
          </span>
        </Label>
        <Input
          value={llm?.greeting_message ?? ""}
          onChange={(e) =>
            dispatch({
              type: "SET_LLM",
              payload: { greeting_message: e.target.value },
            })
          }
          placeholder="Hello! How can I help you today?"
          className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-[var(--studio-ink)] placeholder:text-[var(--studio-ink-muted)]/50 focus-visible:ring-[var(--studio-teal)]/30"
        />
      </section>

      {/* Failure Message */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d3">
        <Label className="mb-2 block">
          <span className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
            Failure Message
          </span>
          <span className="mt-0.5 block text-sm text-[var(--studio-ink-muted)]">
            Spoken when the LLM fails to respond or returns an error.
          </span>
        </Label>
        <Input
          value={llm?.failure_message ?? ""}
          onChange={(e) =>
            dispatch({
              type: "SET_LLM",
              payload: { failure_message: e.target.value },
            })
          }
          placeholder="Please hold on a second."
          className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-[var(--studio-ink)] placeholder:text-[var(--studio-ink-muted)]/50 focus-visible:ring-[var(--studio-teal)]/30"
        />
      </section>
    </div>
  );
}
