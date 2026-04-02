export default function DashboardOverviewPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--studio-ink)]">
          Overview
        </h1>
        <p className="mt-2 text-[var(--studio-ink-muted)]">
          Snapshot of your workspace — connect Studio resources and monitor
          traffic from here.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Agents",
            value: "—",
            hint: "Build & test in Console",
          },
          {
            title: "Integrations",
            value: "—",
            hint: "Credentials & MCP",
          },
          {
            title: "Calls today",
            value: "—",
            hint: "Observe tab",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--studio-teal)]">
              {card.title}
            </p>
            <p className="font-heading mt-3 text-3xl font-bold text-[var(--studio-ink)]">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-[var(--studio-ink-muted)]">
              {card.hint}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
