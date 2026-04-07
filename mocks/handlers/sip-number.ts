import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";
import { mockSipNumbersSeed } from "@/mocks/data/sip-numbers";
import type {
  CreateSipNumberRequest,
  SipNumber,
  SipNumberEditStatusItem,
  UpdateSipNumberRequest,
} from "@/lib/types/api";

let sipStore: SipNumber[] = mockSipNumbersSeed.map((r) => ({ ...r }));

function bodyCreateToRow(body: CreateSipNumberRequest): SipNumber {
  const now = new Date().toISOString();
  const id = `sip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    cid: "cid_mock",
    phone_number: body.number,
    vendor: body.source,
    created_from: "manual",
    source: body.source,
    type: "outbound",
    description: body.description ?? "",
    config: body.config,
    status: 0,
    is_deleted: 0,
    creator: "mock@example.com",
    create_time: now,
    update_time: now,
  };
}

export const sipNumberHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/sip-numbers`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    let filtered = sipStore;
    if (keyword) {
      filtered = sipStore.filter(
        (s) =>
          s.phone_number.toLowerCase().includes(keyword) ||
          (s.description || "").toLowerCase().includes(keyword) ||
          (s.config?.outbound_configs?.address || "")
            .toLowerCase()
            .includes(keyword)
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

  http.get(`${MSW_STUDIO_PREFIX}/sip-numbers/all/edit-status`, ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.getAll("phone_number_ids");
    const data: SipNumberEditStatusItem[] = ids.map((id) => {
      const row = sipStore.find((s) => s.id === id);
      const locked = row?.id === "sip_mock_001";
      return { id, editable: !locked };
    });
    if (ids.length === 0) {
      return HttpResponse.json({
        code: 0,
        message: "success",
        data: sipStore.map((s) => ({ id: s.id, editable: s.id !== "sip_mock_001" })),
      });
    }
    return HttpResponse.json({ code: 0, message: "success", data });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/sip-numbers/:id`, ({ params }) => {
    const sip = sipStore.find((s) => s.id === params.id);
    if (!sip) {
      return HttpResponse.json(
        { code: 404, message: "not found", data: null },
        { status: 404 }
      );
    }
    return HttpResponse.json({ code: 0, message: "success", data: sip });
  }),

  http.post(`${MSW_STUDIO_PREFIX}/sip-numbers`, async ({ request }) => {
    const body = (await request.json()) as CreateSipNumberRequest;
    const row = bodyCreateToRow(body);
    sipStore = [...sipStore, row];
    return HttpResponse.json({ code: 0, message: "success", data: row });
  }),

  http.put(`${MSW_STUDIO_PREFIX}/sip-numbers/:id`, async ({ params, request }) => {
    const id = params.id as string;
    const body = (await request.json()) as UpdateSipNumberRequest;
    const idx = sipStore.findIndex((s) => s.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: 404, message: "not found" },
        { status: 404 }
      );
    }
    const prev = sipStore[idx]!;
    const next: SipNumber = {
      ...prev,
      ...(body.description !== undefined && { description: body.description }),
      ...(body.config && { config: body.config }),
      update_time: new Date().toISOString(),
    };
    sipStore = sipStore.map((s) => (s.id === id ? next : s));
    return HttpResponse.json({ code: 0, message: "success", data: next });
  }),

  http.delete(`${MSW_STUDIO_PREFIX}/sip-numbers/:id`, ({ params }) => {
    const id = params.id as string;
    sipStore = sipStore.filter((s) => s.id !== id);
    return HttpResponse.json({ code: 0, message: "success" });
  }),
];
