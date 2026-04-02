import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/sign-in-form";
import { ThemeSwitchPanel } from "@/components/theme-switch-panel";
import { auth } from "@/auth";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeSwitchPanel />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-8 shadow-lg">
        <h1 className="font-heading mb-1 text-2xl font-semibold tracking-tight text-[var(--studio-ink)]">
          Sign in
        </h1>
        <p className="mb-6 text-sm text-[var(--studio-ink-muted)]">
          Enter your username and password to open your workspace.
        </p>
        {error === "credentials" ? (
          <p
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            Invalid username or password.
          </p>
        ) : null}
        <SignInForm />
        <p className="mt-6 text-center text-xs text-[var(--studio-ink-muted)]">
          <Link
            href="/"
            className="font-medium text-[var(--studio-ink)] underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
