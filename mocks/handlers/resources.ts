import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";
import { mockIntegrationResources } from "@/mocks/data/integration-resources";
import type { StudioResource } from "@/lib/types/api";

let resources = [...mockIntegrationResources];

export const resourceHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/resources`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    const source = url.searchParams.get("source") || "user_upload";

    let filtered = resources.filter((r) => (r.source ?? "user_upload") === source);
    if (keyword) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(keyword)
      );
    }
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);
    return HttpResponse.json({
      code: 0,
      success: true,
      data: { total: filtered.length, list },
    });
  }),

  http.post(`${MSW_STUDIO_PREFIX}/resources`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const row: StudioResource = {
      id: Date.now(),
      uuid: Math.random().toString(36).slice(2, 18),
      name: (body.name as string) || "Credential",
      type_key: body.type_key as string,
      type: body.type_key as string,
      vendor: body.vendor as string,
      source: "user_upload",
      resource_data: (body.resource_data as Record<string, unknown>) ?? {},
      status: 1,
      creator: "demo@example.com",
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
    };
    resources.unshift(row);
    return HttpResponse.json({
      code: 0,
      success: true,
      data: row,
    });
  }),

  http.delete(`${MSW_STUDIO_PREFIX}/resources/:id`, ({ params }) => {
    const id = Number(params.id);
    resources = resources.filter((r) => r.id !== id);
    return HttpResponse.json({ code: 0, success: true });
  }),
];
