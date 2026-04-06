"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AgentPipeline, GraphData } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useCallback, useState } from "react";

interface TestPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: AgentPipeline;
  graphData: GraphData;
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
  disconnected: { label: "Disconnected", color: "text-[var(--studio-ink-muted)]", pulse: false },
  joining: { label: "Joining…", color: "text-amber-500", pulse: true },
  connecting: { label: "Connecting Agent…", color: "text-amber-500", pulse: true },
  listening: { label: "Listening", color: "text-[var(--studio-teal)]", pulse: true },
  talking: { label: "Talking", color: "text-emerald-500", pulse: true },
  error: { label: "Error", color: "text-red-500", pulse: false },
};

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

function AudioVisualizer({ active }: { active: boolean }) {
  return (
    <div className="flex h-16 items-end justify-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-full transition-all",
            active
              ? `bg-[var(--studio-teal)] studio-bar-dance studio-bar-dance-d${i + 1}`
              : "h-2 bg-[var(--studio-ink-muted)]/30"
          )}
          style={active ? { height: `${20 + Math.random() * 40}px` } : undefined}
        />
      ))}
    </div>
  );
}

export function TestPanel({
  open,
  onOpenChange,
  pipeline,
  graphData,
}: TestPanelProps) {
  const [status, setStatus] = useState<CallStatus>("disconnected");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const isActive = status !== "disconnected" && status !== "error";

  const handleStartCall = useCallback(async () => {
    setStatus("joining");
    setTranscript([]);

    // Simulate connection flow
    await new Promise((r) => setTimeout(r, 800));
    setStatus("connecting");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("listening");

    // Add greeting if configured
    const greeting = graphData.llm?.greeting_message;
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-md"
      >
        <SheetHeader className="border-b border-[var(--studio-border)] pb-4">
          <SheetTitle className="font-[family-name:var(--font-syne)] text-[var(--studio-ink)]">
            Test Agent
          </SheetTitle>
          <SheetDescription className="text-[var(--studio-ink-muted)]">
            Test your agent configuration with a live call
          </SheetDescription>
        </SheetHeader>

        {/* Status + Visualizer */}
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--studio-border)] bg-[var(--studio-surface-muted)]">
            <AudioVisualizer active={isActive} />
          </div>
          <div className="flex items-center gap-2">
            {STATUS_CONFIG[status].pulse && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--studio-teal)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--studio-teal)]" />
              </span>
            )}
            <span
              className={cn(
                "text-sm font-medium",
                STATUS_CONFIG[status].color
              )}
            >
              {STATUS_CONFIG[status].label}
            </span>
          </div>
        </div>

        {/* Transcript */}
        <ScrollArea className="flex-1 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40">
          <div className="min-h-[200px] p-4">
            {transcript.length === 0 ? (
              <p className="text-center text-xs text-[var(--studio-ink-muted)]/60">
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
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
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

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 border-t border-[var(--studio-border)] pt-4">
          {isActive && (
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
            >
              {muted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}

          {isActive ? (
            <Button
              type="button"
              onClick={handleEndCall}
              className="h-11 rounded-full bg-red-500 px-6 text-white hover:bg-red-600"
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              End Call
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleStartCall()}
              className="h-11 rounded-full bg-[var(--studio-teal)] px-6 text-white hover:opacity-90 dark:text-[var(--studio-ink)]"
            >
              <Phone className="mr-2 h-4 w-4" />
              Start Call
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
