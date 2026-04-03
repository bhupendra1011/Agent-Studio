/** Minimal agent placeholder for LocalAgentPipeline.agents */
export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  instructions: string;
  tools: string[];
}
