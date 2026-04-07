"use client";

import { isSetupWizardDismissedThisSession } from "@/lib/setup-onboarding";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PROMPT_ON_DASHBOARD =
  process.env.NEXT_PUBLIC_SETUP_WIZARD_PROMPT_ON_DASHBOARD !== "false";

function isDashboardOverviewPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/dashboard") return true;
  return pathname === "/dashboard/";
}

/**
 * After sign-in, opening the overview dashboard prompts the setup wizard until the user
 * skips or finishes for this browser session (see session helpers in setup-onboarding).
 */
export function SetupOnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!PROMPT_ON_DASHBOARD) return;
    if (!isDashboardOverviewPath(pathname)) return;
    if (isSetupWizardDismissedThisSession()) return;
    router.replace("/dashboard/setup");
  }, [pathname, router]);

  return null;
}
