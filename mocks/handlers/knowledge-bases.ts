import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";
import { mockKnowledgeBases } from "@/mocks/data/knowledge-bases";
import type { KnowledgeBase } from "@/lib/types/api";

let knowledgeBases = [...mockKnowledgeBases];

export const knowledgeBaseHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/knowledge-bases`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const search = (url.searchParams.get("search") || "").toLowerCase();
    let filtered = knowledgeBases;
    if (search) {
      filtered = knowledgeBases.filter(
        (k) =>
          k.name.toLowerCase().includes(search) ||
          (k.description ?? "").toLowerCase().includes(search)
      );
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

  http.post(`${MSW_STUDIO_PREFIX}/knowledge-bases`, async ({ request }) => {
    const form = await request.formData();
    const name = String(form.get("name") || "Knowledge base");
    const description = String(form.get("description") || "");
    const row: KnowledgeBase = {
      id: String(Date.now()),
      uuid: Math.random().toString(36).slice(2, 18),
      name,
      description,
      status: "ACTIVE",
      totalDocuments: 0,
      totalSize: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "demo@example.com",
    };
    knowledgeBases.unshift(row);
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: row,
    });
  }),

  http.delete(`${MSW_STUDIO_PREFIX}/knowledge-bases/:id`, ({ params }) => {
    const id = String(params.id);
    knowledgeBases = knowledgeBases.filter((k) => k.id !== id);
    return HttpResponse.json({ code: 0, message: "success" });
  }),
];
