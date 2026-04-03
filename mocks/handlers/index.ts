import { agentPipelineHandlers } from "./agent-pipeline";
import { authHandlers } from "./auth";
import { projectHandlers } from "./project";
import { templateHandlers } from "./templates";

export const handlers = [
  ...authHandlers,
  ...agentPipelineHandlers,
  ...templateHandlers,
  ...projectHandlers,
];
