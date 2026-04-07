import { redirect } from "next/navigation";

/** Canonical create URL per PRD — same flow as `/dashboard/campaign/create`. */
export default function CampaignNewPage() {
  redirect("/dashboard/campaign/create");
}
