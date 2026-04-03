import { agentPipelineHandlers } from "./agent-pipeline";
import { authHandlers } from "./auth";
import { projectHandlers } from "./project";
import { knowledgeBaseHandlers } from "./knowledge-bases";
import { mcpHandlers } from "./mcp";
import { resourceHandlers } from "./resources";
import { templateHandlers } from "./templates";

export const handlers = [
  ...authHandlers,
  ...agentPipelineHandlers,
  ...resourceHandlers,
  ...knowledgeBaseHandlers,
  ...mcpHandlers,
  ...templateHandlers,
  ...projectHandlers,
];
