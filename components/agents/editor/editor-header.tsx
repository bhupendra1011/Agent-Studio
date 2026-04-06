"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialsFromName } from "@/lib/initials-from-name";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Phone,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface EditorHeaderProps {
  name: string;
  status: "draft" | "live" | "paused";
  dirty: boolean;
  saving: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onTestOpen: () => void;
  onDeployOpen: () => void;
}

export function EditorHeader({
  name,
  status,
  dirty,
  saving,
  onNameChange,
  onSave,
  onTestOpen,
  onDeployOpen,
}: EditorHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [localName, setLocalName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitName = useCallback(() => {
    setEditing(false);
    const trimmed = localName.trim();
    if (trimmed && trimmed !== name) {
      onNameChange(trimmed);
    } else {
      setLocalName(name);
    }
  }, [localName, name, onNameChange]);

  const statusVariant = (s: string) => {
    if (s === "live")
      return "bg-[var(--studio-teal)]/20 text-[var(--studio-ink)] border-[var(--studio-teal)]/40";
    if (s === "paused")
      return "bg-amber-500/15 text-amber-900 dark:text-amber-100 border-amber-500/30";
    return "bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)] border-[var(--studio-border)]";
  };

  return (
    <div className="sticky top-0 z-30 border-b border-[var(--studio-border)] bg-[var(--studio-surface)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {/* Left: breadcrumb + name */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/agents"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--studio-ink-muted)] transition-colors hover:bg-[var(--studio-surface-muted)] hover:text-[var(--studio-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--studio-ink-muted)]/50" />

          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="h-8 w-8 shrink-0 border border-[var(--studio-border)]">
              <AvatarFallback className="bg-[var(--studio-mauve-dim)] text-xs font-medium text-[var(--studio-ink)]">
                {initialsFromName(name)}
              </AvatarFallback>
            </Avatar>

            {editing ? (
              <Input
                ref={inputRef}
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitName();
                  if (e.key === "Escape") {
                    setLocalName(name);
                    setEditing(false);
                  }
                }}
                className="h-8 max-w-[240px] rounded-lg border-[var(--studio-teal)]/40 bg-transparent text-base font-semibold text-[var(--studio-ink)] font-[family-name:var(--font-syne)] focus-visible:ring-[var(--studio-teal)]/30"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="truncate text-base font-semibold text-[var(--studio-ink)] font-[family-name:var(--font-syne)] transition-colors hover:text-[var(--studio-teal)]"
              >
                {name || "Untitled Agent"}
              </button>
            )}

            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-lg border capitalize",
                statusVariant(status)
              )}
            >
              {status}
            </Badge>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {dirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={onSave}
              className="rounded-xl border-[var(--studio-border)] text-[var(--studio-ink-muted)]"
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-3.5 w-3.5" />
              )}
              {saving ? "Saving…" : "Save"}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTestOpen}
            className="rounded-xl border-[var(--studio-teal)]/30 text-[var(--studio-teal)] hover:bg-[var(--studio-teal)]/10 studio-pulse-glow"
          >
            <Phone className="mr-1.5 h-3.5 w-3.5" />
            Test
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onDeployOpen}
            className="rounded-xl bg-[var(--studio-teal)] text-white hover:opacity-90 dark:text-[var(--studio-ink)]"
          >
            <Rocket className="mr-1.5 h-3.5 w-3.5" />
            {status === "live" ? "Republish" : "Deploy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
