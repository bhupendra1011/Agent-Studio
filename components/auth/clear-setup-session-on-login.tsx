"use client";

import { clearSetupWizardSessionDismissal } from "@/lib/setup-onboarding";
import { useEffect } from "react";

/** Ensures the post-login dashboard → setup prompt runs again after a new sign-in. */
export function ClearSetupSessionOnLogin() {
  useEffect(() => {
    clearSetupWizardSessionDismissal();
  }, []);
  return null;
}
