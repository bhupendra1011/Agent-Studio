"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const BASE = "/dashboard/integration";

const TABS: { href: string; label: string; end?: boolean }[] = [
  { href: BASE, label: "Overview", end: true },
  { href: `${BASE}/credentials`, label: "Credentials" },
  { href: `${BASE}/knowledge-bases`, label: "Knowledge bases" },
  { href: `${BASE}/mcps`, label: "MCP servers" },
];

export interface IntegrationShellProps {
  children: ReactNode;
}

export function IntegrationShell({ children }: IntegrationShellProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight text-[var(--studio-ink)]">
          Integration
        </h1>
        <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
          Store credentials, knowledge bases, and MCP servers to reuse across
          agents.
        </p>
      </div>

      <div
        className="flex w-full flex-wrap gap-1 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] p-1"
        role="tablist"
        aria-label="Integration sections"
      >
        {TABS.map(({ href, label, end }) => {
          const active = end
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={active}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)] focus-visible:outline-none",
                active
                  ? "bg-[var(--studio-surface)] text-[var(--studio-ink)] shadow-sm"
                  : "text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
