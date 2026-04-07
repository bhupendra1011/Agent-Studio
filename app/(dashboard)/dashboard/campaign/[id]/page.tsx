import { CampaignDetailPageClient } from "@/components/campaign/campaign-detail-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CampaignDetailPageClient campaignId={id} />;
}
