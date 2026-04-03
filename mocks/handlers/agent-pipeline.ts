import { http, HttpResponse } from "msw";
import type { GraphData } from "@/lib/types/api";
import { mockAgentPipelines } from "@/mocks/data/agent-pipelines";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";

const defaultGraphData: GraphData = {
  asr: {
    vendor: "microsoft",
    params: { key: "", language: "en-US", region: "eastus" },
  },
  llm: {
    vendor: "openai",
    url: "https://api.openai.com/v1",
    params: { model: "gpt-4o" },
    max_history: 10,
  },
  tts: {
    vendor: "microsoft",
    params: { key: "", language: "en-US", region: "eastus" },
  },
  idle_timeout: 120,
};

let pipelines = [...mockAgentPipelines];

export const agentPipelineHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/agent-pipeline`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const keyword = url.searchParams.get("keyword") || "";

    let filtered = pipelines;
    if (keyword) {
      filtered = pipelines.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword.toLowerCase()) ||
          p.description.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      list,
      total: filtered.length,
      page,
      page_size: pageSize,
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/agent-pipeline/:id`, ({ params }) => {
    const pipeline = pipelines.find((p) => p.id === params.id);
    if (!pipeline) {
      return HttpResponse.json(
        { code: 1000, message: "Pipeline not found" },
        { status: 404 }
      );
    }
    return HttpResponse.json(pipeline);
  }),

  http.post(`${MSW_STUDIO_PREFIX}/agent-pipeline`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPipeline = {
      id: String(Date.now()),
      name: (body.name as string) || "New Agent",
      type: (body.type as string) || "voice",
      description: (body.description as string) || "",
      icon_url: "",
      creator: "demo@example.com",
      deploy_status: 0,
      graph_data:
        (body.graph_data as GraphData | undefined) ?? defaultGraphData,
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
      last_deployed_time: "",
      vid: (body.vid as number) || 1001,
      project_name: "Voice Agent Demo",
      project_id: "proj_voice_001",
      app_id: "abcdef1234567890abcdef1234567890",
      current_pipeline_version: "v1",
      deploy_version_id: null,
      deploy_app_ids: [],
    };
    pipelines.unshift(newPipeline as unknown as (typeof pipelines)[0]);
    return HttpResponse.json(newPipeline);
  }),

  http.put(`${MSW_STUDIO_PREFIX}/agent-pipeline/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const index = pipelines.findIndex((p) => p.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { code: 1000, message: "Pipeline not found" },
        { status: 404 }
      );
    }
    pipelines[index] = {
      ...pipelines[index],
      ...body,
      update_time: new Date().toISOString(),
    } as (typeof pipelines)[0];
    return HttpResponse.json(pipelines[index]);
  }),

  http.delete(`${MSW_STUDIO_PREFIX}/agent-pipeline/:id`, ({ params }) => {
    pipelines = pipelines.filter((p) => p.id !== params.id);
    return HttpResponse.json({ code: 0, message: "success" });
  }),

  http.put(
    `${MSW_STUDIO_PREFIX}/agent-deploy-pipeline/:project_id/:deploy_id/status`,
    () => {
      return HttpResponse.json({ code: 0, message: "success" });
    }
  ),
];
