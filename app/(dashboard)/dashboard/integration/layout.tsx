import { IntegrationShell } from "@/components/integration/integration-shell";

export default function IntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IntegrationShell>{children}</IntegrationShell>;
}
