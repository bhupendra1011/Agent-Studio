"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { GraphDataMcpServer } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import {
  BookText,
  ChevronDown,
  Database,
  Plus,
  Server,
  Trash2,
  Wrench,
} from "lucide-react";
import type { Dispatch } from "react";
import { useCallback, useState } from "react";
import type { EditorAction, EditorState } from "./editor-types";

interface ActionsTabProps {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
}

export function ActionsTab({ state, dispatch }: ActionsTabProps) {
  const kbId = state.graphData.llm?.rag_config?.search_config?.kb_id;
  const mcpServers = state.graphData.llm?.mcp_servers ?? [];
  const [addingKb, setAddingKb] = useState(false);
  const [kbInput, setKbInput] = useState(kbId ?? "");
  const [addingMcp, setAddingMcp] = useState(false);
  const [newMcp, setNewMcp] = useState<Partial<GraphDataMcpServer>>({
    name: "",
    endpoint: "",
    transport: "streamable_http",
    timeout_ms: 10000,
  });
  const [expandedMcp, setExpandedMcp] = useState<string | null>(null);
  const [toolInput, setToolInput] = useState("");

  const handleSetKb = useCallback(() => {
    dispatch({
      type: "SET_LLM",
      payload: {
        rag_config: kbInput.trim()
          ? { search_config: { kb_id: kbInput.trim() } }
          : undefined,
      },
    });
    setAddingKb(false);
  }, [dispatch, kbInput]);

  const handleRemoveKb = useCallback(() => {
    dispatch({
      type: "SET_LLM",
      payload: { rag_config: undefined },
    });
    setKbInput("");
  }, [dispatch]);

  const handleAddMcp = useCallback(() => {
    if (!newMcp.name?.trim() || !newMcp.endpoint?.trim()) return;
    const server: GraphDataMcpServer = {
      name: newMcp.name.trim(),
      _uuid: `mcp_${Date.now()}`,
      endpoint: newMcp.endpoint.trim(),
      transport: newMcp.transport ?? "streamable_http",
      timeout_ms: newMcp.timeout_ms ?? 10000,
      allowed_tools: [],
    };
    dispatch({
      type: "SET_LLM",
      payload: { mcp_servers: [...mcpServers, server] },
    });
    setNewMcp({ name: "", endpoint: "", transport: "streamable_http", timeout_ms: 10000 });
    setAddingMcp(false);
  }, [dispatch, mcpServers, newMcp]);

  const handleRemoveMcp = useCallback(
    (uuid: string) => {
      dispatch({
        type: "SET_LLM",
        payload: { mcp_servers: mcpServers.filter((s) => s._uuid !== uuid) },
      });
    },
    [dispatch, mcpServers]
  );

  const handleAddTool = useCallback(
    (uuid: string) => {
      if (!toolInput.trim()) return;
      dispatch({
        type: "SET_LLM",
        payload: {
          mcp_servers: mcpServers.map((s) =>
            s._uuid === uuid
              ? { ...s, allowed_tools: [...(s.allowed_tools ?? []), toolInput.trim()] }
              : s
          ),
        },
      });
      setToolInput("");
    },
    [dispatch, mcpServers, toolInput]
  );

  const handleRemoveTool = useCallback(
    (uuid: string, tool: string) => {
      dispatch({
        type: "SET_LLM",
        payload: {
          mcp_servers: mcpServers.map((s) =>
            s._uuid === uuid
              ? { ...s, allowed_tools: (s.allowed_tools ?? []).filter((t) => t !== tool) }
              : s
          ),
        },
      });
    },
    [dispatch, mcpServers]
  );

  return (
    <div className="space-y-6">
      {/* Knowledge Base */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d1">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
            <BookText className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              Knowledge Base
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              Give your agent access to reference documents for RAG
            </p>
          </div>
        </div>

        {kbId ? (
          <div className="flex items-center justify-between rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 p-4">
            <div className="flex items-center gap-3">
              <Database className="h-4.5 w-4.5 text-[var(--studio-teal)]" />
              <div>
                <div className="text-sm font-medium text-[var(--studio-ink)]">
                  Connected
                </div>
                <div className="font-mono text-xs text-[var(--studio-ink-muted)]">
                  {kbId}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveKb}
              className="rounded-lg p-1.5 text-[var(--studio-ink-muted)] transition-colors hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : addingKb ? (
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Knowledge Base UUID
              </Label>
              <Input
                value={kbInput}
                onChange={(e) => setKbInput(e.target.value)}
                placeholder="Paste knowledge base UUID"
                className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 font-mono text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSetKb}
                disabled={!kbInput.trim()}
                className="rounded-lg bg-[var(--studio-teal)] text-white hover:opacity-90"
              >
                Connect
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddingKb(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setAddingKb(true)}
            className="rounded-xl border-dashed border-[var(--studio-border)] text-[var(--studio-ink-muted)] hover:border-[var(--studio-teal)] hover:text-[var(--studio-teal)]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Knowledge Base
          </Button>
        )}
      </section>

      {/* MCP Servers */}
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 studio-reveal studio-reveal-d2">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600">
            <Server className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              MCP Servers
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              Connect external tools and services via MCP protocol
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {mcpServers.map((server) => {
            const isExpanded = expandedMcp === server._uuid;
            return (
              <div
                key={server._uuid}
                className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30"
              >
                <div className="flex items-center justify-between p-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMcp(isExpanded ? null : server._uuid)
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <Wrench className="h-4 w-4 shrink-0 text-[var(--studio-teal)]" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--studio-ink)]">
                        {server.name}
                      </div>
                      <div className="truncate font-mono text-xs text-[var(--studio-ink-muted)]">
                        {server.endpoint}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-[var(--studio-ink-muted)] transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMcp(server._uuid)}
                    className="ml-2 shrink-0 rounded-lg p-1.5 text-[var(--studio-ink-muted)] transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--studio-border)] p-4 studio-reveal">
                    <Label className="mb-2 text-xs font-medium text-[var(--studio-ink-muted)]">
                      Allowed Tools
                    </Label>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {(server.allowed_tools ?? []).map((tool) => (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--studio-teal)]/10 px-2 py-1 font-mono text-xs text-[var(--studio-ink)]"
                        >
                          {tool}
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(server._uuid, tool)}
                            className="text-[var(--studio-ink-muted)] hover:text-red-500"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      {!(server.allowed_tools?.length) && (
                        <span className="text-xs text-[var(--studio-ink-muted)]">
                          No tools selected — all tools will be available
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        placeholder="Tool name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTool(server._uuid);
                        }}
                        className="h-8 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface)]/80 font-mono text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddTool(server._uuid)}
                        disabled={!toolInput.trim()}
                        className="h-8 rounded-lg bg-[var(--studio-teal)] text-xs text-white hover:opacity-90"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {addingMcp ? (
            <div className="rounded-xl border border-[var(--studio-teal)]/30 bg-[var(--studio-teal)]/5 p-4 studio-reveal">
              <div className="space-y-3">
                <div>
                  <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                    Server Name
                  </Label>
                  <Input
                    value={newMcp.name ?? ""}
                    onChange={(e) =>
                      setNewMcp((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="my-mcp-server"
                    className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface)] text-sm"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                    Endpoint URL
                  </Label>
                  <Input
                    value={newMcp.endpoint ?? ""}
                    onChange={(e) =>
                      setNewMcp((p) => ({ ...p, endpoint: e.target.value }))
                    }
                    placeholder="https://mcp.example.com/mcp"
                    className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface)] font-mono text-xs"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                      Transport
                    </Label>
                    <div className="flex gap-1.5">
                      {["streamable_http", "sse", "http"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewMcp((p) => ({ ...p, transport: t }))}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                            newMcp.transport === t
                              ? "border-[var(--studio-teal)] bg-[var(--studio-teal)]/10 text-[var(--studio-ink)]"
                              : "border-[var(--studio-border)] text-[var(--studio-ink-muted)]"
                          )}
                        >
                          {t === "streamable_http" ? "Streamable HTTP" : t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                      Timeout (ms)
                    </Label>
                    <Input
                      type="number"
                      value={newMcp.timeout_ms ?? 10000}
                      onChange={(e) =>
                        setNewMcp((p) => ({
                          ...p,
                          timeout_ms: Number(e.target.value),
                        }))
                      }
                      className="h-9 rounded-lg border-[var(--studio-border)] bg-[var(--studio-surface)] text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddMcp}
                    disabled={!newMcp.name?.trim() || !newMcp.endpoint?.trim()}
                    className="rounded-lg bg-[var(--studio-teal)] text-white hover:opacity-90"
                  >
                    Add Server
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingMcp(false)}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddingMcp(true)}
              className="rounded-xl border-dashed border-[var(--studio-border)] text-[var(--studio-ink-muted)] hover:border-[var(--studio-teal)] hover:text-[var(--studio-teal)]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add MCP Server
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
