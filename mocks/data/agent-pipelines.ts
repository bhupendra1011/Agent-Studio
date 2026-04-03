import type { AgentPipeline } from "@/lib/types/api";

const makeGraphData = (overrides: Record<string, unknown> = {}) => ({
  asr: {
    vendor: "microsoft",
    params: { key: "", language: "en-US", region: "eastus" },
  },
  llm: {
    vendor: "openai",
    url: "https://api.openai.com/v1",
    api_key: "",
    params: { model: "gpt-4o" },
    max_history: 10,
    greeting_message: "Hello! How can I help you today?",
    failure_message: "I'm sorry, I encountered an issue. Please try again.",
    system_messages: [
      { role: "system", content: "You are a helpful AI assistant." },
    ],
    ...overrides,
  },
  tts: {
    vendor: "microsoft",
    params: { key: "", language: "en-US", region: "eastus" },
  },
  idle_timeout: 120,
  advanced_features: {
    enable_rtm: true,
    enable_sal: false,
    enable_tools: false,
  },
});

export const mockAgentPipelines: AgentPipeline[] = [
  {
    id: "101",
    name: "Customer Support Voice Agent",
    type: "voice",
    description:
      "A voice-based customer support agent that handles common inquiries",
    icon_url: "",
    creator: "demo@example.com",
    deploy_status: 1,
    graph_data: makeGraphData({
      greeting_message: "Welcome to customer support! How can I assist you?",
      system_messages: [
        {
          role: "system",
          content:
            "You are a customer support agent. Be helpful, polite, and concise.",
        },
      ],
    }),
    create_time: "2025-08-01T10:00:00Z",
    update_time: "2025-09-15T14:30:00Z",
    last_deployed_time: "2025-09-15T14:30:00Z",
    vid: 1001,
    project_name: "Voice Agent Demo",
    project_id: "proj_voice_001",
    app_id: "abcdef1234567890abcdef1234567890",
    current_pipeline_version: "v3",
    deploy_version_id: "deploy_v3_001",
    deploy_app_ids: ["abcdef1234567890abcdef1234567890"],
    deployments: [
      {
        id: "agent_run_001",
        appId: "abcdef1234567890abcdef1234567890",
        appName: "Voice Agent Demo",
        project_id: "proj_voice_001",
        uuid: "uuid-dep-101",
        vid: 1001,
        status: 1,
      },
    ],
  },
  {
    id: "102",
    name: "Sales Outreach Bot",
    type: "voice",
    description: "Automated sales outreach agent for lead qualification",
    icon_url: "",
    creator: "demo@example.com",
    deploy_status: 1,
    graph_data: makeGraphData({
      greeting_message:
        "Hi there! I'm calling from Acme Corp. Do you have a moment?",
      system_messages: [
        {
          role: "system",
          content:
            "You are a friendly sales agent. Qualify leads by asking about their needs and budget.",
        },
      ],
    }),
    create_time: "2025-07-15T08:00:00Z",
    update_time: "2025-09-10T11:00:00Z",
    last_deployed_time: "2025-09-10T11:00:00Z",
    vid: 1002,
    project_name: "Customer Support Bot",
    project_id: "proj_support_002",
    app_id: "fedcba0987654321fedcba0987654321",
    current_pipeline_version: "v2",
    deploy_version_id: "deploy_v2_002",
    deploy_app_ids: ["fedcba0987654321fedcba0987654321"],
  },
  {
    id: "103",
    name: "Chatbot Assistant",
    type: "chatbot",
    description: "A conversational chatbot for general inquiries",
    icon_url: "",
    creator: "demo@example.com",
    deploy_status: 0,
    graph_data: makeGraphData(),
    create_time: "2025-09-01T12:00:00Z",
    update_time: "2025-09-20T16:45:00Z",
    last_deployed_time: "",
    vid: 1001,
    project_name: "Voice Agent Demo",
    project_id: "proj_voice_001",
    app_id: "abcdef1234567890abcdef1234567890",
    current_pipeline_version: "v1",
    deploy_version_id: null,
    deploy_app_ids: [],
  },
  {
    id: "105",
    name: "Technical Support Agent",
    type: "voice",
    description: "Handles technical troubleshooting and product issues",
    icon_url: "",
    creator: "demo@example.com",
    deploy_status: 1,
    graph_data: makeGraphData({
      greeting_message:
        "Hi, you've reached technical support. What issue can I help you with?",
      system_messages: [
        {
          role: "system",
          content:
            "You are a technical support specialist. Diagnose issues step by step.",
        },
      ],
      max_history: 20,
    }),
    create_time: "2025-06-20T11:00:00Z",
    update_time: "2025-09-22T10:15:00Z",
    last_deployed_time: "2025-09-22T10:15:00Z",
    vid: 1001,
    project_name: "Voice Agent Demo",
    project_id: "proj_voice_001",
    app_id: "abcdef1234567890abcdef1234567890",
    current_pipeline_version: "v5",
    deploy_version_id: "deploy_v5_005",
    deploy_app_ids: ["abcdef1234567890abcdef1234567890"],
  },
];
