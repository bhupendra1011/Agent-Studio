import type { McpServer } from "@/lib/types/api";

export let mockMcps: McpServer[] = [
  {
    id: "2",
    uuid: "0bbc0ddf3e1d4058bd46baebb06412ad",
    name: "Context7 docs",
    description: "Documentation lookup",
    status: "available",
    icon_url: "",
    config: {
      endpoint: "https://mcp.context7.com/mcp",
      transport: "SHTTP",
      timeout_ms: 10000,
      headers: { CONTEXT7_API_KEY: "••••" },
    },
    creator: "demo@example.com",
    createTime: "2025-11-28T07:26:23.000Z",
    updateTime: "2025-11-28T07:26:24.000Z",
    last_detected_time: null,
  },
];
