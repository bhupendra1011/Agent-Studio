import Link from "next/link";

import { ThemeSwitchPanel } from "@/components/theme-switch-panel";

export default function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--studio-ink)]">
          Settings
        </h1>
        <p className="mt-2 text-[var(--studio-ink-muted)]">
          Manage your account preferences and appearance. Theme is stored in this
          browser only (demo app — add a database to sync across devices).
        </p>
      </div>
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
          Appearance
        </h2>
        <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
          Choose light, dark, or follow the system.
        </p>
        <div className="mt-4">
          <ThemeSwitchPanel />
        </div>
      </section>
      <p className="text-sm text-[var(--studio-ink-muted)]">
        More preferences live in{" "}
        <Link
          href="/dashboard/profile"
          className="font-medium text-[var(--studio-ink)] underline-offset-2 hover:underline"
        >
          Profile
        </Link>
        .
      </p>
    </div>
  );
}
