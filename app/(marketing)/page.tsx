import Link from "next/link";
import {
  AudioWaveform,
  Check,
  Globe2,
  Layers,
  Phone,
  Rocket,
  Sparkles,
} from "lucide-react";

import { MarketingHeroPipeline } from "@/components/marketing-hero-pipeline";
import { StudioJourneyStrip } from "@/components/studio-journey-strip";

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {/* Hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
        <div className="relative flex-1">
          <span className="studio-reveal studio-reveal-d1 inline-flex items-center gap-2 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--studio-ink-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--studio-teal)]" aria-hidden />
            Agent Studio · Conversational AI
          </span>
          <h1 className="studio-reveal studio-reveal-d2 font-heading mt-6 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--studio-ink)] sm:text-5xl lg:text-[3.25rem]">
            Build voice agents. Ship to real phone lines. Learn from every call.
          </h1>
          <p className="studio-reveal studio-reveal-d3 mt-5 max-w-lg text-lg leading-relaxed text-[var(--studio-ink-muted)]">
            A visual control plane for voice AI — design prompts and audio
            behavior, connect SIP and numbers, run inbound support and outbound
            campaigns, then improve with transcripts and analytics.
          </p>
          <div className="studio-reveal studio-reveal-d4 mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-[var(--studio-teal)] px-7 py-3 text-sm font-semibold text-[var(--studio-surface)] shadow-lg transition hover:brightness-95"
            >
              Sign in to build
            </Link>
            
          </div>
        </div>
        <div className="studio-reveal studio-reveal-d5 flex flex-1 justify-center lg:justify-end">
          <MarketingHeroPipeline />
        </div>
      </section>

      {/* Why the engine */}
      <section
        className="border-t border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/80 py-16 dark:bg-[var(--studio-surface-muted)]/40"
        aria-labelledby="why-engine-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="why-engine-heading"
            className="studio-section-reveal font-heading text-center text-2xl font-bold tracking-tight text-[var(--studio-ink)] sm:text-3xl"
          >
            Why real-time conversational infrastructure
          </h2>
          <p className="studio-section-reveal studio-section-reveal-d1 mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--studio-ink-muted)] sm:text-base">
            Natural voice AI needs more than a model — it needs a network and
            audio stack built for human pacing. That is what Agora&apos;s layer
            is for.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                Icon: Globe2,
                title: "Global, low-latency paths",
                text: "Traffic routed for responsive turn-taking so replies feel immediate, not robotic — even across regions.",
              },
              {
                Icon: AudioWaveform,
                title: "Built for real audio",
                text: "Handle noise, echo, and interruptions the way humans do — so agents work in cafés, cars, and contact centers.",
              },
              {
                Icon: Layers,
                title: "Your models & data",
                text: "Bring your preferred LLM, ASR, and TTS with BYOK-style flexibility — plus RAG and tools you already use.",
              },
            ].map((item, i) => (
              <article
                key={item.title}
                className={`studio-section-reveal group rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${
                  i === 1 ? "studio-section-reveal-d2" : i === 2 ? "studio-section-reveal-d3" : ""
                }`}
              >
                <div className="studio-float-soft mb-4 inline-flex rounded-xl border border-[var(--studio-border)] bg-[var(--studio-teal-dim)]/60 p-3 dark:bg-[var(--studio-teal-dim)]/40">
                  <item.Icon
                    className="h-6 w-6 text-[var(--studio-teal)]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--studio-ink-muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Build · Deploy · Optimize */}
      <section
        className="relative py-16 sm:py-20"
        aria-labelledby="studio-bdo-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="studio-bdo-heading"
            className="font-heading text-center text-2xl font-bold tracking-tight text-[var(--studio-ink)] sm:text-3xl"
          >
            Agent Studio: build, deploy, optimize
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--studio-ink-muted)] sm:text-base">
            The same lifecycle Agora describes for production voice agents — from
            first prompt to live numbers to measurable outcomes.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Build",
                icon: Sparkles,
                accent: "teal" as const,
                bullets: [
                  "Start from templates or scratch — context-aware agents for your ops.",
                  "Wire ASR, LLM, and TTS with your keys; tune VAD, turn detection, and voice lock.",
                  "Validate in a playground before anyone dials in.",
                ],
              },
              {
                title: "Deploy",
                icon: Phone,
                accent: "mauve" as const,
                bullets: [
                  "Connect phone numbers and elastic SIP trunks in minutes.",
                  "Route inbound calls to the right agent; launch outbound lists and schedules.",
                  "Use handoff, voicemail, and auto-hangup rules without custom telephony code.",
                ],
              },
              {
                title: "Optimize",
                icon: Rocket,
                accent: "teal" as const,
                bullets: [
                  "Replay calls, scan transcripts, and watch funnel metrics.",
                  "Track resolution, satisfaction signals, and automation rate over time.",
                  "Spot escalation patterns and tighten prompts with evidence — not guesses.",
                ],
              },
            ].map((col) => (
              <div
                key={col.title}
                className="group rounded-3xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-8 shadow-sm transition duration-300 hover:border-[var(--studio-teal)]/40 hover:shadow-lg"
              >
                <div
                  className={`mb-5 inline-flex rounded-2xl p-3 ${
                    col.accent === "teal"
                      ? "bg-[var(--studio-teal-dim)] text-[var(--studio-teal)]"
                      : "bg-[var(--studio-mauve-dim)] text-[var(--studio-mauve)]"
                  }`}
                >
                  <col.icon className="h-7 w-7" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--studio-ink)]">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--studio-ink-muted)]">
                  {col.bullets.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--studio-teal)]"
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey strip */}
      <section className="border-t border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 py-16 dark:bg-[var(--studio-surface-muted)]/30">
        <StudioJourneyStrip />
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-[var(--studio-ink)] sm:text-3xl">
          Ready to design your first agent?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--studio-ink-muted)]">
          Sign in to open the demo console.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-[var(--studio-teal)] px-8 py-3 text-sm font-semibold text-[var(--studio-surface)] shadow-md transition hover:brightness-95"
          >
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
