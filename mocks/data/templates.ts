export const mockTemplates = [
  {
    id: "tpl_001",
    name: "Customer Service Voice Agent",
    type: "convoai",
    description:
      "A pre-built voice agent template optimized for customer service workflows.",
    icon_url: "",
    creator: "Platform",
    creator_avatar_url: "",
    last_published_time: "2025-08-15T10:00:00Z",
    graph_data: {
      asr: {
        vendor: "microsoft",
        params: { key: "", language: "en-US", region: "eastus" },
      },
      llm: {
        vendor: "openai",
        url: "https://api.openai.com/v1",
        params: { model: "gpt-4o" },
        max_history: 10,
        greeting_message: "Welcome! How can I help you today?",
        system_messages: [
          { role: "system", content: "You are a helpful customer service agent." },
        ],
      },
      tts: {
        vendor: "microsoft",
        params: { key: "", language: "en-US", region: "eastus" },
      },
      idle_timeout: 120,
    },
    create_time: "2025-06-01T00:00:00Z",
  },
  {
    id: "tpl_002",
    name: "Sales Outreach Agent",
    type: "convoai",
    description: "Voice agent template for outbound sales calls.",
    icon_url: "",
    creator: "Platform",
    creator_avatar_url: "",
    last_published_time: "2025-09-01T10:00:00Z",
    graph_data: {
      asr: {
        vendor: "microsoft",
        params: { key: "", language: "en-US", region: "eastus" },
      },
      llm: {
        vendor: "openai",
        url: "https://api.openai.com/v1",
        params: { model: "gpt-4o" },
        max_history: 15,
        greeting_message: "Hi! I'm reaching out from Acme Corp.",
        system_messages: [
          { role: "system", content: "You are a professional sales agent." },
        ],
      },
      tts: {
        vendor: "elevenlabs",
        params: { key: "", language: "en-US", region: "" },
      },
      idle_timeout: 180,
    },
    create_time: "2025-07-01T00:00:00Z",
  },
  {
    id: "tpl_003",
    name: "Technical Support Bot",
    type: "convoai",
    description: "Technical support template with troubleshooting flows.",
    icon_url: "",
    creator: "Platform",
    creator_avatar_url: "",
    last_published_time: "2025-09-10T10:00:00Z",
    graph_data: {
      asr: {
        vendor: "microsoft",
        params: { key: "", language: "en-US", region: "eastus" },
      },
      llm: {
        vendor: "openai",
        url: "https://api.openai.com/v1",
        params: { model: "gpt-4o" },
        max_history: 20,
        greeting_message: "Hello! I'm here to help with technical issues.",
        system_messages: [
          { role: "system", content: "You are a technical support specialist." },
        ],
      },
      tts: {
        vendor: "microsoft",
        params: { key: "", language: "en-US", region: "eastus" },
      },
      idle_timeout: 120,
    },
    create_time: "2025-08-01T00:00:00Z",
  },
];
