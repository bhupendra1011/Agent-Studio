import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";
import { mockGlobalCallHistory } from "@/mocks/data/global-call-history";
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
  http.get(`${MSW_STUDIO_PREFIX}/sip-numbers/all/call-history/overview`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        total_calls: 48,
        total_answered: 32,
        total_duration_seconds: 18600,
        total_answer_rate: 0.67,
        total_calls_trend: [
          { date: "2026-04-01", value: 6 },
          { date: "2026-04-02", value: 8 },
          { date: "2026-04-03", value: 5 },
          { date: "2026-04-04", value: 9 },
          { date: "2026-04-05", value: 7 },
          { date: "2026-04-06", value: 7 },
          { date: "2026-04-07", value: 6 },
        ],
        total_answered_trend: [
          { date: "2026-04-01", value: 4 },
          { date: "2026-04-02", value: 6 },
          { date: "2026-04-03", value: 3 },
          { date: "2026-04-04", value: 7 },
          { date: "2026-04-05", value: 5 },
          { date: "2026-04-06", value: 5 },
          { date: "2026-04-07", value: 4 },
        ],
        total_duration_trend: [
          { date: "2026-04-01", value: 2400 },
          { date: "2026-04-02", value: 3100 },
          { date: "2026-04-03", value: 1800 },
          { date: "2026-04-04", value: 3600 },
          { date: "2026-04-05", value: 2900 },
          { date: "2026-04-06", value: 3000 },
          { date: "2026-04-07", value: 2700 },
        ],
        total_answer_rate_trend: [
          { date: "2026-04-01", value: 0.55 },
          { date: "2026-04-02", value: 0.62 },
          { date: "2026-04-03", value: 0.5 },
          { date: "2026-04-04", value: 0.7 },
          { date: "2026-04-05", value: 0.65 },
          { date: "2026-04-06", value: 0.68 },
          { date: "2026-04-07", value: 0.67 },
        ],
      },
      request_id: "mock_overview",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/sip-numbers/all/call-history/analysis`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        outbound_analysis: {
          avg_answered_duration: [
            { date: "2026-04-01", value: 95 },
            { date: "2026-04-02", value: 120 },
            { date: "2026-04-03", value: 88 },
          ],
          status_distribution: [
            { status: "human_answered", count: 20 },
            { status: "no_answer", count: 12 },
            { status: "voicemail", count: 8 },
            { status: "failed", count: 2 },
          ],
          transferred_rate_trend: [
            { date: "2026-04-01", value: 0.05 },
            { date: "2026-04-02", value: 0.08 },
            { date: "2026-04-03", value: 0.06 },
          ],
          call_success_evaluation_result_rate_trend: [
            { date: "2026-04-01", value: 0.72 },
            { date: "2026-04-02", value: 0.78 },
            { date: "2026-04-03", value: 0.75 },
          ],
        },
        inbound_analysis: {
          avg_answered_duration: [{ date: "2026-04-01", value: 200 }],
          status_distribution_v2: [
            { status: "ai_answered", count: 10 },
            { status: "ai_no_answer", count: 2 },
            { status: "transfered_success", count: 3 },
            { status: "transfered_failed", count: 1 },
          ],
        },
      },
      request_id: "mock_analysis",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/sip-numbers/all/call-history`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const keyword = (url.searchParams.get("search_keyword") || "").toLowerCase();
    let rows = [...mockGlobalCallHistory];
    if (keyword) {
      rows = rows.filter(
        (r) =>
          r.agent_name.toLowerCase().includes(keyword) ||
          r.campaign_name.toLowerCase().includes(keyword) ||
          r.from_number.includes(keyword) ||
          r.to_number.includes(keyword)
      );
    }
    const callType = url.searchParams.get("call_type");
    if (callType && callType !== "all") {
      rows = rows.filter((r) => r.call_type === callType);
    }
    const start = (page - 1) * pageSize;
    const list = rows.slice(start, start + pageSize);
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        page,
        page_size: pageSize,
        count: list.length,
        total: rows.length,
        list,
      },
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/sip-numbers/call-history/:callId`, ({ params }) => {
    const callId = params.callId as string;
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        call_id: callId,
        call_info: {
          agent_name: "Customer Support Voice Agent",
          agent_id: "agent-task-001",
          call_category_v2: "no_answer" as const,
          from_number: "+14155551234",
          to_number: "+1234567890",
          transcript: [],
          transferred_number: "",
          duration_seconds: 0,
          record_file_url: "",
          call_ts: Math.floor(Date.now() / 1000),
          hangup_reason: "no_answer",
          llm_call_evaluation_status: "completed" as const,
          llm_call_evaluation_result: {
            call_success_evaluation_result: false,
            raw_custom_evaluation_results: {
              call_outcome: false,
            },
          },
        },
        status: "completed",
        call_type: "outbound" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        raw_custom_evaluation_results: {
          call_outcome: false,
        },
      },
      request_id: "mock_call_detail",
      ts: Date.now(),
    });
  }),

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
