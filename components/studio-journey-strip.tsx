import {
  BarChart3,
  Bot,
  Cable,
  Megaphone,
  PhoneIncoming,
} from "lucide-react";

const steps = [
  {
    Icon: Bot,
    title: "Build",
    subtitle: "Agents",
    tags: ["Templates", "BYOK", "Playground"],
  },
  {
    Icon: Cable,
    title: "Connect",
    subtitle: "Telephony",
    tags: ["SIP trunk", "Numbers", "Routing"],
  },
  {
    Icon: PhoneIncoming,
    title: "Run",
    subtitle: "Calls",
    tags: ["Inbound", "Outbound", "Campaigns"],
    extraIcon: Megaphone,
  },
  {
    Icon: BarChart3,
    title: "Analyze",
    subtitle: "Observe",
    tags: ["History", "Transcripts", "Metrics"],
  },
] as const;

function StepSparkle() {
  return (
    <div
      className="mt-3 flex h-6 items-end justify-center gap-0.5"
      aria-hidden
    >
      {[4, 7, 5, 9, 6, 8, 5].map((h, i) => (
        <span
          key={i}
          className={`studio-bar-dance w-1 rounded-sm bg-[var(--studio-teal)]/50 ${
            ["studio-bar-dance-d1", "studio-bar-dance-d2", "studio-bar-dance-d3", "studio-bar-dance-d4", "studio-bar-dance-d5"][i % 5]
          }`}
          style={{ height: `${h * 2}px` }}
        />
      ))}
    </div>
  );
}

export function StudioJourneyStrip() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 className="font-heading text-center text-2xl font-bold tracking-tight text-[var(--studio-ink)] sm:text-3xl">
        Login → live calls
      </h2>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:gap-6">
        {steps.map((step) => (
          <div
            key={step.title}
            className="group flex flex-col items-center rounded-2xl border border-[var(--studio-border)] border-dashed bg-[var(--studio-surface)]/40 px-3 py-6 text-center transition hover:border-[var(--studio-teal)]/35 hover:bg-[var(--studio-surface)]/70 dark:bg-[var(--studio-surface)]/20"
          >
            <div className="studio-float-soft relative mb-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] shadow-sm">
              <step.Icon
                className="h-8 w-8 text-[var(--studio-teal)]"
                strokeWidth={1.5}
                aria-hidden
              />
              {"extraIcon" in step && step.extraIcon ? (
                <step.extraIcon
                  className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-md border border-[var(--studio-border)] bg-[var(--studio-mauve-dim)] p-0.5 text-[var(--studio-mauve)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
              ) : null}
            </div>
            <h3 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
              {step.title}
            </h3>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--studio-mauve)]">
              {step.subtitle}
            </p>
            <StepSparkle />
            <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
              {step.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--studio-ink-muted)]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
