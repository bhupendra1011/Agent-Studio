import Link from "next/link";

import { signInWithCredentials } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignInFormProps = {
  credentialsError?: boolean;
};

export function SignInForm({ credentialsError }: SignInFormProps) {
  return (
    <Card className="w-full max-w-sm border-[var(--studio-border)] bg-[var(--studio-surface)] py-6 shadow-lg ring-[var(--studio-border)]">
      <CardHeader className="px-6">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight text-[var(--studio-ink)]">
          Sign in
        </CardTitle>
        <CardDescription className="text-[var(--studio-ink-muted)]">
          Enter your username and password to open your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        {credentialsError ? (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            Invalid username or password.
          </p>
        ) : null}
        <form
          action={signInWithCredentials}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="username"
              className="text-[var(--studio-ink)]"
            >
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="h-11 border-[var(--studio-border)] bg-[var(--studio-surface-muted)] text-[var(--studio-ink)] focus-visible:border-[var(--studio-teal)] focus-visible:ring-[var(--studio-teal)]/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="password"
              className="text-[var(--studio-ink)]"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11 border-[var(--studio-border)] bg-[var(--studio-surface-muted)] text-[var(--studio-ink)] focus-visible:border-[var(--studio-teal)] focus-visible:ring-[var(--studio-teal)]/40"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-1 h-11 w-full rounded-xl bg-[var(--studio-teal)] text-[var(--studio-surface)] hover:bg-[var(--studio-teal)]/90"
          >
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[var(--studio-border)] bg-transparent px-6 pt-4">
        <p className="text-center text-xs text-[var(--studio-ink-muted)]">
          <Link
            href="/"
            className="font-medium text-[var(--studio-ink)] underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
