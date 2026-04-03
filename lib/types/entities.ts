import type { Agent } from "./agent-ui";
import type { AgentPipeline } from "./api";

/**
 * Local UI representation of AgentPipeline (parity with convo LocalAgentPipeline, trimmed).
 */
export interface LocalAgentPipeline extends AgentPipeline {
  lastRun: string;
  statusColor?: string;
  type: "conversational" | "voice";
  agents: Agent[];
  config: {
    maxTokens: number;
    temperature: number;
    responseTime: string;
  };
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  author: string;
  userCount: number;
  createdByLogo: string;
  createdByMainImage: string;
  type: "voice" | "conversational";
  coreFeatures: string[];
  defaultConfig: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  agents: Agent[];
  graph_data?: import("./api").GraphData;
}
