"use client";

import { useTemplates } from "@/hooks/use-templates";
import type { Template } from "@/lib/types/entities";
import type { CreateAgentPipelineRequest, GraphData } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Headset, Plus } from "lucide-react";
import { useMemo } from "react";

export const SETUP_BLANK_TEMPLATE_ID = "blank";

const blankTemplate: Template = {
  id: SETUP_BLANK_TEMPLATE_ID,
  name: "Blank template",
  category: "Templates",
  description: "Start from scratch with full control.",
  icon: "blank",
  color: "",
  author: "Platform",
  userCount: 0,
  createdByLogo: "",
  createdByMainImage: "",
  type: "conversational",
  coreFeatures: [],
  defaultConfig: { model: "gpt-4o", maxTokens: 800, temperature: 0.6 },
  agents: [],
};

function templateDotClass(t: Template): string {
  if (t.id === SETUP_BLANK_TEMPLATE_ID) return "bg-[var(--studio-ink-muted)]";
  const slug = t.name.toLowerCase().replace(/\s+/g, "");
  if (slug.includes("sales")) return "bg-[var(--studio-teal)]";
  if (slug.includes("support")) return "bg-sky-500";
  if (slug.includes("appointment") || slug.includes("reminder"))
    return "bg-amber-500";
  if (slug.includes("survey") || slug.includes("nps")) return "bg-violet-500";
  return "bg-[var(--studio-mauve)]";
}

export interface AgentStepData {
  templateId: string | null;
  agentName: string;
  systemPrompt: string;
}

export const defaultAgentStepData: AgentStepData = {
  templateId: null,
  agentName: "",
  systemPrompt: "",
};

export function AgentStep({
  data,
  onChange,
}: {
  data: AgentStepData;
  onChange: (next: AgentStepData) => void;
}) {
  const { templates, loading } = useTemplates(
    { page_size: 50 },
    { enabled: true }
  );

  const displayTemplates = useMemo(
    () => [blankTemplate, ...templates],
    [templates]
  );

  const selected =
    displayTemplates.find((t) => t.id === data.templateId) ?? null;

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {loading ? (
          <p className="text-sm text-[var(--studio-ink-muted)] sm:col-span-2">
            Loading templates…
          </p>
        ) : null}
        {displayTemplates.map((t) => {
          const isSelected = data.templateId === t.id;
          const dotClass = templateDotClass(t);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                onChange({
                  ...data,
                  templateId: t.id,
                  agentName:
                    data.agentName.trim() || t.id === SETUP_BLANK_TEMPLATE_ID
                      ? data.agentName ||
                        (t.id === SETUP_BLANK_TEMPLATE_ID ? "" : t.name)
                      : t.name,
                })
              }
              className={cn(
                "flex flex-col rounded-xl border p-4 text-left text-sm transition-colors",
                isSelected
                  ? "border-[var(--studio-teal)] bg-[color-mix(in_oklch,var(--studio-teal)_8%,transparent)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-surface)] hover:border-[var(--studio-ink-muted)]"
              )}
            >
              <span
                className={cn(
                  "mb-2.5 h-2 w-2 shrink-0 rounded-full shadow-sm",
                  dotClass,
                  isSelected && "ring-2 ring-[var(--studio-teal)]/35"
                )}
              />
              <div className="flex items-start gap-3">
                {t.id === SETUP_BLANK_TEMPLATE_ID ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--studio-ink-muted)]">
                    <Plus className="h-5 w-5 text-[var(--studio-ink-muted)]" />
                  </span>
                ) : (
                  <Headset className="h-5 w-5 shrink-0 text-[var(--studio-teal)]" />
                )}
                <span>
                  <span className="line-clamp-2 font-medium text-[var(--studio-ink)]">
                    {t.name}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-[var(--studio-ink-muted)]">
                    {t.description}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 duration-200 animate-in fade-in slide-in-from-bottom-2">
          <label
            htmlFor="setup-agent-name"
            className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
          >
            Agent name
          </label>
          <input
            id="setup-agent-name"
            value={data.agentName}
            onChange={(e) => onChange({ ...data, agentName: e.target.value })}
            placeholder="e.g. Sales qualifier v1"
            className="mb-4 h-10 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 text-sm text-[var(--studio-ink)]"
          />
          <label
            htmlFor="setup-system-prompt"
            className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
          >
            System prompt
          </label>
          <textarea
            id="setup-system-prompt"
            value={data.systemPrompt}
            onChange={(e) =>
              onChange({ ...data, systemPrompt: e.target.value })
            }
            placeholder="You are a friendly assistant…"
            rows={4}
            className="w-full resize-y rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 py-2 text-sm text-[var(--studio-ink)]"
          />
          <p className="mt-2 text-xs text-[var(--studio-ink-muted)]">
            You can refine this later in the agent editor.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function agentStepValid(data: AgentStepData): boolean {
  return Boolean(
    data.templateId && data.agentName.trim().length >= 2
  );
}

export function buildCreateAgentRequest(
  data: AgentStepData,
  vid: number
): CreateAgentPipelineRequest {
  if (!data.templateId) {
    throw new Error("Template required");
  }
  if (data.templateId === SETUP_BLANK_TEMPLATE_ID) {
    const graphData: GraphData = {};
    if (data.systemPrompt.trim()) {
      graphData.llm = {
        system_messages: [
          { role: "system", content: data.systemPrompt.trim() },
        ],
      };
    }
    return {
      name: data.agentName.trim(),
      type: "chatbot",
      vid,
      ...(Object.keys(graphData).length > 0 ? { graph_data: graphData } : {}),
    };
  }
  return {
    name: data.agentName.trim(),
    type: "voice",
    vid,
    template_id: data.templateId,
  };
}
