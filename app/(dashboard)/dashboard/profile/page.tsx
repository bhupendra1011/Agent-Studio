import { ThemeSwitchPanel } from "@/components/theme-switch-panel";
import { auth } from "@/auth";

export default async function DashboardProfilePage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--studio-ink)]">
          Profile
        </h1>
        <p className="mt-2 text-[var(--studio-ink-muted)]">
          Your session details and display preferences.
        </p>
      </div>
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
          Account
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[var(--studio-ink-muted)]">Display name</dt>
            <dd className="font-medium text-[var(--studio-ink)]">
              {session?.user?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--studio-ink-muted)]">User id</dt>
            <dd className="font-medium text-[var(--studio-ink)]">
              {session?.user?.id ?? session?.user?.email ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
          Theme
        </h2>
        <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
          Same control as in the header — set once, applies across the app in
          this browser.
        </p>
        <div className="mt-4">
          <ThemeSwitchPanel />
        </div>
      </section>
    </div>
  );
}
