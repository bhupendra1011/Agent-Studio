"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const overview = { href: "/dashboard", label: "Overview" } as const;

const buildItems = [
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/integration", label: "Integration" },
] as const;

const deployItems = [
  { href: "/dashboard/phone-numbers", label: "Phone numbers" },
  { href: "/dashboard/campaign", label: "Campaign" },
] as const;

const observeItems = [
  { href: "/dashboard/call-history", label: "Call history" },
  { href: "/dashboard/analytics", label: "Analytics" },
] as const;

const settingsPanel = {
  href: "/dashboard/settings",
  label: "Settings Panel",
} as const;

function navLinkClass(active: boolean) {
  return (
    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none " +
    (active
      ? "bg-[var(--studio-mauve-dim)] text-[var(--studio-ink)] dark:bg-[var(--studio-mauve-dim)]"
      : "text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface)] hover:text-[var(--studio-ink)]")
  );
}

function isOverviewActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function isSettingsPanelActive(pathname: string) {
  return (
    pathname === "/dashboard/settings" ||
    pathname.startsWith("/dashboard/settings/") ||
    pathname === "/dashboard/profile" ||
    pathname.startsWith("/dashboard/profile/")
  );
}

/** Edge-to-edge line inside padded nav; always paired with a section heading below it. */
function SidebarSectionRule({ dense }: { dense?: boolean }) {
  return (
    <div
      className={dense ? "-mx-3" : "-mx-3 mt-4"}
      aria-hidden="true"
    >
      <div className="h-px w-full bg-[var(--studio-border)]" />
    </div>
  );
}

function NavSection({
  title,
  items,
  pathname,
  isFirst,
}: {
  title: string;
  items: readonly { href: string; label: string }[];
  pathname: string;
  isFirst: boolean;
}) {
  const headingId = `sidebar-nav-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section
      className={isFirst ? "mt-3" : undefined}
      aria-labelledby={headingId}
    >
      <SidebarSectionRule dense={isFirst} />
      <h2
        id={headingId}
        className="font-heading px-3 pt-3 pb-2 text-[0.625rem] font-semibold uppercase leading-none tracking-[0.18em] text-[var(--studio-ink-muted)]"
      >
        {title}
      </h2>
      <div className="flex flex-col gap-1">
        {items.map(({ href, label }) => {
          const active = isOverviewActive(pathname, href);
          return (
            <Link key={href} href={href} className={navLinkClass(active)}>
              {label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--studio-border)] bg-[var(--studio-surface-muted)]">
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <nav className="flex flex-col p-3" aria-label="Dashboard">
          <Link
            href={overview.href}
            className={navLinkClass(isOverviewActive(pathname, overview.href))}
          >
            {overview.label}
          </Link>

          <NavSection
            title="Build"
            items={buildItems}
            pathname={pathname}
            isFirst
          />
          <NavSection
            title="Deploy"
            items={deployItems}
            pathname={pathname}
            isFirst={false}
          />
          <NavSection
            title="Observe"
            items={observeItems}
            pathname={pathname}
            isFirst={false}
          />

          <SidebarSectionRule dense={false} />
          <div className="pt-2">
            <Link
              href={settingsPanel.href}
              className={navLinkClass(isSettingsPanelActive(pathname))}
            >
              {settingsPanel.label}
            </Link>
          </div>
        </nav>
      </ScrollArea>
      <Separator
        orientation="horizontal"
        className="bg-[var(--studio-border)]"
      />
      <p className="px-4 py-3 text-xs text-[var(--studio-ink-muted)]">
        Workspace navigation
      </p>
    </aside>
  );
}
