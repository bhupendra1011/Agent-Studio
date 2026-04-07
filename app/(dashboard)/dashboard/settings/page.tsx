import { ThemeSwitchPanel } from "@/components/theme-switch-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/auth";
import { initialsFromName } from "@/lib/initials-from-name";

export default async function DashboardSettingsPage() {
  const session = await auth();
  const name = session?.user?.name ?? "User";
  const image = session?.user?.image;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--studio-ink)]">
          Settings Panel
        </h1>
        <p className="mt-2 text-[var(--studio-ink-muted)]">
          Account details and appearance. Theme is stored in this browser only
          (demo app — add a database to sync across devices).
        </p>
      </div>
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
          Account
        </h2>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <Avatar className="size-20 ring-2 ring-[var(--studio-border)] ring-offset-4 ring-offset-[var(--studio-surface)]">
            {image ? <AvatarImage src={image} alt="" /> : null}
            <AvatarFallback className="bg-[var(--studio-teal-dim)] text-lg font-medium text-[var(--studio-ink)]">
              {initialsFromName(name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-[var(--studio-ink-muted)]">Display name</dt>
            <dd className="font-medium text-[var(--studio-ink)]">
              {session?.user?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--studio-ink-muted)]">Email</dt>
            <dd className="font-medium text-[var(--studio-ink)]">
              {session?.user?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--studio-ink-muted)]">User id</dt>
            <dd className="font-medium text-[var(--studio-ink)]">
              {session?.user?.id ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-[var(--studio-ink)]">
          Appearance
        </h2>
        <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
          Choose light, dark, or follow the system — same control as in the
          header.
        </p>
        <div className="mt-4">
          <ThemeSwitchPanel />
        </div>
      </section>
    </div>
  );
}
