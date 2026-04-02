import { Activity } from "lucide-react";

const stages = ["ASR", "LLM", "TTS"] as const;

export function MarketingHeroPipeline() {
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--studio-border)] bg-gradient-to-br from-[var(--studio-teal-dim)] via-[var(--studio-surface-muted)] to-[var(--studio-mauve-dim)] p-6 shadow-xl dark:from-[var(--studio-teal-dim)] dark:via-[var(--studio-surface-muted)] dark:to-[var(--studio-mauve-dim)]">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--studio-teal), transparent 55%)",
        }}
        aria-hidden
      />
      <div className="relative">
        <div className="mb-6 flex items-center gap-2">
          <span className="studio-pulse-glow inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--studio-teal)]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-ink)]">
            Live pipeline
          </span>
        </div>
        <div className="relative mb-8 min-h-[5.5rem] px-2 pt-2">
          <div className="absolute left-[14%] right-[14%] top-[calc(50%-2px)] h-1 rounded-full bg-[var(--studio-border)]" />
          <div className="relative flex justify-between pt-1">
            {stages.map((label) => (
              <div
                key={label}
                className="relative z-[1] flex flex-col items-center gap-2"
              >
                <div className="studio-float-soft flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)]/90 text-xs font-bold text-[var(--studio-teal)] shadow-sm backdrop-blur-sm dark:bg-[var(--studio-surface)]/80">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <span
            className="studio-packet-move pointer-events-none absolute top-[calc(50%-6px)] z-[2] h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--studio-mauve)] shadow-md ring-2 ring-[var(--studio-surface)]"
            aria-hidden
          />
        </div>
        <div className="flex h-10 items-end justify-center gap-1.5 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)]/70 px-3 py-2 backdrop-blur-sm dark:bg-[var(--studio-surface)]/50">
          {[28, 44, 36, 52, 40, 48, 32].map((h, i) => {
            const delayClass =
              ["studio-bar-dance-d1", "studio-bar-dance-d2", "studio-bar-dance-d3", "studio-bar-dance-d4", "studio-bar-dance-d5"][i % 5];
            return (
              <div
                key={`${h}-${i}`}
                className={`studio-bar-dance ${delayClass} w-1.5 rounded-full bg-[var(--studio-teal)]/70`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-[var(--studio-ink-muted)]">
          <Activity
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--studio-mauve)]"
            aria-hidden
          />
          Voice streams through recognition, reasoning, and synthesis — with
          managed turn-taking on Agora&apos;s real-time layer.
        </p>
      </div>
    </div>
  );
}
