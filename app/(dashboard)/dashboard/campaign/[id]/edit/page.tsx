import { CampaignCreatePageClient } from "@/components/campaign/campaign-create-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignEditPage({ params }: PageProps) {
  const { id } = await params;
  return <CampaignCreatePageClient campaignId={id} />;
}
