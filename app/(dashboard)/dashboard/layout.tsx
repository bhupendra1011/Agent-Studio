import { redirect } from "next/navigation";

import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopBar } from "@/components/dashboard-top-bar";
import { SetupOnboardingRedirect } from "@/components/setup/setup-onboarding-redirect";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SetupOnboardingRedirect />
      <DashboardTopBar
        userName={session?.user?.name ?? "Authenticated"}
        userImage={session?.user?.image ?? null}
      />
      <ImpersonationBanner />
      <div className="flex min-h-0 flex-1">
        <DashboardSidebar isAdmin={session.user.role === "admin"} />
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 overflow-auto bg-[var(--studio-surface-muted)]/40 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
