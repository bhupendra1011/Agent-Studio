"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Code2,
  Settings2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorTab } from "./editor-types";

const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
  { id: "prompt", label: "Prompt", icon: BookOpen },
  { id: "models", label: "Models", icon: BrainCircuit },
  { id: "advanced", label: "Advanced", icon: Settings2 },
  { id: "actions", label: "Actions", icon: Zap },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "code", label: "Code", icon: Code2 },
];

interface EditorTabStripProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
}

export function EditorTabStrip({ activeTab, onTabChange }: EditorTabStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const el = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const tRect = el.getBoundingClientRect();
    setIndicator({
      left: tRect.left - cRect.left,
      width: tRect.width,
    });
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-fit gap-1 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] p-1"
      role="tablist"
      aria-label="Agent editor sections"
    >
      {/* Sliding active pill */}
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-[var(--studio-surface)] shadow-sm transition-all duration-300 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
        aria-hidden
      />

      {TABS.map(({ id, label, icon: Icon }) => {
        const active = id === activeTab;
        return (
          <button
            key={id}
            ref={(el) => {
              if (el) tabRefs.current.set(id, el);
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(id)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              "focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none",
              active
                ? "text-[var(--studio-ink)]"
                : "text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
