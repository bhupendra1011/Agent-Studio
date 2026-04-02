import { MarketingHeader } from "@/components/marketing-header";
import { auth } from "@/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader user={session?.user ?? undefined} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
