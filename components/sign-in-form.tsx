import { signInWithCredentials } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  return (
    <form
      action={signInWithCredentials}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--studio-ink)]">
        Username
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          className="rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 py-2 text-base text-[var(--studio-ink)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--studio-ink)]">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 py-2 text-base text-[var(--studio-ink)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--studio-teal)]"
        />
      </label>
      <Button
        type="submit"
        size="lg"
        className="mt-1 h-11 w-full rounded-xl bg-[var(--studio-teal)] text-[var(--studio-surface)] hover:bg-[var(--studio-teal)]/90"
      >
        Sign in
      </Button>
    </form>
  );
}
