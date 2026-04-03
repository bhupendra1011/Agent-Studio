"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const conversation = [
  { role: "customer" as const, text: "Hi, I'm interested in your enterprise plan." },
  { role: "agent" as const, text: "Great to hear! Let me pull up the details for you." },
  { role: "customer" as const, text: "We handle about 2,000 calls a day right now." },
  { role: "agent" as const, text: "Perfect. Our Growth tier covers up to 5,000 daily calls with priority routing. Want me to schedule a walkthrough with your team?" },
  { role: "customer" as const, text: "Yes, Thursday afternoon works best." },
  { role: "agent" as const, text: "Done — I've booked Thursday at 2 PM and sent a calendar invite. Anything else I can help with?" },
];

const MESSAGES_VIEWPORT_H_PX = 180;
/** Padding (p-5×2) + header row + mb-4 — reserve same height in hero so siblings don’t reflow */
export const LIVE_CONVERSATION_TICKER_OUTER_HEIGHT_PX =
  MESSAGES_VIEWPORT_H_PX + 132;

/** Match `max-w-md` (28rem) — explicit on lg so width never tracks content */
export const LIVE_CONVERSATION_TICKER_WIDTH_CLASS =
  "w-full max-w-md min-w-0 shrink-0 lg:mx-0 lg:w-[28rem] lg:min-w-[28rem] lg:max-w-[28rem]";

export function LiveConversationTicker() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= conversation.length) {
      // Reset after a pause
      const resetTimer = setTimeout(() => {
        setVisibleCount(0);
        setTyping(true);
      }, 4000);
      return () => clearTimeout(resetTimer);
    }

    const typingDelay = 800 + Math.random() * 600;
    const showDelay = typingDelay + 400;

    const typingTimer = setTimeout(() => setTyping(true), 0);
    const showTimer = setTimeout(() => {
      setTyping(false);
      setVisibleCount((c) => c + 1);
    }, showDelay);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(showTimer);
    };
  }, [visibleCount]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visibleCount, typing]);

  const currentRole =
    visibleCount < conversation.length
      ? conversation[visibleCount].role
      : "agent";

  return (
    <div
      className={`relative box-border flex flex-col overflow-hidden rounded-3xl border border-[var(--studio-border)] bg-[var(--studio-surface)]/90 p-5 shadow-xl backdrop-blur-sm [contain:layout] dark:bg-[var(--studio-surface)]/80 ${LIVE_CONVERSATION_TICKER_WIDTH_CLASS}`}
      style={{
        height: LIVE_CONVERSATION_TICKER_OUTER_HEIGHT_PX,
        minHeight: LIVE_CONVERSATION_TICKER_OUTER_HEIGHT_PX,
        maxHeight: LIVE_CONVERSATION_TICKER_OUTER_HEIGHT_PX,
      }}
    >
      {/* Header */}
      <div className="mb-4 flex min-w-0 shrink-0 items-center gap-3">
        <div className="studio-pulse-glow flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--studio-teal)]/20">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--studio-teal)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-ink)]">
            Live agent call
          </p>
          <p className="wrap-break-word text-[10px] text-[var(--studio-ink-muted)]">
            Sales qualification in progress
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--studio-teal)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--studio-teal)]">
          02:34
        </span>
      </div>

      {/* Messages — fixed viewport height; inner scroll so card height never changes */}
      <div
        className="shrink-0 overflow-hidden"
        style={{ height: MESSAGES_VIEWPORT_H_PX, minHeight: MESSAGES_VIEWPORT_H_PX, maxHeight: MESSAGES_VIEWPORT_H_PX }}
      >
        <div
          ref={scrollRef}
          className="h-full min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-h-full flex-col justify-end gap-2.5">
        {conversation.slice(0, visibleCount).map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "agent" ? "justify-start" : "justify-end"}`}
            style={{
              animation: "studio-fade-up 0.4s ease-out forwards",
            }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                msg.role === "agent"
                  ? "rounded-bl-md bg-[var(--studio-teal-dim)]/60 text-[var(--studio-ink)] dark:bg-[var(--studio-teal-dim)]/40"
                  : "rounded-br-md bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)]"
              }`}
            >
              <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wider opacity-60">
                {msg.role === "agent" ? "AI Agent" : "Customer"}
              </span>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && visibleCount < conversation.length && (
          <div
            className={`flex ${currentRole === "agent" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`flex gap-1 rounded-2xl px-4 py-2.5 ${
                currentRole === "agent"
                  ? "rounded-bl-md bg-[var(--studio-teal-dim)]/60 dark:bg-[var(--studio-teal-dim)]/40"
                  : "rounded-br-md bg-[var(--studio-surface-muted)]"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--studio-ink-muted)] opacity-60"
                style={{
                  animation: "studio-bar-dance 1s ease-in-out infinite",
                  animationDelay: "0s",
                }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--studio-ink-muted)] opacity-60"
                style={{
                  animation: "studio-bar-dance 1s ease-in-out infinite",
                  animationDelay: "0.15s",
                }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--studio-ink-muted)] opacity-60"
                style={{
                  animation: "studio-bar-dance 1s ease-in-out infinite",
                  animationDelay: "0.3s",
                }}
              />
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
