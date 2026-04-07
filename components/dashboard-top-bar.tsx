import Link from "next/link";

import { SetupWizardShortcut } from "@/components/setup/setup-wizard-shortcut";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitchPanel } from "@/components/theme-switch-panel";
import { initialsFromName } from "@/lib/initials-from-name";

export function DashboardTopBar({
  userName,
  userImage,
}: {
  userName: string;
  userImage?: string | null;
}) {
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
        <SetupWizardShortcut />
        <ThemeSwitchPanel />
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar
            size="sm"
            className="ring-2 ring-[var(--studio-border)] ring-offset-2 ring-offset-[var(--studio-surface)]"
          >
            {userImage ? (
              <AvatarImage
                src={userImage}
                alt=""
              />
            ) : null}
            <AvatarFallback className="bg-[var(--studio-teal-dim)] text-xs font-medium text-[var(--studio-ink)]">
              {initialsFromName(userName)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[10rem] truncate text-sm font-medium text-[var(--studio-ink)]">
            {userName}
          </span>
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
