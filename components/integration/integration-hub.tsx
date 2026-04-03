"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/utils";
import { BookOpen, KeyRound, Server } from "lucide-react";
import Link from "next/link";

const CARDS = [
  {
    href: "/dashboard/integration/credentials",
    title: "Credentials",
    description:
      "BYOK API keys and provider settings for LLM, ASR, and TTS—update once, use everywhere.",
    icon: KeyRound,
    accent: "from-[var(--studio-teal)]/25 to-[var(--studio-teal)]/5",
  },
  {
    href: "/dashboard/integration/knowledge-bases",
    title: "Knowledge bases",
    description:
      "Upload reference documents so agents can ground answers in your content.",
    icon: BookOpen,
    accent: "from-[var(--studio-mauve)]/25 to-[var(--studio-mauve)]/5",
  },
  {
    href: "/dashboard/integration/mcps",
    title: "MCP servers",
    description:
      "Connect external tool servers over SSE, HTTP, or streamable HTTP.",
    icon: Server,
    accent: "from-[var(--studio-teal)]/20 to-[var(--studio-mauve)]/15",
  },
] as const;

export function IntegrationHub() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map((card, i) => (
        <ScrollReveal key={card.href} delay={i * 80}>
          <Link
            href={card.href}
            className={cn(
              "group flex h-full flex-col rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none"
            )}
          >
            <div
              className={cn(
                "mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
                card.accent
              )}
            >
              <card.icon
                className="h-5 w-5 text-[var(--studio-ink)]"
                aria-hidden
              />
            </div>
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-[var(--studio-ink)] group-hover:text-[var(--studio-ink)]">
              {card.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--studio-ink-muted)]">
              {card.description}
            </p>
            <span className="mt-4 text-sm font-medium text-[var(--studio-teal)]">
              Open →
            </span>
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
