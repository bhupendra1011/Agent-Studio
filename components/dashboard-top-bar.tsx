import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitchPanel } from "@/components/theme-switch-panel";

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
        <span
          className="hidden items-center gap-1.5 text-sm text-[var(--studio-ink-muted)] sm:flex"
          title="Session active"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
            aria-hidden
          />
          <span className="max-w-[10rem] truncate text-[var(--studio-ink)]">
            {userName}
          </span>
        </span>
        <SignOutButton
          variant="outline"
          size="sm"
          className="rounded-full border-[var(--studio-border)]"
        />
      </div>
    </header>
  );
}
