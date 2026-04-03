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
import { useCreatePipeline } from "@/hooks/use-create-pipeline";
import { useProjects } from "@/hooks/use-projects";
import { useTemplates } from "@/hooks/use-templates";
import type { Template } from "@/lib/types/entities";
import type { CreateAgentPipelineRequest } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { maskAppId } from "@/lib/format-app-id";
import { Headset, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

const REGION_OPTIONS = [
  { value: "NA", label: "North America" },
  { value: "EU", label: "Europe" },
  { value: "AP", label: "Asia Pacific" },
];

const blankTemplate: Template = {
  id: "blank",
  name: "Blank Template",
  category: "Templates",
  description: "Minimal configuration for a custom agent.",
  icon: "blank",
  color: "",
  author: "Platform",
  userCount: 0,
  createdByLogo: "",
  createdByMainImage: "",
  type: "voice",
  coreFeatures: [],
  defaultConfig: { model: "gpt-4o", maxTokens: 800, temperature: 0.6 },
  agents: [],
};

function templateIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("customer") || n.includes("service"))
    return ShoppingCart;
  return Headset;
}

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateAgentModal({
  open,
  onOpenChange,
  onCreated,
}: CreateAgentModalProps) {
  const { templates, loading: templatesLoading } = useTemplates(
    { page_size: 50 },
    { enabled: open }
  );
  const { projects, refetch: refetchProjects } = useProjects();
  const createPipeline = useCreatePipeline();

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    blankTemplate
  );
  const [pipelineName, setPipelineName] = useState("My Agent");
  const [selectedProject, setSelectedProject] = useState("");
  const [hostingRegion, setHostingRegion] = useState("NA");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      refetchProjects();
    }
  }, [open, refetchProjects]);

  useEffect(() => {
    if (open && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id.toString());
    }
  }, [open, projects, selectedProject]);

  useEffect(() => {
    if (!open) {
      setSelectedTemplate(blankTemplate);
      setPipelineName("My Agent");
      setSelectedProject("");
      setHostingRegion("NA");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!selectedTemplate || !selectedProject) return;
    const vid = projects.find((p) => p.id.toString() === selectedProject)?.id;
    if (vid === undefined) return;

    const body: CreateAgentPipelineRequest = {
      name:
        pipelineName.trim() ||
        (selectedTemplate.id === "blank"
          ? "My Agent"
          : selectedTemplate.name),
      type: selectedTemplate.id === "blank" ? "chatbot" : "voice",
      vid,
      ...(selectedTemplate.id !== "blank" && {
        template_id: selectedTemplate.id,
      }),
    };

    setSubmitting(true);
    try {
      await createPipeline.mutateAsync(body);
      onOpenChange(false);
      onCreated?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-syne)] text-lg">
            Create Agent
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {projects.length === 0 ? (
            <p className="text-sm text-[var(--studio-ink-muted)]">
              No projects available. In mock mode, reload after MSW starts or
              check console API v2 base URL.
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <select
                id="project"
                className="flex h-10 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 text-sm disabled:opacity-50"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={projects.length === 0}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.name} ({maskAppId(p.key)})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Hosting region *</Label>
              <select
                id="region"
                className="flex h-10 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 text-sm"
                value={hostingRegion}
                onChange={(e) => setHostingRegion(e.target.value)}
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent name</Label>
            <Input
              id="agent-name"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              className="rounded-xl border-[var(--studio-border)]"
            />
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <button
              type="button"
              onClick={() => setSelectedTemplate(blankTemplate)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                selectedTemplate?.id === "blank"
                  ? "border-[var(--studio-teal)] bg-[var(--studio-surface-muted)]"
                  : "border-[var(--studio-border)] hover:border-[var(--studio-ink-muted)]"
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[var(--studio-ink-muted)]">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Blank Template</span>
            </button>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {templatesLoading ? (
                <p className="text-sm text-[var(--studio-ink-muted)]">
                  Loading templates…
                </p>
              ) : (
                templates.map((t) => {
                  const Icon = templateIcon(t.name);
                  const selected = selectedTemplate?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                        selected
                          ? "border-[var(--studio-teal)] bg-[var(--studio-surface-muted)]"
                          : "border-[var(--studio-border)] hover:border-[var(--studio-ink-muted)]"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-[var(--studio-teal)]" />
                      <span className="line-clamp-2 font-medium">{t.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
            disabled={
              submitting ||
              projects.length === 0 ||
              !selectedProject ||
              !selectedTemplate ||
              !hostingRegion
            }
            onClick={handleCreate}
          >
            {submitting ? "Creating…" : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
