import { redirect } from "next/navigation";

export default function AdminPortalIndexPage() {
  redirect("/dashboard/admin/users");
}
