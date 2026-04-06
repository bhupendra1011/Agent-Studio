import { AgentEditorShell } from "@/components/agents/editor/agent-editor-shell";

interface PageProps {
  params: Promise<{ pipelineId: string }>;
}

export default async function AgentEditPage({ params }: PageProps) {
  const { pipelineId } = await params;
  return <AgentEditorShell pipelineId={pipelineId} />;
}
