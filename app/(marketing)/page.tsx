import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  BarChart3,
  Bot,
  Check,
  Clapperboard,
  Clock,
  Globe2,
  Headphones,
  Layers,
  Megaphone,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Rocket,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { MarketingHeroPipeline } from "@/components/marketing-hero-pipeline";
import {
  LIVE_CONVERSATION_TICKER_OUTER_HEIGHT_PX,
  LIVE_CONVERSATION_TICKER_WIDTH_CLASS,
  LiveConversationTicker,
} from "@/components/live-conversation-ticker";
import { AnimatedCounter } from "@/components/animated-counter";
import { ScrollReveal } from "@/components/scroll-reveal";
import { StudioJourneyStrip } from "@/components/studio-journey-strip";

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {/* ── Hero ── lg: CSS grid keeps column widths stable so copy doesn’t reflow when ticker updates */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-start lg:gap-16 lg:py-24 [contain:layout]">
        <div className="relative min-w-0">
          <span className="studio-reveal studio-reveal-d1 inline-flex items-center gap-2 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--studio-ink-muted)]">
            <Sparkles
              className="h-3.5 w-3.5 text-[var(--studio-teal)]"
              aria-hidden
            />
            Agent Studio · Voice AI for Business
          </span>
          <h1 className="studio-reveal studio-reveal-d2 font-heading mt-6 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--studio-ink)] sm:text-5xl lg:text-[3.25rem]">
            Turn every call into a customer.
            <span className="text-[var(--studio-teal)]"> Automatically.</span>
          </h1>
          <p className="studio-reveal studio-reveal-d3 mt-5 max-w-lg text-lg leading-relaxed text-[var(--studio-ink-muted)]">
            Deploy voice AI agents that qualify leads, close sales, and support
            customers around the clock — no code required. From first prompt to
            live phone lines in minutes.
          </p>
          <div className="studio-reveal studio-reveal-d4 mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--studio-teal)] px-7 py-3 text-sm font-semibold text-[var(--studio-surface)] shadow-lg transition hover:brightness-95"
            >
              Start building free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="https://www.agora.io/en/solutions/ai-sales-marketing-agents/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface)]/80 px-7 py-3 text-sm font-semibold text-[var(--studio-ink)] transition hover:bg-[var(--studio-surface-muted)] dark:bg-[var(--studio-surface)]/40"
            >
              Book a demo
            </a>
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-5 self-center lg:items-end lg:justify-self-end">
          {/* <MarketingHeroPipeline /> */}
          <div
            className={LIVE_CONVERSATION_TICKER_WIDTH_CLASS}
            style={{ minHeight: LIVE_CONVERSATION_TICKER_OUTER_HEIGHT_PX }}
          >
            <LiveConversationTicker />
          </div>
        </div>
      </section>

      {/* ── Metrics Strip ── */}
      <section className="border-y border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 py-12 dark:bg-[var(--studio-surface-muted)]/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:gap-6">
          {[
            {
              value: 3,
              suffix: "x",
              label: "More calls handled",
              sub: "vs. human-only teams",
            },
            {
              value: 60,
              suffix: "%",
              label: "Faster resolution",
              sub: "average time to resolve",
            },
            {
              value: 24,
              suffix: "/7",
              label: "Always available",
              sub: "no shifts, no burnout",
            },
            {
              value: 40,
              suffix: "%",
              label: "Lower cost per call",
              sub: "compared to staffed centers",
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-[var(--studio-teal)] sm:text-4xl">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--studio-ink)]">
                {stat.label}
              </p>
              <p className="text-xs text-[var(--studio-ink-muted)]">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Use Cases — Business Value ── */}
      <section className="relative py-16 sm:py-20" aria-labelledby="use-cases-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <h2
              id="use-cases-heading"
              className="font-heading text-center text-2xl font-bold tracking-tight text-[var(--studio-ink)] sm:text-3xl"
            >
              Voice AI agents for every revenue moment
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--studio-ink-muted)] sm:text-base">
              Whether you&apos;re converting inbound leads, launching outbound
              campaigns, or scaling support — Agent Studio deploys the right
              agent for the job.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                Icon: TrendingUp,
                accent: "teal" as const,
                title: "Sales & lead conversion",
                description:
                  "AI agents that answer inbound calls, qualify prospects in real time, and book meetings on your calendar. Never miss a hot lead again.",
                outcomes: [
                  "Qualify leads 24/7 with natural conversation",
                  "Book demos and meetings automatically",
                  "Route high-value prospects to your closers",
                  "Follow up on missed calls within seconds",
                ],
              },
              {
                Icon: Headphones,
                accent: "mauve" as const,
                title: "Customer support at scale",
                description:
                  "Resolve tickets, answer product questions, and handle complaints with empathy — then seamlessly escalate when a human touch is needed.",
                outcomes: [
                  "Resolve common issues without hold times",
                  "Intelligent escalation to human agents",
                  "Track satisfaction and resolution rates",
                  "Multilingual support out of the box",
                ],
              },
              {
                Icon: PhoneOutgoing,
                accent: "teal" as const,
                title: "Outbound campaigns",
                description:
                  "Launch call campaigns at scale — appointment reminders, follow-ups, surveys, and win-back sequences that sound human, not robotic.",
                outcomes: [
                  "Run thousands of calls simultaneously",
                  "Schedule campaigns by time zone",
                  "Personalize each conversation with context",
                  "Measure conversion in real-time dashboards",
                ],
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 120}>
                <div className="group flex h-full flex-col rounded-3xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-8 shadow-sm transition duration-300 hover:border-[var(--studio-teal)]/40 hover:shadow-lg">
                  <div
                    className={`studio-float-soft mb-5 inline-flex self-start rounded-2xl p-3 ${
                      card.accent === "teal"
                        ? "bg-[var(--studio-teal-dim)] text-[var(--studio-teal)]"
                        : "bg-[var(--studio-mauve-dim)] text-[var(--studio-mauve)]"
                    }`}
                  >
                    <card.Icon
                      className="h-7 w-7"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[var(--studio-ink)]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--studio-ink-muted)]">
                    {card.description}
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5 text-sm leading-relaxed text-[var(--studio-ink-muted)]">
                    {card.outcomes.map((line) => (
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section className="border-t border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/80 py-14 dark:bg-[var(--studio-surface-muted)]/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="font-heading text-center text-2xl font-bold tracking-tight text-[var(--studio-ink)] sm:text-3xl">
              Built for every industry that talks to customers
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--studio-ink-muted)]">
              From live commerce to gaming — anywhere real-time voice creates value.
            </p>
          </ScrollReveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {[
              {
                Icon: ShoppingBag,
                title: "Live shopping",
                text: "AI hosts that demo products and close sales on live streams.",
              },
              {
                Icon: Clapperboard,
                title: "Media & entertainment",
                text: "Interactive voice characters and real-time audience engagement.",
              },
              {
                Icon: Bot,
                title: "Gaming & metaverse",
                text: "NPCs and companions that speak naturally in virtual worlds.",
              },
              {
                Icon: Users,
                title: "Social apps",
                text: "Voice AI features that boost retention and session time.",
              },
              {
                Icon: AudioWaveform,
                title: "Live audio streaming",
                text: "AI co-hosts, moderators, and translators for live rooms.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 80}>
                <article className="group flex flex-col items-center rounded-2xl border border-[var(--studio-border)] border-dashed bg-[var(--studio-surface)]/40 p-5 text-center transition hover:border-[var(--studio-teal)]/35 hover:bg-[var(--studio-surface)]/70 dark:bg-[var(--studio-surface)]/20">
                  <div className="studio-float-soft mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] shadow-sm">
                    <item.Icon
                      className="h-6 w-6 text-[var(--studio-teal)]"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-[var(--studio-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--studio-ink-muted)]">
                    {item.text}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why the engine — business framed ── */}
      <section
        className="relative py-16 sm:py-20"
        aria-labelledby="why-engine-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <h2
              id="why-engine-heading"
              className="font-heading text-center text-2xl font-bold tracking-tight text-[var(--studio-ink)] sm:text-3xl"
            >
              What powers every conversation
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--studio-ink-muted)] sm:text-base">
              Your agents run on Agora&apos;s real-time conversational
              infrastructure — so every call feels as natural as talking to your
              best rep.
            </p>
          </ScrollReveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                Icon: Globe2,
                title: "Global, low-latency paths",
                text: "Customers never wait. Traffic is routed so responses feel instant — whether they're calling from New York or New Delhi.",
              },
              {
                Icon: AudioWaveform,
                title: "Built for real audio",
                text: "Handles background noise, interruptions, and cross-talk the way humans do — agents sound natural in any environment.",
              },
              {
                Icon: Layers,
                title: "Your models & data",
                text: "Bring your preferred LLM, ASR, and TTS. Connect your CRM, knowledge base, and tools so agents have full context on every call.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
                <article className="group rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Build · Deploy · Optimize ── */}
      <section
        className="border-t border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/80 py-16 sm:py-20 dark:bg-[var(--studio-surface-muted)]/40"
        aria-labelledby="studio-bdo-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <h2
              id="studio-bdo-heading"
              className="font-heading text-center text-2xl font-bold tracking-tight text-[var(--studio-ink)] sm:text-3xl"
            >
              From idea to live calls in three steps
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--studio-ink-muted)] sm:text-base">
              No engineering team required. Product and ops teams configure agent
              behavior, connect phone lines, and optimize performance — all from
              one studio.
            </p>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Build",
                icon: Sparkles,
                accent: "teal" as const,
                bullets: [
                  "Pick a template — sales, support, outbound — or start from scratch.",
                  "Configure your agent's voice, personality, and knowledge base with your own keys.",
                  "Test in a live playground before a single customer dials in.",
                ],
              },
              {
                title: "Deploy",
                icon: Phone,
                accent: "mauve" as const,
                bullets: [
                  "Connect phone numbers and SIP trunks in minutes — no telephony code.",
                  "Route inbound calls to the right agent; launch outbound campaigns on schedule.",
                  "Set handoff rules, voicemail, and auto-hangup so agents behave like your team.",
                ],
              },
              {
                title: "Optimize",
                icon: Rocket,
                accent: "teal" as const,
                bullets: [
                  "Replay calls, scan transcripts, and track conversion funnels in real time.",
                  "Monitor resolution rates, satisfaction signals, and cost per call over time.",
                  "Spot patterns, tighten prompts, and watch your close rate climb — with evidence.",
                ],
              },
            ].map((col, i) => (
              <ScrollReveal key={col.title} delay={i * 120}>
                <div className="group flex h-full flex-col rounded-3xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-8 shadow-sm transition duration-300 hover:border-[var(--studio-teal)]/40 hover:shadow-lg">
                  <div
                    className={`mb-5 inline-flex self-start rounded-2xl p-3 ${
                      col.accent === "teal"
                        ? "bg-[var(--studio-teal-dim)] text-[var(--studio-teal)]"
                        : "bg-[var(--studio-mauve-dim)] text-[var(--studio-mauve)]"
                    }`}
                  >
                    <col.icon
                      className="h-7 w-7"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[var(--studio-ink)]">
                    {col.title}
                  </h3>
                  <ul className="mt-5 flex-1 space-y-3 text-sm leading-relaxed text-[var(--studio-ink-muted)]">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey strip ── */}
      {/* <section className="border-t border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 py-16 dark:bg-[var(--studio-surface-muted)]/30">
        <StudioJourneyStrip />
      </section> */}

      {/* ── Closing CTA ── */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <ScrollReveal>
          <h2 className="font-heading text-2xl font-bold text-[var(--studio-ink)] sm:text-4xl">
            Start growing your business with voice AI
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[var(--studio-ink-muted)] sm:text-base">
            Join teams already using Agent Studio to convert more leads, resolve
            tickets faster, and run campaigns that scale. Get started in
            minutes — no engineering team needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.agora.io/en/solutions/ai-sales-marketing-agents/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--studio-teal)] px-8 py-3 text-sm font-semibold text-[var(--studio-surface)] shadow-lg transition hover:brightness-95"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface)]/80 px-8 py-3 text-sm font-semibold text-[var(--studio-ink)] transition hover:bg-[var(--studio-surface-muted)] dark:bg-[var(--studio-surface)]/40"
            >
              Sign in to build
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
