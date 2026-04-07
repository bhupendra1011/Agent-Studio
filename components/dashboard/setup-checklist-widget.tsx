"use client";

import { Button } from "@/components/ui/button";
import { getOnboardingStatus } from "@/lib/setup-onboarding";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Rocket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const STEPS = [
  {
    id: "credentials",
    label: "Integration credentials",
    hint: "API keys & MCP",
    href: "/dashboard/integration/credentials",
  },
  {
    id: "agent",
    label: "Publish an agent",
    hint: "Voice pipeline",
    href: "/dashboard/agents",
  },
  {
    id: "phone",
    label: "Phone numbers",
    hint: "SIP / PSTN",
    href: "/dashboard/phone-numbers",
  },
  {
    id: "campaign",
    label: "Launch a campaign",
    hint: "Outbound batch",
    href: "/dashboard/campaign/new",
  },
] as const;

export function SetupChecklistWidget() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    setOnboardingDone(Boolean(getOnboardingStatus()));
  }, []);

  if (onboardingDone === null) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm",
        onboardingDone && "border-[var(--studio-teal)]/25 bg-[var(--studio-teal)]/5"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-base font-semibold text-[var(--studio-ink)]">
            Workspace setup
          </h2>
          <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
            {onboardingDone
              ? "Onboarding finished — keep these resources within reach."
              : "Finish the essentials to start placing calls with confidence."}
          </p>
        </div>
        <Link href="/dashboard/setup">
          <Button
            type="button"
            variant={onboardingDone ? "outline" : "default"}
            size="sm"
            className="shrink-0 rounded-xl gap-1.5"
          >
            <Rocket className="h-3.5 w-3.5" />
            {onboardingDone ? "Review" : "Open wizard"}
          </Button>
        </Link>
      </div>
      <ul className="mt-4 space-y-2.5">
        {STEPS.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="flex items-start gap-3 rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-[var(--studio-border)] hover:bg-[var(--studio-surface-muted)]/50"
            >
              {onboardingDone ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--studio-teal)]" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--studio-ink-muted)]" />
              )}
              <span>
                <span className="text-sm font-medium text-[var(--studio-ink)]">
                  {step.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--studio-ink-muted)]">
                  {step.hint}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
