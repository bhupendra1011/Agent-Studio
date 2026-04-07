"use client";

import { Bot, Check, Key, Phone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const RAIL_STEPS = [
  { id: "credentials", number: 1, icon: Key },
  { id: "agent", number: 2, icon: Bot },
  { id: "phone", number: 3, icon: Phone },
  { id: "test", number: 4, icon: Zap },
] as const;

export function SetupProgressRail({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center px-1">
      {RAIL_STEPS.map((s, i) => {
        const isActive = currentStep === s.number;
        const isDone = currentStep > s.number;
        const Icon = s.icon;
        return (
          <div
            key={s.id}
            className={cn("flex flex-1 items-center", i === RAIL_STEPS.length - 1 && "flex-none")}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                isDone &&
                  "border-transparent bg-[var(--studio-teal)] text-[var(--studio-ink)] dark:text-[var(--studio-ink)]",
                isActive &&
                  !isDone &&
                  "border-[var(--studio-teal)] bg-[color-mix(in_oklch,var(--studio-teal)_12%,transparent)] text-[var(--studio-teal)]",
                !isDone &&
                  !isActive &&
                  "border-[var(--studio-border)] bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)]"
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            {i < RAIL_STEPS.length - 1 ? (
              <div
                className={cn(
                  "mx-2 h-0.5 min-w-[12px] flex-1 rounded-full transition-colors",
                  currentStep > s.number
                    ? "bg-[var(--studio-teal)]"
                    : "bg-[var(--studio-border)]"
                )}
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
