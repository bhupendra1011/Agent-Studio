"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CallState = "idle" | "ringing" | "connected" | "ended";

const DEMO_TRANSCRIPT = [
  {
    time: 1,
    speaker: "agent" as const,
    text: "Hello! Thanks for calling. How can I help you today?",
  },
  {
    time: 4,
    speaker: "caller" as const,
    text: "Hi, I'd like to learn more about your pricing plans.",
  },
  {
    time: 7,
    speaker: "agent" as const,
    text: "Of course! We have three tiers. Would you like me to walk you through each one?",
  },
  {
    time: 11,
    speaker: "caller" as const,
    text: "Yes please, start with the basic plan.",
  },
  {
    time: 14,
    speaker: "agent" as const,
    text: "Our Starter plan is $29 per month and includes up to 500 minutes of AI calls…",
  },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function TestCallStep({ agentName }: { agentName: string }) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<typeof DEMO_TRANSCRIPT>([]);
  const timersRef = useRef<number[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const startCall = () => {
    clearTimers();
    setCallState("ringing");
    setElapsed(0);
    setTranscript([]);

    timersRef.current.push(
      window.setTimeout(() => {
        setCallState("connected");
        tickRef.current = setInterval(() => {
          setElapsed((e) => e + 1);
        }, 1000);

        DEMO_TRANSCRIPT.forEach((t) => {
          timersRef.current.push(
            window.setTimeout(() => {
              setTranscript((prev) => [...prev, t]);
            }, t.time * 1000)
          );
        });

        timersRef.current.push(
          window.setTimeout(() => {
            setCallState("ended");
            if (tickRef.current) {
              clearInterval(tickRef.current);
              tickRef.current = null;
            }
          }, 18000)
        );
      }, 2000)
    );
  };

  const label =
    callState === "idle"
      ? "Ready to test"
      : callState === "ringing"
        ? "Ringing…"
        : callState === "connected"
          ? "Connected"
          : "Call complete";

  const sub =
    callState === "idle"
      ? `Calling your agent "${agentName || "My Agent"}"`
      : callState === "ringing"
        ? "Connecting to agent…"
        : callState === "connected"
          ? formatTime(elapsed)
          : `Duration: ${formatTime(elapsed)}`;

  return (
    <div>
      <div className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-7 text-center">
        <div
          className={cn(
            "mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 transition-colors",
            callState === "connected" &&
              "border-[var(--studio-teal)] bg-[color-mix(in_oklch,var(--studio-teal)_12%,transparent)]",
            callState === "ringing" &&
              "border-amber-500 bg-amber-500/10 studio-setup-ring-pulse",
            (callState === "idle" || callState === "ended") &&
              "border-[var(--studio-border)] bg-[var(--studio-surface-muted)]"
          )}
        >
          {callState === "connected" ? (
            <div className="flex h-5 items-end gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="studio-setup-wave-bar w-1 rounded-sm bg-[var(--studio-teal)]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : callState === "ended" ? (
            <Check className="h-7 w-7 text-[var(--studio-teal)]" strokeWidth={2} />
          ) : (
            <Phone className="h-7 w-7 text-[var(--studio-ink-muted)]" />
          )}
        </div>
        <p className="text-base font-medium text-[var(--studio-ink)]">{label}</p>
        <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">{sub}</p>

        {callState === "idle" ? (
          <Button
            type="button"
            className="mt-5 rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
            onClick={startCall}
          >
            Start test call
          </Button>
        ) : null}

        {callState === "ended" ? (
          <div className="mt-4 rounded-lg border border-[var(--studio-teal)]/20 bg-[color-mix(in_oklch,var(--studio-teal)_6%,transparent)] px-3 py-3 text-xs leading-relaxed text-[var(--studio-teal)]">
            Agent responded correctly. Voice quality normal. Average latency
            ~180ms (simulated).
          </div>
        ) : null}
      </div>

      {transcript.length > 0 ? (
        <div className="mt-4 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4">
          <p className="mb-3 text-xs font-medium text-[var(--studio-ink-muted)]">
            Live transcript
          </p>
          <div className="flex flex-col gap-2.5">
            {transcript.map((t, i) => (
              <div key={`${t.time}-${i}`} className="flex gap-2.5">
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    t.speaker === "agent"
                      ? "bg-[var(--studio-teal)]"
                      : "bg-sky-500"
                  )}
                />
                <div>
                  <p className="text-[0.6875rem] text-[var(--studio-ink-muted)]">
                    {t.speaker === "agent" ? "Agent" : "Caller"}
                  </p>
                  <p className="text-sm leading-snug text-[var(--studio-ink)]">
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
