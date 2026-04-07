import { axiosStudio } from "@/lib/api/clients";
import type {
  CallAnalyticsParams,
  CallAnalysisResponse,
  CallOverviewResponse,
} from "@/lib/types/analytics-api";
import type {
  CallDetailByCallId,
  CallHistoryItem,
  CallHistoryParams,
  CallHistoryResponse,
  CreateSipNumberRequest,
  SipNumber,
  SipNumberEditStatusItem,
  SipNumberListParams,
  SipNumberListPayload,
  UpdateSipNumberRequest,
} from "@/lib/types/api";
import { getDefaultCallHistoryTimeRange } from "@/lib/utils/timestamp";
import { unwrapStudioData } from "@/lib/utils/studio-response";

function normalizeList(raw: unknown): SipNumberListPayload {
  const data = unwrapStudioData<SipNumberListPayload | undefined>(raw);
  if (data && Array.isArray(data.list)) {
    return {
      list: data.list,
      total: data.total ?? 0,
      page: data.page,
      page_size: data.page_size,
    };
  }
  const flat = raw as SipNumberListPayload | undefined;
  if (flat && Array.isArray(flat.list)) {
    return flat;
  }
  return { list: [], total: 0 };
}

export async function fetchSipNumberList(
  params: SipNumberListParams = {}
): Promise<SipNumberListPayload & { page: number; page_size: number }> {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const page_size = params.page_size ?? 10;
  searchParams.set("page", String(page));
  searchParams.set("page_size", String(page_size));
  if (params.keyword) searchParams.set("keyword", params.keyword);

  const res = await axiosStudio.get(`/sip-numbers?${searchParams.toString()}`);
  const payload = normalizeList(res.data);
  return {
    ...payload,
    page: payload.page ?? page,
    page_size: payload.page_size ?? page_size,
  };
}

export async function getSipNumber(id: string): Promise<SipNumber> {
  const res = await axiosStudio.get(`/sip-numbers/${id}`);
  return unwrapStudioData<SipNumber>(res.data);
}

export async function createSipNumber(
  body: CreateSipNumberRequest
): Promise<SipNumber> {
  const res = await axiosStudio.post("/sip-numbers", body);
  return unwrapStudioData<SipNumber>(res.data);
}

export async function updateSipNumber(
  id: string,
  body: UpdateSipNumberRequest
): Promise<SipNumber> {
  const res = await axiosStudio.put(`/sip-numbers/${id}`, body);
  return unwrapStudioData<SipNumber>(res.data);
}

export async function deleteSipNumber(id: string): Promise<void> {
  await axiosStudio.delete(`/sip-numbers/${id}`);
}

export async function getCallDetailByCallId(callId: string): Promise<CallDetailByCallId> {
  const res = await axiosStudio.get(
    `/sip-numbers/call-history/${encodeURIComponent(callId)}`
  );
  return unwrapStudioData<CallDetailByCallId>(res.data);
}

function buildAnalyticsSearchParams(params: CallAnalyticsParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.from_time !== undefined) {
    searchParams.append("from_time", params.from_time.toString());
  }
  if (params.to_time !== undefined) {
    searchParams.append("to_time", params.to_time.toString());
  }
  if (params.campaign_ids) {
    searchParams.append("campaign_ids", params.campaign_ids);
  }
  if (params.agent_uuids) {
    searchParams.append("agent_uuids", params.agent_uuids);
  }
  searchParams.append("call_type", params.call_type);
  searchParams.append("time_granularity", params.time_granularity);
  if (params.timezone) {
    searchParams.append("timezone", params.timezone);
  }
  return searchParams;
}

export async function getCallHistoryOverview(
  params: CallAnalyticsParams
): Promise<CallOverviewResponse> {
  const qs = buildAnalyticsSearchParams(params).toString();
  const url = `/sip-numbers/all/call-history/overview${qs ? `?${qs}` : ""}`;
  const res = await axiosStudio.get<CallOverviewResponse>(url);
  return res.data;
}

export async function getCallHistoryAnalysis(
  params: CallAnalyticsParams
): Promise<CallAnalysisResponse> {
  const qs = buildAnalyticsSearchParams(params).toString();
  const url = `/sip-numbers/all/call-history/analysis${qs ? `?${qs}` : ""}`;
  const res = await axiosStudio.get<CallAnalysisResponse>(url);
  return res.data;
}

export async function getGlobalCallHistory(
  params: CallHistoryParams = {}
): Promise<CallHistoryResponse> {
  const searchParams = new URLSearchParams();
  if (params.call_type) {
    searchParams.append("call_type", params.call_type);
  }
  const defaultRange = getDefaultCallHistoryTimeRange();
  const fromTime = params.from_time ?? defaultRange.fromTime;
  const toTime = params.to_time ?? defaultRange.toTime;
  searchParams.append("from_time", String(fromTime));
  searchParams.append("to_time", String(toTime));
  if (params.search_keyword) searchParams.append("search_keyword", params.search_keyword);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.page_size) searchParams.append("page_size", String(params.page_size));
  if (params.cursor) searchParams.append("cursor", params.cursor);
  if (params.sort_by) searchParams.append("sort_by", params.sort_by);
  if (params.sort_order) searchParams.append("sort_order", params.sort_order);
  if (params.agent_uuids) {
    searchParams.append("agent_uuids", params.agent_uuids);
  } else if (params.agent_name) {
    searchParams.append("agent_name", params.agent_name);
  }
  if (params.campaign_ids) {
    searchParams.append("campaign_ids", params.campaign_ids);
  } else if (params.campaign_name) {
    searchParams.append("campaign_name", params.campaign_name);
  }
  if (params.from_number) searchParams.append("from_number", params.from_number);
  if (params.to_number) searchParams.append("to_number", params.to_number);
  if (params.call_category?.length) {
    for (const c of params.call_category) {
      searchParams.append("call_category", c);
    }
  }
  if (params.call_duration_operator !== undefined && params.call_duration !== undefined) {
    searchParams.append("call_duration_operator", params.call_duration_operator);
    searchParams.append("call_duration", String(params.call_duration));
  }
  const qs = searchParams.toString();
  const res = await axiosStudio.get<CallHistoryResponse>(
    `/sip-numbers/all/call-history${qs ? `?${qs}` : ""}`
  );
  const data = res.data;
  if (data.code !== undefined) {
    return data;
  }
  const legacy = data as unknown as {
    data?: { list?: CallHistoryItem[]; count?: number };
    meta?: { total?: number };
    status?: string;
  };
  const list = legacy.data?.list ?? [];
  return {
    code: 0,
    message: "success",
    data: {
      page: 1,
      page_size: list.length || 10,
      count: list.length,
      total: legacy.meta?.total ?? legacy.data?.count ?? 0,
      list,
    },
    status: "ok",
    meta: legacy.meta,
  };
}

export async function checkSipNumberEditStatus(
  phoneNumberIds: string[]
): Promise<SipNumberEditStatusItem[]> {
  const searchParams = new URLSearchParams();
  phoneNumberIds.forEach((id) => searchParams.append("phone_number_ids", id));
  const qs = searchParams.toString();
  const res = await axiosStudio.get(
    `/sip-numbers/all/edit-status${qs ? `?${qs}` : ""}`
  );
  const items = unwrapStudioData<SipNumberEditStatusItem[] | undefined>(
    res.data
  );
  return Array.isArray(items) ? items : [];
}
