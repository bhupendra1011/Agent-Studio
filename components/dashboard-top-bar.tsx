import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitchPanel } from "@/components/theme-switch-panel";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    parts[0]![0]! + parts[parts.length - 1]![0]!
  ).toUpperCase();
}

export function DashboardTopBar({ userName }: { userName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--studio-border)] bg-[var(--studio-surface)] px-4 sm:px-6">
      <nav className="flex items-center gap-2" aria-label="Main">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="rounded-full text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
          render={<Link href="/" />}
        >
          Home
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          className="rounded-full border-[var(--studio-border)] bg-[var(--studio-teal-dim)] text-[var(--studio-ink)]"
          render={<Link href="/dashboard" />}
        >
          Dashboard
        </Button>
      </nav>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeSwitchPanel />
        <div
          className="hidden items-center gap-2 sm:flex"
          title="Session active"
        >
          <Avatar
            size="sm"
            className="ring-2 ring-[var(--studio-border)] ring-offset-2 ring-offset-[var(--studio-surface)]"
          >
            <AvatarFallback className="bg-[var(--studio-teal-dim)] text-xs font-medium text-[var(--studio-ink)]">
              {initialsFromName(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="max-w-[10rem] truncate text-sm font-medium text-[var(--studio-ink)]">
              {userName}
            </span>
            <Badge
              variant="outline"
              className="h-5 w-fit border-[var(--studio-border)] text-[10px] text-[var(--studio-teal)]"
            >
              Session active
            </Badge>
          </div>
        </div>
        <SignOutButton
          variant="outline"
          size="sm"
          className="rounded-full border-[var(--studio-border)]"
        />
      </div>
    </header>
  );
}
