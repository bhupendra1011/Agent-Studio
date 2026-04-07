"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentPipeline, GraphData } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useCallback, useState } from "react";

export interface AgentTestPanelContentProps {
  pipeline: AgentPipeline;
  graphData: GraphData;
  variant?: "sheet" | "inline";
}

type CallStatus =
  | "disconnected"
  | "joining"
  | "connecting"
  | "listening"
  | "talking"
  | "error";

const STATUS_CONFIG: Record<
  CallStatus,
  { label: string; color: string; pulse: boolean }
> = {
  disconnected: {
    label: "Disconnected",
    color: "text-[var(--studio-ink-muted)]",
    pulse: false,
  },
  joining: { label: "Joining…", color: "text-amber-500", pulse: true },
  connecting: {
    label: "Connecting agent…",
    color: "text-amber-500",
    pulse: true,
  },
  listening: {
    label: "Listening",
    color: "text-[var(--studio-teal)]",
    pulse: true,
  },
  talking: { label: "Talking", color: "text-emerald-500", pulse: true },
  error: { label: "Error", color: "text-red-500", pulse: false },
};

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

const BAR_DELAYS = ["0s", "0.12s", "0.24s", "0.08s", "0.2s"];

function AudioVisualizer({ active }: { active: boolean }) {
  return (
    <div className="flex h-14 items-end justify-center gap-1">
      {BAR_DELAYS.map((delay, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-full bg-[var(--studio-teal)]",
            active
              ? "studio-bar-dance h-8"
              : "h-2 bg-[var(--studio-ink-muted)]/30"
          )}
          style={active ? { animationDelay: delay } : undefined}
        />
      ))}
    </div>
  );
}

export function AgentTestPanelContent({
  pipeline,
  graphData,
  variant = "sheet",
}: AgentTestPanelContentProps) {
  const [status, setStatus] = useState<CallStatus>("disconnected");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const isActive = status !== "disconnected" && status !== "error";

  const handleStartCall = useCallback(async () => {
    setStatus("joining");
    setTranscript([]);

    await new Promise((r) => setTimeout(r, 800));
    setStatus("connecting");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("listening");

    const greeting =
      graphData.llm?.greeting_message ||
      (graphData.llm?.system_messages?.[0]?.content
        ? String(graphData.llm.system_messages[0].content).slice(0, 240)
        : null);
    if (greeting) {
      setTranscript([
        {
          id: `t_${Date.now()}`,
          role: "agent",
          text: greeting,
          timestamp: new Date(),
        },
      ]);
      setStatus("talking");
      await new Promise((r) => setTimeout(r, 1500));
      setStatus("listening");
    }
  }, [graphData]);

  const handleEndCall = useCallback(() => {
    setStatus("disconnected");
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-[var(--studio-surface)]",
        variant === "inline"
          ? "h-full border-[var(--studio-border)] lg:border-b-0"
          : "flex-1 gap-4"
      )}
    >
      {variant === "inline" ? (
        <div className="shrink-0 border-b border-[var(--studio-border)] px-4 py-3">
          <h2 className="font-heading text-base font-semibold text-[var(--studio-ink)]">
            Test agent
          </h2>
          <p className="mt-0.5 text-xs text-[var(--studio-ink-muted)]">
            {pipeline.name} · simulated session (wire to preview API when ready).
          </p>
        </div>
      ) : null}

      <div className="flex shrink-0 flex-col items-center gap-3 px-4 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--studio-border)] bg-[var(--studio-surface-muted)]">
          <AudioVisualizer active={isActive} />
        </div>
        <div className="flex items-center gap-2">
          {STATUS_CONFIG[status].pulse ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--studio-teal)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--studio-teal)]" />
            </span>
          ) : null}
          <span
            className={cn("text-sm font-medium", STATUS_CONFIG[status].color)}
          >
            {STATUS_CONFIG[status].label}
          </span>
        </div>
      </div>

      <ScrollArea
        className={cn(
          "min-h-[140px] flex-1 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40",
          variant === "inline" ? "mx-4" : ""
        )}
      >
        <div className="p-4">
          {transcript.length === 0 ? (
            <p className="py-6 text-center text-xs text-[var(--studio-ink-muted)]/70">
              {isActive
                ? "Listening for conversation…"
                : "Start a call to begin testing"}
            </p>
          ) : (
            <div className="space-y-3">
              {transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex",
                    entry.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                      entry.role === "user"
                        ? "bg-[var(--studio-teal)]/15 text-[var(--studio-ink)]"
                        : "bg-[var(--studio-mauve-dim)] text-[var(--studio-ink)]"
                    )}
                  >
                    <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--studio-ink-muted)]">
                      {entry.role === "user" ? "You" : "Agent"}
                    </div>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div
        className={cn(
          "flex shrink-0 items-center justify-center gap-3 border-t border-[var(--studio-border)] py-4",
          variant === "inline" ? "px-4" : ""
        )}
      >
        {isActive ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMuted(!muted)}
            className={cn(
              "h-11 w-11 rounded-full",
              muted
                ? "border-red-500/30 bg-red-500/10 text-red-500"
                : "border-[var(--studio-border)] text-[var(--studio-ink-muted)]"
            )}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        ) : null}

        {isActive ? (
          <Button
            type="button"
            onClick={handleEndCall}
            className="h-11 rounded-full bg-red-500 px-6 text-white hover:bg-red-600"
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            End call
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => void handleStartCall()}
            className="h-11 rounded-full bg-[var(--studio-teal)] px-6 text-[var(--studio-ink)] hover:opacity-90"
          >
            <Phone className="mr-2 h-4 w-4" />
            Start call
          </Button>
        )}
      </div>
    </div>
  );
}
