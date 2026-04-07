export type OnboardingStatus = "complete" | "skipped";

const STORAGE_KEY = "studio_onboarding_v1";

/** Session-only: after skip or finish, overview `/dashboard` is allowed until logout or new browser session. */
const SESSION_SETUP_DISMISSED_KEY = "studio_setup_session_dismissed_v1";

interface Stored {
  status: OnboardingStatus;
  at?: number;
}

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Stored;
    if (p.status === "complete" || p.status === "skipped") return p;
    return null;
  } catch {
    return null;
  }
}

/** `null` = user has not finished or skipped onboarding yet (first-time in this browser). */
export function getOnboardingStatus(): OnboardingStatus | null {
  return readStored()?.status ?? null;
}

export function setOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ status: "complete" as const, at: Date.now() })
  );
}

export function setOnboardingSkipped(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ status: "skipped" as const, at: Date.now() })
  );
}

export function isSetupWizardDismissedThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_SETUP_DISMISSED_KEY) === "1";
}

export function setSetupWizardDismissedThisSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_SETUP_DISMISSED_KEY, "1");
}

/** Call on login page and on logout so the next `/dashboard` visit prompts setup again. */
export function clearSetupWizardSessionDismissal(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_SETUP_DISMISSED_KEY);
}
