"use client";

import { signOutAction } from "@/lib/auth-actions";
import { clearSetupWizardSessionDismissal } from "@/lib/setup-onboarding";
import { Button } from "@/components/ui/button";

type Props = {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "xs" | "lg";
  className?: string;
  label?: string;
};

export function SignOutButton({
  variant = "outline",
  size = "sm",
  className,
  label = "Logout",
}: Props) {
  return (
    <form
      action={signOutAction}
      onSubmit={() => {
        clearSetupWizardSessionDismissal();
      }}
    >
      <Button type="submit" variant={variant} size={size} className={className}>
        {label}
      </Button>
    </form>
  );
}
