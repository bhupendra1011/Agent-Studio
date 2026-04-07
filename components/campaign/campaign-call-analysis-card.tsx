"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CustomEvaluation, SystemEvaluation } from "@/lib/types/api";
import { ChevronDown, PieChart, Target, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export const DEFAULT_POST_CALL_DATA_POINT: CustomEvaluation = {
  variable_name: "call_outcome",
  type: "boolean",
  criteria: "Whether the business objective of the call was met.",
};

const EVAL_TYPES = ["boolean", "string", "number", "array"] as const;

function humanizeVariableName(variableName: string): string {
  return variableName
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function typeLabel(t: string): string {
  const lower = t.toLowerCase();
  if (lower === "boolean") return "Boolean";
  if (lower === "string") return "String";
  if (lower === "number") return "Number";
  if (lower === "array") return "Array";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function defaultCriteriaForVariable(variableName: string, type: string): string {
  if (type.toLowerCase() === "boolean") {
    return `Whether ${humanizeVariableName(variableName).toLowerCase()} applies for this call.`;
  }
  return `Extract ${humanizeVariableName(variableName)} from the call transcript.`;
}

function slugifyVariableName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

interface CampaignCallAnalysisCardProps {
  extractionEnabled: boolean;
  onExtractionChange: (enabled: boolean) => void;
  dataPoints: CustomEvaluation[];
  onDataPointsChange: React.Dispatch<React.SetStateAction<CustomEvaluation[]>>;
  successCriteria: string;
  onSuccessCriteriaChange: (value: string) => void;
  systemEvaluations: SystemEvaluation[];
}

export function CampaignCallAnalysisCard({
  extractionEnabled,
  onExtractionChange,
  dataPoints,
  onDataPointsChange,
  successCriteria,
  onSuccessCriteriaChange,
  systemEvaluations,
}: CampaignCallAnalysisCardProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<string>("boolean");
  const [customCriteria, setCustomCriteria] = useState("");

  const usedNames = useMemo(
    () => new Set(dataPoints.map((d) => d.variable_name)),
    [dataPoints]
  );

  const availableSystem = useMemo(
    () => systemEvaluations.filter((s) => !usedNames.has(s.variable_name)),
    [systemEvaluations, usedNames]
  );

  useEffect(() => {
    if (!extractionEnabled || dataPoints.length > 0) return;
    onDataPointsChange([DEFAULT_POST_CALL_DATA_POINT]);
  }, [extractionEnabled, dataPoints.length, onDataPointsChange]);

  const addSystem = useCallback(
    (s: SystemEvaluation) => {
      onDataPointsChange((prev) => [
        ...prev,
        {
          variable_name: s.variable_name,
          type: s.type,
          criteria: defaultCriteriaForVariable(s.variable_name, s.type),
        },
      ]);
    },
    [onDataPointsChange]
  );

  const removeAt = useCallback(
    (index: number) => {
      onDataPointsChange((prev) => prev.filter((_, i) => i !== index));
    },
    [onDataPointsChange]
  );

  const openCustomDialog = useCallback(() => {
    setCustomName("");
    setCustomType("boolean");
    setCustomCriteria("");
    setCustomOpen(true);
  }, []);

  const submitCustom = useCallback(() => {
    const variable_name = slugifyVariableName(customName);
    if (!variable_name || usedNames.has(variable_name)) {
      return;
    }
    onDataPointsChange((prev) => [
      ...prev,
      {
        variable_name,
        type: customType,
        criteria:
          customCriteria.trim() ||
          defaultCriteriaForVariable(variable_name, customType),
      },
    ]);
    setCustomOpen(false);
  }, [
    customName,
    customType,
    customCriteria,
    usedNames,
    onDataPointsChange,
  ]);

  const onToggleExtraction = useCallback(
    (enabled: boolean) => {
      onExtractionChange(enabled);
    },
    [onExtractionChange]
  );

  const outputCount = dataPoints.length;
  const outputLabel = outputCount === 1 ? "1 output" : `${outputCount} outputs`;

  return (
    <>
      <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--studio-surface-muted)]">
            <PieChart className="h-5 w-5 text-[var(--studio-ink-muted)]" />
          </div>
          <CardTitle className="text-base font-semibold">Call Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-[var(--studio-ink)]">
                  Post Call Data Extraction
                </p>
                <p className="mt-1 text-xs text-[var(--studio-ink-muted)]">
                  Automatically extract structured outputs from calls according to business
                  needs.
                </p>
              </div>
              <Switch checked={extractionEnabled} onCheckedChange={onToggleExtraction} />
            </div>
          </div>

          {extractionEnabled && (
            <div className="space-y-3 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--studio-ink)]">Data Points</p>
                <span className="text-xs text-[var(--studio-ink-muted)]">{outputLabel}</span>
              </div>
              <ul className="space-y-2">
                {dataPoints.map((dp, index) => (
                  <li
                    key={`${dp.variable_name}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface)] px-3 py-2.5"
                  >
                    <Target className="h-4 w-4 shrink-0 text-[var(--studio-ink-muted)]" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--studio-ink)]">
                      {humanizeVariableName(dp.variable_name)}
                    </span>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {typeLabel(dp.type)}
                    </Badge>
                    <button
                      type="button"
                      className="shrink-0 rounded-md p-1 text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)] hover:text-[var(--studio-ink)]"
                      aria-label={`Remove ${dp.variable_name}`}
                      onClick={() => removeAt(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--studio-border)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)]/50 focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none"
                  type="button"
                >
                  + Add
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl">
                  {availableSystem.map((s) => (
                    <DropdownMenuItem
                      key={s.variable_name}
                      onClick={() => addSystem(s)}
                      className="rounded-lg"
                    >
                      {humanizeVariableName(s.variable_name)}{" "}
                      <span className="text-muted-foreground">({typeLabel(s.type)})</span>
                    </DropdownMenuItem>
                  ))}
                  {availableSystem.length > 0 && (
                    <div className="my-1 h-px bg-border" aria-hidden />
                  )}
                  <DropdownMenuItem onClick={openCustomDialog} className="rounded-lg">
                    Custom data point…
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="space-y-2 pt-1">
                <Label className="text-xs text-[var(--studio-ink-muted)]">
                  Overall call success criteria
                </Label>
                <Textarea
                  value={successCriteria}
                  onChange={(e) => onSuccessCriteriaChange(e.target.value)}
                  className="min-h-[72px] rounded-xl text-sm"
                  placeholder="How the LLM should judge whether the call met your goal."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Custom data point</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="custom-dp-name">Field name</Label>
              <Input
                id="custom-dp-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. appointment_confirmed"
                className="rounded-xl font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Saved as{" "}
                <code className="font-mono">
                  {slugifyVariableName(customName) || "snake_case"}
                </code>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={customType} onValueChange={(v) => setCustomType(v ?? "boolean")}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-dp-criteria">Extraction criteria (optional)</Label>
              <Textarea
                id="custom-dp-criteria"
                value={customCriteria}
                onChange={(e) => setCustomCriteria(e.target.value)}
                className="min-h-[80px] rounded-xl"
                placeholder="Instructions for what to extract or how to score this field."
              />
            </div>
          </div>
          <DialogFooter className="border-0 bg-transparent p-0 pt-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
              disabled={!slugifyVariableName(customName) || usedNames.has(slugifyVariableName(customName))}
              onClick={submitCustom}
            >
              Add data point
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
