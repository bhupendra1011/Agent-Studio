import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeSwitchPanel } from "@/components/theme-switch-panel";
import { SignOutButton } from "@/components/sign-out-button";

type SessionUser = { name?: string | null };

export function MarketingHeader({ user }: { user: SessionUser | undefined }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--studio-border)] bg-[var(--studio-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-[var(--studio-ink)]"
        >
          Agent Studio
        </Link>
        <nav className="flex flex-1 items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            className="rounded-full border-[var(--studio-border)] bg-[var(--studio-teal-dim)] text-[var(--studio-ink)] hover:bg-[var(--studio-teal)]/35"
            render={<Link href="/" />}
          >
            Home
          </Button>
          <a
            href="/docs/white-label-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--studio-teal)] underline-offset-4 hover:underline"
          >
            Docs
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitchPanel />
          {user ? (
            <>
              <span className="hidden text-sm text-[var(--studio-ink-muted)] sm:inline">
                <span className="text-[var(--studio-ink)]">{user.name}</span>
              </span>
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                className="rounded-full border-[var(--studio-border)] bg-[var(--studio-teal-dim)]"
                render={<Link href="/dashboard" />}
              >
                Dashboard
              </Button>
              <SignOutButton
                variant="outline"
                size="sm"
                className="rounded-full border-[var(--studio-border)]"
              />
            </>
          ) : (
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              className="rounded-full border-[var(--studio-border)] bg-[var(--studio-teal-dim)] text-[var(--studio-ink)] hover:bg-[var(--studio-teal)]/35"
              render={<Link href="/login" />}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
