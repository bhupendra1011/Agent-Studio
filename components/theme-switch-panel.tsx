"use client";

import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

const options: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
];

const emptySubscribe = () => () => {};

function useClientMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function ThemeSwitchPanel({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useClientMounted();

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 w-[4.25rem] shrink-0 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50",
          className
        )}
        aria-hidden
      />
    );
  }

  const active: Mode =
    theme === "light" || theme === "dark" ? theme : "system";
  const TriggerIcon =
    active === "light" ? Sun : active === "dark" ? Moon : Monitor;

  const title =
    active === "system"
      ? `System (${resolvedTheme ?? "theme"})`
      : `${active} mode`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        title={title}
        aria-label="Theme"
        className={cn(
          "flex h-9 items-center gap-1 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/80 px-2.5 text-[var(--studio-ink)] shadow-sm backdrop-blur-sm transition hover:bg-[var(--studio-surface)] focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none dark:bg-[var(--studio-surface-muted)]/50 data-popup-open:bg-[var(--studio-surface)]",
          className
        )}
      >
        <TriggerIcon
          className="h-4 w-4 shrink-0"
          strokeWidth={1.75}
          aria-hidden
        />
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-[var(--studio-ink-muted)] transition-transform data-popup-open:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="min-w-[10.5rem] rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface)] p-1 shadow-lg ring-[var(--studio-border)] dark:bg-[var(--studio-surface)]"
      >
        <DropdownMenuRadioGroup
          value={active}
          onValueChange={(value) =>
            setTheme(value as Mode)
          }
        >
          {options.map(({ id, label, Icon }) => (
            <DropdownMenuRadioItem
              key={id}
              value={id}
              className={cn(
                "gap-2.5 pl-2 pr-8 text-[var(--studio-ink-muted)] focus:bg-[var(--studio-surface-muted)] focus:text-[var(--studio-ink)] data-checked:bg-[var(--studio-teal-dim)] data-checked:text-[var(--studio-ink)] dark:data-checked:bg-[var(--studio-teal-dim)]/40"
              )}
            >
              <Icon
                className="h-4 w-4 shrink-0 opacity-80"
                strokeWidth={1.75}
                aria-hidden
              />
              <span>{label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
