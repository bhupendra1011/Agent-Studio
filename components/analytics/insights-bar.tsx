"use client";

import type { AnalyticsInsight } from "@/lib/utils/analytics-insights";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";

function InsightIcon({ severity }: { severity: AnalyticsInsight["severity"] }) {
  if (severity === "warning") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4" />
      </span>
    );
  }
  if (severity === "success") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--studio-teal)]/15 text-[var(--studio-teal)]">
      <Info className="h-4 w-4" />
    </span>
  );
}

interface InsightsBarProps {
  insights: AnalyticsInsight[];
  className?: string;
}

export function InsightsBar({ insights, className }: InsightsBarProps) {
  if (!insights.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--studio-border)] bg-card p-4 shadow-sm",
        className
      )}
    >
      <h2 className="font-heading mb-3 text-sm font-semibold text-[var(--studio-ink)]">
        Insights
      </h2>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-3">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="flex min-w-[min(100%,280px)] snap-start gap-3 rounded-xl border border-[var(--studio-border)]/80 bg-[var(--studio-surface-muted)]/30 p-3 sm:min-w-0"
          >
            <InsightIcon severity={insight.severity} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--studio-ink)]">
                {insight.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--studio-ink-muted)]">
                {insight.message}
              </p>
              {insight.actionHref && insight.actionLabel ? (
                <Link
                  href={insight.actionHref}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--studio-teal)] hover:underline"
                >
                  {insight.actionLabel}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
