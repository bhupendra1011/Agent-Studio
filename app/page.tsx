import Image from "next/image";

import { Button } from "@/components/ui/button";
import { SignInForm } from "@/components/sign-in-form";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/auth-actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const session = await auth();
  const { error } = await searchParams;

  if (!session?.user) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your username and password.
          </p>
          {error === "credentials" ? (
            <p
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              Invalid username or password.
            </p>
          ) : null}
          <SignInForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="mb-8 flex w-full flex-wrap items-center justify-end gap-3 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            Signed in as{" "}
            <strong className="text-zinc-900 dark:text-zinc-100">
              {session.user.name}
            </strong>
          </span>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button
            nativeButton={false}
            variant="default"
            size="lg"
            className="h-12 w-full rounded-full px-5 md:w-[158px]"
            render={
              <a
                href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-full px-5 md:w-[158px]"
            render={
              <a
                href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Documentation
          </Button>
        </div>
      </main>
    </div>
  );
}
