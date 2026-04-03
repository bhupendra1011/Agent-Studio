import type { StudioResource } from "@/lib/types/api";

export let mockIntegrationResources: StudioResource[] = [
  {
    id: 1,
    uuid: "a7bd73da10ee4ee699b49566dfacb60f",
    name: "OpenAI production",
    type_key: "llm",
    type: "llm",
    source: "user_upload",
    vendor: "openai",
    resource_data: { api_key: "••••", base_url: "https://api.openai.com/v1" },
    status: 1,
    creator: "demo@example.com",
    create_time: "2025-08-12T10:42:59.000Z",
    update_time: "2025-09-03T09:59:32.000Z",
  },
  {
    id: 2,
    uuid: "b8ce84eb21ff5ff7aa50677eg0bd71g",
    name: "Azure speech",
    type_key: "asr",
    type: "asr",
    source: "user_upload",
    vendor: "microsoft",
    resource_data: { key: "••••", region: "eastus", language: "en-US" },
    status: 1,
    creator: "demo@example.com",
    create_time: "2025-09-01T08:00:00.000Z",
    update_time: "2025-09-02T08:00:00.000Z",
  },
];
