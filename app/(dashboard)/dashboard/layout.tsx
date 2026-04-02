import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopBar } from "@/components/dashboard-top-bar";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col bg-background">
      <DashboardTopBar userName={session?.user?.name ?? "Authenticated"} />
      <div className="flex min-h-0 flex-1">
        <DashboardSidebar />
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 overflow-auto bg-[var(--studio-surface-muted)]/40 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
