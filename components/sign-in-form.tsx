import { signInWithCredentials } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  return (
    <form
      action={signInWithCredentials}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Username
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-zinc-600"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-zinc-600"
        />
      </label>
      <Button type="submit" size="lg" className="mt-1 h-11 w-full rounded-lg">
        Sign in
      </Button>
    </form>
  );
}
