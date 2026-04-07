"use client";

import { Button } from "@/components/ui/button";
import { getOnboardingStatus } from "@/lib/setup-onboarding";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Top-bar entry to open / resume the setup wizard. Always available after skip/complete.
 */
export function SetupWizardShortcut() {
  const pathname = usePathname();
  const [needsAttention, setNeedsAttention] = useState(false);

  useEffect(() => {
    setNeedsAttention(getOnboardingStatus() === null);
  }, [pathname]);

  if (pathname?.startsWith("/dashboard/setup")) {
    return null;
  }

  return (
    <Button
      nativeButton={false}
      variant={needsAttention ? "default" : "outline"}
      size="sm"
      className={cn(
        "shrink-0 gap-1.5 rounded-full",
        needsAttention
          ? "bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
          : "border-[var(--studio-border)] text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
      )}
      render={<Link href="/dashboard/setup" />}
      title="Open setup wizard (credentials, agent, phone)"
    >
      <Rocket className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Setup</span>
    </Button>
  );
}
