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
      <SignInForm credentialsError={error === "credentials"} />
    </div>
  );
}
