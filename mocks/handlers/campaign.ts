import { http, HttpResponse } from "msw";
import { MSW_STUDIO_PREFIX } from "@/mocks/constants";
import {
  MOCK_CAMPAIGN_DEMO_ID,
  mockCampaignCallHistory,
  mockCampaigns,
  mockCampaignSummary,
} from "@/mocks/data/campaigns";

function detailFromList(campaignId: string) {
  const campaign = mockCampaigns.find((c) => c.campaign_id === campaignId);
  if (!campaign) return null;
  return {
    cid: 1,
    campaign_id: campaign.campaign_id,
    campaign_name: campaign.campaign_name,
    phone_number_id: "sip_mock_001",
    phone_number: campaign.phone_number || "+14155551234",
    agent_uuid: campaign.agent_uuid,
    recipients_phone_number_count: campaign.recipients_phone_number_count ?? 0,
    recipients_file_url: "https://example.com/recipients.csv",
    call_interval_ms: 1500,
    scheduled_start_time_input: campaign.scheduled_start_time,
    is_send_immediately: campaign.status === "running",
    timezone: "Asia/Kolkata",
    scheduled_start_time: campaign.scheduled_start_time,
    hangup_configuration: {
      max_duration_seconds: 300,
      max_silence_duration_seconds: 120,
      max_ring_duration_seconds: 30,
    },
    switch_configuration: {
      enable_transcript: true,
      enable_recording: true,
      enable_voicemail: true,
      enable_user_auto_hangup: true,
      enable_max_silence_duration_hangup: true,
      enable_llm_call_evaluation: false,
    },
    scheduled_time_ranges_config: [
      { weekday: 1, time_ranges: [{ start: "08:00", end: "20:00" }] },
      { weekday: 2, time_ranges: [{ start: "08:00", end: "20:00" }] },
      { weekday: 3, time_ranges: [{ start: "08:00", end: "20:00" }] },
      { weekday: 4, time_ranges: [{ start: "08:00", end: "20:00" }] },
      { weekday: 5, time_ranges: [{ start: "08:00", end: "20:00" }] },
    ],
    sip_transfer: {
      enable_sip_transfer: false,
      format_e164: true,
      static_target: { phone_number: "", transfer_description: "" },
    },
    status: campaign.status,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at,
  };
}

export const campaignHandlers = [
  http.get(`${MSW_STUDIO_PREFIX}/campaigns`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    const kw = (url.searchParams.get("search_keyword") || "").toLowerCase();
    let list = mockCampaigns;
    if (kw) {
      list = list.filter(
        (c) =>
          c.campaign_name.toLowerCase().includes(kw) ||
          (c.phone_number || "").includes(kw) ||
          c.agent_name.toLowerCase().includes(kw)
      );
    }
    const status = url.searchParams.get("status");
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    const start = (page - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        page,
        page_size: pageSize,
        count: slice.length,
        total: list.length,
        list: slice,
      },
      request_id: "mock_camp_list",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/campaigns/template/export`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: "phone_number,name\n+14155551234,Demo User\n",
      request_id: "mock_tpl",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId/summary`, ({ params }) => {
    if (params.campaignId === MOCK_CAMPAIGN_DEMO_ID) {
      return HttpResponse.json({
        code: 0,
        message: "success",
        data: mockCampaignSummary,
        request_id: "mock_sum",
        ts: Date.now(),
      });
    }
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: { ...mockCampaignSummary, total_calls: 0, no_answer_calls: 0 },
      request_id: "mock_sum",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId/call-history`, ({ request, params }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("page_size") || 10);
    let rows =
      params.campaignId === MOCK_CAMPAIGN_DEMO_ID ? [...mockCampaignCallHistory] : [];
    const cat = url.searchParams.get("call_category");
    if (cat && cat !== "all") {
      rows = rows.filter((r) => r.call_category_v2 === cat || r.call_category === cat);
    }
    const sk = url.searchParams.get("search_keyword");
    if (sk) {
      const q = sk.toLowerCase();
      rows = rows.filter(
        (r) => r.to_number.includes(q) || r.from_number.includes(q) || r.call_id.includes(q)
      );
    }
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        page,
        page_size: pageSize,
        count: rows.length,
        total: rows.length,
        list: rows,
      },
      status: "ok",
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId/summary/export`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: "metric,value\ntotal_calls,1\n",
      request_id: "mock_se",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId/call-history/export`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: "call_id,from,to\nmock,+1415,+1234\n",
      request_id: "mock_che",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId/redial/export`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: "phone_number\n+1234567890\n",
      request_id: "mock_redial",
      ts: Date.now(),
    });
  }),

  http.get(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId`, ({ params }) => {
    const id = params.campaignId as string;
    let data = detailFromList(id);
    if (!data) {
      const base = mockCampaigns[0];
      data = detailFromList(base.campaign_id);
      if (data) {
        data = { ...data, campaign_id: id, campaign_name: `Campaign ${id.slice(0, 8)}…` };
      }
    }
    return HttpResponse.json({
      code: 0,
      message: "success",
      data,
      request_id: "mock_det",
      ts: Date.now(),
    });
  }),

  http.post(`${MSW_STUDIO_PREFIX}/campaigns/recipients/upload`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: { file_url: "https://example.com/uploaded-recipients.csv" },
      request_id: "mock_up",
      ts: Date.now(),
    });
  }),

  http.post(`${MSW_STUDIO_PREFIX}/campaigns`, async ({ request }) => {
    const body = (await request.json()) as { campaign_name?: string };
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        campaign_id: `camp_${Date.now()}`,
        campaign_name: body.campaign_name || "New campaign",
      },
      request_id: "mock_cr",
      ts: Date.now(),
    });
  }),

  http.put(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId`, async ({ request }) => {
    const body = (await request.json()) as { campaign_name?: string };
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        campaign_id: "camp_updated",
        campaign_name: body.campaign_name || "Updated",
      },
      request_id: "mock_upd",
      ts: Date.now(),
    });
  }),

  http.delete(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: null,
      request_id: "mock_del",
      ts: Date.now(),
    });
  }),

  http.post(`${MSW_STUDIO_PREFIX}/campaigns/:campaignId/interrupt`, () => {
    return HttpResponse.json({
      code: 0,
      message: "success",
      data: null,
      request_id: "mock_int",
      ts: Date.now(),
    });
  }),
];
