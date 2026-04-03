import { http, HttpResponse } from "msw";
import { mockTemplates } from "@/mocks/data/templates";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";

export const templateHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/agent-templates`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const keyword = url.searchParams.get("keyword") || "";

    let filtered = mockTemplates;
    if (keyword) {
      filtered = mockTemplates.filter((t) =>
        t.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      list,
      total: filtered.length,
    });
  }),
];
