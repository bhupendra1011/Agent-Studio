import { agentPipelineHandlers } from "./agent-pipeline";
import { authHandlers } from "./auth";
import { campaignHandlers } from "./campaign";
import { projectHandlers } from "./project";
import { knowledgeBaseHandlers } from "./knowledge-bases";
import { mcpHandlers } from "./mcp";
import { metadataHandlers } from "./metadata";
import { resourceHandlers } from "./resources";
import { sipNumberHandlers } from "./sip-number";
import { templateHandlers } from "./templates";

export const handlers = [
  ...authHandlers,
  ...agentPipelineHandlers,
  ...resourceHandlers,
  ...knowledgeBaseHandlers,
  ...mcpHandlers,
  ...sipNumberHandlers,
  ...templateHandlers,
  ...projectHandlers,
  ...campaignHandlers,
  ...metadataHandlers,
];
