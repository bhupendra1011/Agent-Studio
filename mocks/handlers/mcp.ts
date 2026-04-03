import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";
import { mockMcps } from "@/mocks/data/mcps";
import type { McpServer } from "@/lib/types/api";

let mcps = [...mockMcps];

export const mcpHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/mcps`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const search = (url.searchParams.get("search") || "").toLowerCase();
    let filtered = mcps;
    if (search) {
      filtered = mcps.filter((m) => m.name.toLowerCase().includes(search));
    }
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        list,
        total: filtered.length,
        page,
        page_size: pageSize,
      },
    });
  }),

  http.post(`${MSW_STUDIO_PREFIX}/mcp`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      config: McpServer["config"];
    };
    const row: McpServer = {
      id: String(Date.now()),
      uuid: Math.random().toString(36).slice(2, 18),
      name: body.name || "MCP server",
      description: body.description,
      status: "available",
      config: {
        endpoint: body.config.endpoint,
        transport: body.config.transport,
        timeout_ms: body.config.timeout_ms,
        headers: body.config.headers,
        queries: body.config.queries,
      },
      creator: "demo@example.com",
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      last_detected_time: null,
    };
    mcps.unshift(row);
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: row,
    });
  }),

  http.delete(`${MSW_STUDIO_PREFIX}/mcp/:uuid`, ({ params }) => {
    const uuid = String(params.uuid);
    mcps = mcps.filter((m) => m.uuid !== uuid);
    return HttpResponse.json({ code: 0, message: "success" });
  }),
];
