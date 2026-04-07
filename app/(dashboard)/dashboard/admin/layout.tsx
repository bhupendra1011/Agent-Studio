import { AdminPortalLayout } from "@/components/admin/admin-portal-layout";
import { auth } from "@/auth";
import { isStudioAdminSession } from "@/lib/admin-config";
import { redirect } from "next/navigation";

export default async function AdminPortalSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !isStudioAdminSession(session)) {
    redirect("/dashboard");
  }

  return (
    <AdminPortalLayout
      userName={session.user.name ?? "Admin"}
      userRole={session.user.role}
    >
      {children}
    </AdminPortalLayout>
  );
}
