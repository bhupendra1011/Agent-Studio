"use client";

import { getAgentPipeline, updateAgentPipeline } from "@/lib/services/agent-pipeline";
import type { AgentPipeline } from "@/lib/types/api";
import { useCallback, useEffect, useReducer, useState } from "react";
import { ActionsTab } from "./actions-tab";
import { AdvancedTab } from "./advanced-tab";
import { CodeTab } from "./code-tab";
import { DeployDialog } from "./deploy-dialog";
import { EditorHeader } from "./editor-header";
import { EditorTabStrip } from "./editor-tab-strip";
import type { EditorTab } from "./editor-types";
import { editorReducer, initialEditorState } from "./editor-types";
import { ModelsTab } from "./models-tab";
import { PromptTab } from "./prompt-tab";
import { TestPanel } from "./test-panel";

interface AgentEditorShellProps {
  pipelineId: string;
}

export function AgentEditorShell({ pipelineId }: AgentEditorShellProps) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const [activeTab, setActiveTab] = useState<EditorTab>("prompt");
  const [pipeline, setPipeline] = useState<AgentPipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAgentPipeline(pipelineId)
      .then((data) => {
        if (cancelled) return;
        setPipeline(data);
        dispatch({
          type: "INIT",
          payload: {
            name: data.name,
            description: data.description,
            graphData: data.graph_data ?? {},
          },
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load agent");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pipelineId]);

  const handleSave = useCallback(async () => {
    if (!pipeline) return;
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      await updateAgentPipeline(Number(pipeline.id), {
        name: state.name,
        description: state.description,
        graph_data: state.graphData,
      });
      dispatch({ type: "MARK_CLEAN" });
    } catch {
      // TODO: toast error
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [pipeline, state.name, state.description, state.graphData]);

  const agentStatus: "draft" | "live" | "paused" = pipeline
    ? pipeline.deploy_status === 1
      ? "live"
      : pipeline.deploy_status === 2
        ? "paused"
        : "draft"
    : "draft";

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--studio-teal)] border-t-transparent" />
          <p className="text-sm text-[var(--studio-ink-muted)]">Loading agent configuration…</p>
        </div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] px-8 py-6 text-center">
          <p className="text-sm text-red-500">{error ?? "Agent not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6 sm:-m-8 flex min-h-[calc(100vh-3.5rem)] flex-col">
      <EditorHeader
        name={state.name}
        status={agentStatus}
        dirty={state.dirty}
        saving={state.saving}
        onNameChange={(n) => dispatch({ type: "SET_NAME", payload: n })}
        onSave={() => void handleSave()}
        onTestOpen={() => setTestOpen(true)}
        onDeployOpen={() => setDeployOpen(true)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 py-6">
          <EditorTabStrip activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-6">
            {activeTab === "prompt" && (
              <PromptTab state={state} dispatch={dispatch} />
            )}
            {activeTab === "models" && (
              <ModelsTab state={state} dispatch={dispatch} />
            )}
            {activeTab === "advanced" && (
              <AdvancedTab state={state} dispatch={dispatch} />
            )}
            {activeTab === "actions" && (
              <ActionsTab state={state} dispatch={dispatch} />
            )}
            {activeTab === "code" && (
              <CodeTab pipeline={pipeline} />
            )}
          </div>
        </div>
      </div>

      <TestPanel
        open={testOpen}
        onOpenChange={setTestOpen}
        pipeline={pipeline}
        graphData={state.graphData}
      />

      <DeployDialog
        open={deployOpen}
        onOpenChange={setDeployOpen}
        pipeline={pipeline}
        onDeployed={() => {
          setPipeline((p) => p ? { ...p, deploy_status: 1, last_deployed_time: new Date().toISOString() } : p);
        }}
      />
    </div>
  );
}
