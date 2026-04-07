"use client";

import { cn } from "@/lib/utils";
import { Building2, ChevronRight, Link2, MonitorSmartphone, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNav = [
  {
    href: "/dashboard/admin/isv",
    label: "ISV Management",
    icon: MonitorSmartphone,
  },
  {
    href: "/dashboard/admin/users",
    label: "User Management",
    icon: Users,
  },
  {
    href: "/dashboard/admin/association",
    label: "Association",
    icon: Link2,
  },
] as const;

function navLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-[var(--studio-teal)]/20 text-[var(--studio-ink)]"
      : "text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface)] hover:text-[var(--studio-ink)]"
  );
}

interface AdminPortalLayoutProps {
  userName: string;
  userRole: "admin" | "user";
  children: React.ReactNode;
}

export function AdminPortalLayout({
  userName,
  userRole,
  children,
}: AdminPortalLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-7rem)] w-full max-w-[1600px] flex-col gap-4 lg:flex-row lg:gap-0">
      <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 shadow-sm lg:w-56 lg:rounded-r-none lg:border-r-0 lg:shadow-none">
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--studio-teal)] text-sm font-bold text-[var(--studio-ink)]">
            AS
          </div>
          <div className="min-w-0">
            <p className="font-heading truncate text-sm font-semibold text-[var(--studio-ink)]">
              Agent Studio
            </p>
            <p className="truncate text-xs text-[var(--studio-ink-muted)]">
              <span className="capitalize">{userRole}</span>
              {userName ? (
                <span className="text-[var(--studio-ink-muted)]/80">
                  {" "}
                  · {userName}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mb-1 px-1">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[var(--studio-ink-muted)]">
            Admin portal
          </p>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Admin portal">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={navLinkClass(active)}>
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-[var(--studio-border)] pt-4">
          <p className="mb-2 px-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[var(--studio-ink-muted)]">
            Studio
          </p>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-[var(--studio-ink-muted)] transition-colors hover:bg-[var(--studio-surface-muted)] hover:text-[var(--studio-ink)]"
          >
            Overview
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
          <Link
            href="/dashboard/admin/session"
            className={cn(
              "mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
              pathname.startsWith("/dashboard/admin/session")
                ? "bg-[var(--studio-mauve-dim)]/50 font-medium text-[var(--studio-ink)]"
                : "text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)] hover:text-[var(--studio-ink)]"
            )}
          >
            <Building2 className="h-4 w-4 opacity-80" />
            Session tools
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1 rounded-2xl border border-[var(--studio-border)] border-l-0 bg-[var(--studio-surface)]/80 p-6 shadow-sm lg:rounded-l-none lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}
