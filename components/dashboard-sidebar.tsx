"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/integration", label: "Integration" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--studio-border)] bg-[var(--studio-surface-muted)]">
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <nav className="flex flex-col gap-1 p-4" aria-label="Dashboard">
          {items.map(({ href, label }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none " +
                  (active
                    ? "bg-[var(--studio-mauve-dim)] text-[var(--studio-ink)] dark:bg-[var(--studio-mauve-dim)]"
                    : "text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface)] hover:text-[var(--studio-ink)]")
                }
              >
                {label}
              </Link>
            );
          })}
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
