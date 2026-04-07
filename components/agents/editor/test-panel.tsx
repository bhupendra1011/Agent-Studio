"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AgentPipeline, GraphData } from "@/lib/types/api";
import { AgentTestPanelContent } from "./test-panel-content";

interface TestPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: AgentPipeline;
  graphData: GraphData;
}

/** Mobile / narrow: bottom sheet test UX. Desktop uses inline panel in `AgentEditorShell`. */
export function TestPanel({ open, onOpenChange, pipeline, graphData }: TestPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90dvh] max-w-lg rounded-t-2xl border-[var(--studio-border)] bg-[var(--studio-surface)] p-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="border-b border-[var(--studio-border)] px-5 py-4 text-left">
          <SheetTitle className="font-[family-name:var(--studio-font-display)] text-lg tracking-tight">
            Test your agent
          </SheetTitle>
          <SheetDescription className="text-[var(--studio-ink-muted)]">
            Run a simulated call from your device to validate the flow.
          </SheetDescription>
        </SheetHeader>
        <div className="flex max-h-[min(70dvh,32rem)] min-h-[12rem] flex-col overscroll-contain overflow-y-auto">
          <AgentTestPanelContent pipeline={pipeline} graphData={graphData} variant="sheet" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
