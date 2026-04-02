"use client";

import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

const options: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
];

export function ThemeSwitchPanel({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted) {
    return (
      <div
        className={cn("h-9 w-[4.25rem] shrink-0 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50", className)}
        aria-hidden
      />
    );
  }

  const active: Mode =
    theme === "light" || theme === "dark" ? theme : "system";
  const TriggerIcon =
    active === "light" ? Sun : active === "dark" ? Moon : Monitor;

  const pick = (id: Mode) => {
    setTheme(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Theme"
        title={
          active === "system"
            ? `System (${resolvedTheme ?? "theme"})`
            : `${active} mode`
        }
        className="flex h-9 items-center gap-1 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/80 px-2.5 text-[var(--studio-ink)] shadow-sm backdrop-blur-sm transition hover:bg-[var(--studio-surface)] focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none dark:bg-[var(--studio-surface-muted)]/50"
      >
        <TriggerIcon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[var(--studio-ink-muted)] transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[10.5rem] overflow-hidden rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] py-1 shadow-lg dark:bg-[var(--studio-surface)]"
        >
          {options.map(({ id, label, Icon }) => {
            const on = active === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                onClick={() => pick(id)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                  on
                    ? "bg-[var(--studio-teal-dim)] text-[var(--studio-ink)] dark:bg-[var(--studio-teal-dim)]/40"
                    : "text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)] hover:text-[var(--studio-ink)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                <span>{label}</span>
                {on ? (
                  <span className="ml-auto text-[10px] font-medium text-[var(--studio-teal)]">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
